/**
 * Server Registry - Track running kitfly dev servers
 *
 * Registry location: ~/.kitfly/servers.json
 *
 * Used by:
 * - kitfly dev --daemon (register new server)
 * - kitfly servers (list running)
 * - kitfly stop (terminate server)
 */

import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ServerEntry {
	pid: number;
	port: number;
	host: string;
	contentRoot: string;
	startTime: number;
	kitflyVersion: string;
	daemonized: boolean;
}

interface ServerRegistry {
	version: 1;
	servers: ServerEntry[];
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const KITFLY_HOME = join(homedir(), ".kitfly");
const REGISTRY_PATH = join(KITFLY_HOME, "servers.json");
const LOGS_DIR = join(KITFLY_HOME, "logs");

export function getKitflyHome(): string {
	return KITFLY_HOME;
}

export function getLogsDir(): string {
	return LOGS_DIR;
}

export function getLogPath(port: number): string {
	return join(LOGS_DIR, `${port}.log`);
}

// ---------------------------------------------------------------------------
// Registry I/O
// ---------------------------------------------------------------------------

async function ensureKitflyHome(): Promise<void> {
	await mkdir(KITFLY_HOME, { recursive: true });
	await mkdir(LOGS_DIR, { recursive: true });
}

async function readRegistry(): Promise<ServerRegistry> {
	try {
		const content = await readFile(REGISTRY_PATH, "utf-8");
		return JSON.parse(content) as ServerRegistry;
	} catch {
		return { version: 1, servers: [] };
	}
}

async function writeRegistry(registry: ServerRegistry): Promise<void> {
	await ensureKitflyHome();
	await writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

// ---------------------------------------------------------------------------
// Process utilities (via sysprims)
// ---------------------------------------------------------------------------

import { listeningPorts, processList, procGet } from "@3leaps/sysprims";

/**
 * Windows fallback: parse `netstat -ano` to find PID listening on a port.
 * Returns null if not found or on error.
 */
function findPidOnPortWindows(port: number): number | null {
	try {
		const result = Bun.spawnSync(["netstat", "-ano", "-p", "TCP"], {
			stdout: "pipe",
			stderr: "pipe",
		});
		if (result.exitCode !== 0) return null;
		const output = new TextDecoder().decode(result.stdout);
		// Each LISTENING line looks like:
		//   TCP    0.0.0.0:3333     0.0.0.0:0     LISTENING     1234
		//   TCP    [::]:3333        [::]:0        LISTENING     1234
		const portStr = String(port);
		for (const line of output.split(/\r?\n/)) {
			if (!line.includes("LISTENING")) continue;
			// Match the local address column containing :<port>
			const m = line.match(/^\s*TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)/i);
			if (m && m[1] === portStr) {
				const pid = parseInt(m[2], 10);
				return Number.isNaN(pid) ? null : pid;
			}
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Find PID listening on a port.
 * When multiple processes bind the same port (e.g., nohup shell + bun child),
 * prefer the bun process over shell wrappers.
 * Falls back to netstat on Windows when sysprims is unsupported.
 */
export function findPidOnPort(port: number): number | null {
	try {
		const result = listeningPorts({ local_port: port });
		if (result.bindings.length === 0) return null;
		if (result.bindings.length === 1) return result.bindings[0].pid ?? null;

		// Multiple bindings — prefer the bun process over shell wrapper
		for (const binding of result.bindings) {
			if (binding.process?.name.includes("bun")) {
				return binding.pid ?? null;
			}
		}
		// Fallback: last binding (child is usually listed after parent)
		return result.bindings[result.bindings.length - 1].pid ?? null;
	} catch {
		// sysprims doesn't support port bindings on this platform (e.g. Windows)
		if (process.platform === "win32") {
			return findPidOnPortWindows(port);
		}
		return null;
	}
}

/**
 * Get process info
 */
function getProcessInfo(pid: number): { name: string } | null {
	const proc = procGet(pid);
	return proc ? { name: proc.name } : null;
}

// ---------------------------------------------------------------------------
// Process validation
// ---------------------------------------------------------------------------

async function isProcessAlive(entry: ServerEntry): Promise<boolean> {
	// Never signal pid <= 0 — POSIX kill(0) signals the process group,
	// kill(-1) signals every process owned by the user
	if (entry.pid <= 0) return false;
	try {
		process.kill(entry.pid, 0);
		return true;
	} catch {
		return false;
	}
}

async function isPortBoundByProcess(port: number, pid: number): Promise<boolean> {
	const actualPid = await findPidOnPort(port);
	if (actualPid === null) return false;
	return actualPid === pid;
}

// ---------------------------------------------------------------------------
// Registry operations
// ---------------------------------------------------------------------------

/**
 * Clean stale entries from registry
 */
export async function cleanRegistry(): Promise<ServerEntry[]> {
	const registry = await readRegistry();
	const alive: ServerEntry[] = [];
	const removed: ServerEntry[] = [];

	for (const entry of registry.servers) {
		const processAlive = await isProcessAlive(entry);
		const portBound = processAlive && (await isPortBoundByProcess(entry.port, entry.pid));

		if (processAlive && portBound) {
			alive.push(entry);
		} else {
			removed.push(entry);
		}
	}

	if (removed.length > 0) {
		await writeRegistry({ version: 1, servers: alive });
	}

	return alive;
}

/**
 * Get all registered servers (after cleaning stale entries)
 */
export async function listServers(): Promise<ServerEntry[]> {
	return cleanRegistry();
}

/**
 * Find server by port
 */
export async function findServerByPort(port: number): Promise<ServerEntry | null> {
	const servers = await listServers();
	return servers.find((s) => s.port === port) ?? null;
}

/**
 * Find server by content root
 */
export async function findServerByContentRoot(contentRoot: string): Promise<ServerEntry | null> {
	const servers = await listServers();
	return servers.find((s) => s.contentRoot === contentRoot) ?? null;
}

/**
 * Register a new server
 */
export async function registerServer(entry: ServerEntry): Promise<void> {
	const servers = await listServers();
	// Remove any existing entry for same port (shouldn't happen, but be safe)
	const filtered = servers.filter((s) => s.port !== entry.port);
	filtered.push(entry);
	await writeRegistry({ version: 1, servers: filtered });
}

/**
 * Unregister a server by port
 */
export async function unregisterServer(port: number): Promise<boolean> {
	const registry = await readRegistry();
	const before = registry.servers.length;
	registry.servers = registry.servers.filter((s) => s.port !== port);
	if (registry.servers.length < before) {
		await writeRegistry(registry);
		return true;
	}
	return false;
}

// ---------------------------------------------------------------------------
// Port conflict detection
// ---------------------------------------------------------------------------

export interface PortConflict {
	type: "kitfly" | "other";
	port: number;
	pid: number;
	processName?: string;
	contentRoot?: string;
}

/**
 * Check if a port is available or identify what's using it
 */
export async function checkPortConflict(
	port: number,
	contentRoot: string,
): Promise<PortConflict | null> {
	// First check our registry
	const existingServer = await findServerByPort(port);
	if (existingServer) {
		// Same content root = can reuse
		if (existingServer.contentRoot === contentRoot) {
			return null; // No conflict - same server
		}
		return {
			type: "kitfly",
			port,
			pid: existingServer.pid,
			contentRoot: existingServer.contentRoot,
		};
	}

	// Check if port is in use by another process using lsof
	const pid = await findPidOnPort(port);
	if (pid !== null) {
		const proc = await getProcessInfo(pid);
		return {
			type: "other",
			port,
			pid,
			processName: proc?.name,
		};
	}

	return null;
}

// ---------------------------------------------------------------------------
// Server lifecycle
// ---------------------------------------------------------------------------

/**
 * Stop a server by port
 */
export async function stopServer(
	port: number,
	force = false,
): Promise<{ success: boolean; message: string }> {
	const server = await findServerByPort(port);
	if (!server) {
		return { success: false, message: `No server running on port ${port}` };
	}

	// Never signal pid <= 0 — remove the bad entry instead
	if (server.pid <= 0) {
		await unregisterServer(port);
		return {
			success: false,
			message: `Removed invalid registry entry for port ${port} (pid: ${server.pid})`,
		};
	}

	try {
		// Send signal
		process.kill(server.pid, force ? "SIGKILL" : "SIGTERM");

		// If graceful, wait a bit then force if still running
		if (!force) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			try {
				process.kill(server.pid, 0); // Check if still alive
				// Still alive - wait more
				await new Promise((resolve) => setTimeout(resolve, 2000));
				try {
					process.kill(server.pid, 0);
					// Still alive after 3s - force kill
					process.kill(server.pid, "SIGKILL");
				} catch {
					// Dead now
				}
			} catch {
				// Dead
			}
		}
	} catch (err) {
		// ESRCH means process doesn't exist - that's fine
		if ((err as NodeJS.ErrnoException).code !== "ESRCH") {
			return {
				success: false,
				message: `Failed to stop server (PID ${server.pid}): ${err}`,
			};
		}
	}

	await unregisterServer(port);
	return { success: true, message: `Stopped server on port ${port}` };
}

/**
 * Discover kitfly dev processes not tracked in the registry.
 * Finds bun processes whose cmdline includes "scripts/dev.ts".
 */
export async function discoverOrphans(): Promise<Array<{ pid: number; cmd: string }>> {
	const snapshot = processList({ name_contains: "bun" });
	const registered = await listServers();
	const registeredPids = new Set(registered.map((s) => s.pid));

	return snapshot.processes
		.filter((p) => {
			if (registeredPids.has(p.pid)) return false;
			return p.cmdline.some((arg) => arg.includes("scripts/dev.ts"));
		})
		.map((p) => ({ pid: p.pid, cmd: p.cmdline.join(" ") }));
}

/**
 * Stop all servers, then sweep for orphaned kitfly processes
 */
export async function stopAllServers(
	force = false,
): Promise<{ stopped: number; failed: number; orphans: number }> {
	const servers = await listServers();
	let stopped = 0;
	let failed = 0;

	for (const server of servers) {
		const result = await stopServer(server.port, force);
		if (result.success) {
			stopped++;
		} else {
			failed++;
		}
	}

	// Sweep for orphaned kitfly processes not in the registry
	let orphans = 0;
	const orphanList = await discoverOrphans();
	for (const orphan of orphanList) {
		try {
			process.kill(orphan.pid, force ? "SIGKILL" : "SIGTERM");
			orphans++;
		} catch {
			// Already dead or permission denied
		}
	}

	return { stopped, failed, orphans };
}

// ---------------------------------------------------------------------------
// Log cleanup
// ---------------------------------------------------------------------------

/**
 * Remove log files for ports not in the server registry.
 * Returns list of removed log file paths.
 */
export async function cleanLogs(): Promise<string[]> {
	const servers = await listServers();
	const activePorts = new Set(servers.map((s) => s.port));
	const removed: string[] = [];

	let entries: string[];
	try {
		entries = await readdir(LOGS_DIR);
	} catch {
		return removed; // No logs dir — nothing to clean
	}

	for (const entry of entries) {
		const match = entry.match(/^(\d+)\.log$/);
		if (!match) continue;
		const port = parseInt(match[1], 10);
		if (!activePorts.has(port)) {
			const logPath = join(LOGS_DIR, entry);
			await unlink(logPath).catch(() => {});
			removed.push(logPath);
		}
	}

	return removed;
}
