#!/usr/bin/env bun
/**
 * Kitfly CLI - Turn your writing into a website
 *
 * Minimal by design. One dependency. Understand in an afternoon.
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { arch, platform } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSiteConfig } from "./shared.ts";

// Resolve paths relative to CLI location (works in binary too)
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Version: injected at compile time via --define, falls back to VERSION file
declare const __KITFLY_VERSION__: string | undefined;

function getVersion(): string {
	if (typeof __KITFLY_VERSION__ !== "undefined") return __KITFLY_VERSION__;
	try {
		return readFileSync(join(ROOT, "VERSION"), "utf-8").trim();
	} catch {
		return "0.0.0";
	}
}

// Get git info for extended version output
function getGitInfo(): { commit: string; branch: string; dirty: boolean } {
	try {
		const commit = execSync("git rev-parse --short HEAD", {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
		const branch = execSync("git rev-parse --abbrev-ref HEAD", {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
		const status = execSync("git status --porcelain", {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
		return { commit, branch, dirty: status.length > 0 };
	} catch {
		return { commit: "unknown", branch: "unknown", dirty: false };
	}
}

// Print extended version info with provenance
function printVersionExtended(): void {
	const git = getGitInfo();
	const bunVersion = typeof Bun !== "undefined" ? Bun.version : "unknown";

	console.log(`kitfly ${VERSION}`);
	console.log(`Git commit: ${git.commit}`);
	console.log(`Git branch: ${git.branch}`);
	console.log(`Git status: ${git.dirty ? "dirty (uncommitted changes)" : "clean"}`);
	console.log(`Bun: ${bunVersion}`);
	console.log(`Platform: ${platform()}/${arch()}`);
}

const VERSION = getVersion();

const HELP = `
kitfly v${VERSION} - Turn your writing into a website

Usage:
  kitfly dev [folder]     Start dev server with hot reload
  kitfly build [folder]   Build static site to dist/
  kitfly bundle [folder]  Build single-file HTML bundle to bundles/
  kitfly init [name]      Create new project from template
  kitfly update [version] Update standalone site code
  kitfly servers          List running dev servers
  kitfly stop <port|all>  Stop dev server(s)
  kitfly logs <port>      View daemon server logs
  kitfly version          Show version (use 'version extended' for details)
  kitfly help             Show this help

Dev options:
  --port <n>    Server port [env: KITFLY_DEV_PORT] (default: 3333)
  --host <h>    Server host [env: KITFLY_DEV_HOST] (default: localhost)
  --profile <p> Active content profile [env: KITFLY_PROFILE]
  --daemon, -d  Run in background, return immediately
  --json        Output JSON (implies --daemon)
  --no-open     Don't open browser

Build options:
  --out <dir>   Output directory [env: KITFLY_BUILD_OUT] (default: dist)
  --profile <p> Active content profile [env: KITFLY_PROFILE]
  --no-raw      Don't include raw markdown

Bundle options:
  --out <dir>   Output directory [env: KITFLY_BUNDLE_OUT] (default: bundles)
  --name <file> Bundle filename (default: bundle.html)
  --profile <p> Active content profile [env: KITFLY_PROFILE]
  --no-raw      Don't include raw markdown [env: KITFLY_BUNDLE_RAW]

Stop options:
  --force       Skip graceful shutdown, kill immediately

Logs options:
  --follow, -f  Follow log output (like tail -f)
  --clean       Remove log files for stopped servers

Update options:
  --check           Show current vs latest, no changes
  --dry-run         Show update plan, no changes
  --force           Overwrite modified managed files
  --yes             Non-interactive (assume yes)
  --migrations-only Run config migrations only
  --local           Use local kitfly source (dev/offline)

Examples:
  kitfly dev
  kitfly dev ./my-docs --port 4000 --daemon
  kitfly dev ./docs --json
  kitfly servers
  kitfly stop 4000
  kitfly stop all
  kitfly logs 3340
  kitfly logs 3340 --follow
  kitfly logs --clean
  kitfly build ./docs --out ./public
  kitfly bundle ./docs --out ./bundles --name docs.html
  kitfly init my-handbook
  kitfly update --check

Documentation: https://kitfly.app
`;

// Simple arg parser
function parseArgs(args: string[]): {
	positional: string[];
	flags: Record<string, string | boolean>;
} {
	const positional: string[] = [];
	const flags: Record<string, string | boolean> = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg.startsWith("--")) {
			const key = arg.slice(2);
			if (key.startsWith("no-")) {
				flags[key.slice(3)] = false;
			} else if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
				flags[key] = args[++i];
			} else {
				flags[key] = true;
			}
		} else if (arg.startsWith("-")) {
			flags[arg.slice(1)] = true;
		} else {
			positional.push(arg);
		}
	}

	return { positional, flags };
}

// Main
async function main() {
	const [cmd, ...rest] = process.argv.slice(2);
	const { positional, flags } = parseArgs(rest);

	switch (cmd) {
		case "dev":
		case "serve": {
			const folder = positional[0] || ".";
			const portRaw = flags.port as string | undefined;

			// Resolve absolute content root for registry (needed early for config loading)
			const contentRoot = resolve(process.cwd(), folder);

			// Resolve effective port following precedence: --port > env > site.yaml > default
			let port: number;
			if (portRaw) {
				// Explicit --port flag always wins
				port = parseInt(portRaw, 10);
				// Validate port
				if (Number.isNaN(port) || port < 1 || port > 65535) {
					console.error(`Error: Invalid port number\n`);
					console.error(`  "${portRaw}" is not a valid port number.`);
					console.error(`  Port must be a number between 1 and 65535.`);
					process.exit(1);
				}
			} else {
				// No explicit --port: resolve from env or site.yaml
				const envPort = process.env.KITFLY_DEV_PORT;

				// Try env var first
				if (envPort) {
					const parsed = parseInt(envPort, 10);
					port = Number.isNaN(parsed) ? 3333 : parsed;
				} else {
					// Try site.yaml
					try {
						const siteConfig = await loadSiteConfig(contentRoot);
						port = siteConfig?.server?.port ?? 3333;
					} catch {
						// site.yaml not found or invalid - use default
						port = 3333;
					}
				}
			}

			const host = (flags.host as string) || "localhost";
			const profile = (flags.profile as string | undefined) ?? process.env.KITFLY_PROFILE;

			// Warn if binding to all interfaces
			if (host === "0.0.0.0" || host === "::") {
				console.warn(`\x1b[33mWarning: Binding to all interfaces\x1b[0m`);
				console.warn(`  --host ${host} exposes the server to your network.`);
				console.warn(`  Use --host localhost for local-only access.\n`);
			}

			const open = flags.open !== false;
			const daemon = flags.daemon === true || flags.d === true || flags.json === true;
			const json = flags.json === true;

			// Import registry for conflict checking
			const {
				checkPortConflict,
				findPidOnPort,
				findServerByPort,
				registerServer,
				getLogPath,
				getKitflyHome,
			} = await import("./server-registry.ts");

			// Check for existing server on same port + content root
			const existing = await findServerByPort(port);
			if (existing && existing.contentRoot === contentRoot) {
				// Same server already running - report and exit
				if (json) {
					console.log(
						JSON.stringify({
							status: "already_running",
							pid: existing.pid,
							port: existing.port,
							url: `http://${existing.host === "0.0.0.0" ? "localhost" : existing.host}:${existing.port}`,
							contentRoot: existing.contentRoot,
						}),
					);
				} else {
					console.log(`Server already running on port ${port} for ${contentRoot}`);
					console.log(`  PID: ${existing.pid}`);
					console.log(
						`  URL: http://${existing.host === "0.0.0.0" ? "localhost" : existing.host}:${existing.port}`,
					);
				}
				process.exit(0);
			}

			// Check for port conflicts
			const conflict = await checkPortConflict(port, contentRoot);
			if (conflict) {
				if (conflict.type === "kitfly") {
					console.error(`Error: Port ${port} is already in use\n`);
					console.error(`  Another kitfly server is running:`);
					console.error(`    Content: ${conflict.contentRoot}`);
					console.error(`    PID:     ${conflict.pid}`);
					console.error(`\n  Options:`);
					console.error(`    • Use a different port: kitfly dev ${folder} --port ${port + 1}`);
					console.error(`    • Stop the other server: kitfly stop ${port}`);
				} else {
					console.error(`Error: Port ${port} is in use by another process\n`);
					console.error(`  Process: ${conflict.processName || "unknown"} (PID ${conflict.pid})`);
					console.error(`\n  Choose a different port: kitfly dev ${folder} --port ${port + 1}`);
				}
				process.exit(1);
			}

			if (daemon) {
				// Daemon mode: spawn detached process using shell redirection
				const { mkdir, writeFile, open: fsOpen } = await import("node:fs/promises");
				const logsDir = join(getKitflyHome(), "logs");
				await mkdir(logsDir, { recursive: true });

				const logPath = getLogPath(port);
				const devScript = join(ROOT, "scripts/dev.ts");

				// Truncate log file on each daemon start (log rotation)
				await writeFile(logPath, "");

				// Build command with shell redirection for logging
				// Pass --log-format structured so dev.ts enables structured request logging
				const profileArg = profile ? ` --profile "${profile}"` : "";

				// Open log file as a write handle to pass as stdout/stderr for the child
				const logFd = await fsOpen(logPath, "a");

				let proc: ReturnType<typeof Bun.spawn>;
				if (process.platform === "win32") {
					// On Windows, use Bun.spawn with detached:true and stdio redirected to log file.
					// nohup and sh -c are not available; Bun's detached mode achieves the same.
					const args = [
						"bun",
						"run",
						devScript,
						folder,
						"--port",
						String(port),
						"--host",
						host,
						...(profile ? ["--profile", profile] : []),
						"--no-open",
						"--log-format",
						"structured",
					];
					proc = Bun.spawn(args, {
						cwd: process.cwd(),
						stdout: logFd.fd,
						stderr: logFd.fd,
						stdin: "ignore",
						// @ts-ignore — detached is a valid Bun.spawn option
						detached: true,
					});
					proc.unref();
					await logFd.close();
					// Give Windows a moment to spawn the child before proc.exited resolves
					await new Promise((resolve) => setTimeout(resolve, 200));
				} else {
					// Unix: nohup via sh -c keeps the process alive after terminal close
					await logFd.close();
					const shellCmd = `nohup bun run "${devScript}" "${folder}" --port ${port} --host "${host}"${profileArg} --no-open --log-format structured > "${logPath}" 2>&1 &`;
					proc = Bun.spawn(["sh", "-c", shellCmd], {
						cwd: process.cwd(),
						stdout: "ignore",
						stderr: "ignore",
						stdin: "ignore",
					});
					// Wait for shell to spawn the background process
					await proc.exited;
				}

				// Give server a moment to start
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Find the actual server PID by checking what's listening on the port
				const serverPid = findPidOnPort(port);

				if (!serverPid) {
					// Server didn't start - read log for error
					const { readFile } = await import("node:fs/promises");
					const logContent = await readFile(logPath, "utf-8").catch(() => "");
					console.error("Error: Server failed to start");
					if (logContent) {
						console.error("\nLog output:");
						console.error(logContent.slice(0, 500));
					}
					process.exit(1);
				}

				// Register server
				await registerServer({
					pid: serverPid,
					port,
					host,
					contentRoot,
					startTime: Date.now(),
					kitflyVersion: VERSION,
					daemonized: true,
				});

				const url = `http://${host === "0.0.0.0" ? "localhost" : host}:${port}`;

				if (json) {
					console.log(
						JSON.stringify({
							status: "started",
							pid: serverPid,
							port,
							url,
							contentRoot,
							logFile: logPath,
						}),
					);
				} else {
					console.log(`Server started in background`);
					console.log(`  PID:  ${serverPid}`);
					console.log(`  URL:  ${url}`);
					console.log(`  Logs: ${logPath}`);
					console.log(`\nTo stop: kitfly stop ${port}`);
				}
			} else {
				// Foreground mode: run directly
				const { dev } = await import("../scripts/dev.ts");
				await dev({ folder, port, host, open, profile });
			}
			break;
		}

		case "build": {
			const folder = positional[0] || ".";
			const out = (flags.out as string) || "dist";
			const raw = flags.raw !== false; // --no-raw disables raw markdown
			const profile = (flags.profile as string | undefined) ?? process.env.KITFLY_PROFILE;
			const { build } = await import("../scripts/build.ts");
			await build({ folder, out, raw, profile });
			break;
		}

		case "bundle": {
			const folder = positional[0] || ".";
			const out = (flags.out as string) || "bundles";
			const name = (flags.name as string) || "bundle.html";
			const raw = flags.raw !== false; // --no-raw disables raw markdown
			const profile = (flags.profile as string | undefined) ?? process.env.KITFLY_PROFILE;
			const { bundleSite } = await import("../scripts/bundle.ts");
			await bundleSite({ folder, out, name, raw, profile });
			break;
		}

		case "init": {
			const name = positional[0];
			if (!name) {
				console.error("Error: Project name required\n");
				console.error(
					"Usage: kitfly init <name> [--template <type>] [--standalone] [--ai-assist] [--no-git]",
				);
				const { listTemplates } = await import("./templates/driver.ts");
				const names = listTemplates()
					.map((t) => t.id)
					.join(", ");
				console.error(`\nTemplates: ${names}`);
				console.error("\nOptions:");
				console.error("  --standalone    Copy site code for self-contained operation");
				console.error("  --ai-assist     Add AI assistance instrumentation (AGENTS.md, roles)");
				console.error("  --no-git        Skip git initialization");
				process.exit(1);
			}
			const { init } = await import("./commands/init.ts");
			await init(name, {
				template: (flags.template || flags.t) as string | undefined,
				git: flags.git !== false && flags["no-git"] !== true,
				standalone: flags.standalone === true,
				aiAssist: flags["ai-assist"] === true || flags.aiAssist === true,
				brand: flags.brand as string | undefined,
				brandUrl: (flags["brand-url"] || flags.brandUrl) as string | undefined,
			});
			break;
		}

		case "update": {
			const version = positional[0];
			const { update } = await import("./commands/update.ts");
			await update(version, {
				check: flags.check === true,
				dryRun: flags["dry-run"] === true || flags.dryRun === true,
				force: flags.force === true,
				yes: flags.yes === true,
				migrationsOnly: flags["migrations-only"] === true || flags.migrationsOnly === true,
				local: flags.local === true,
			});
			break;
		}

		case "servers":
		case "ps": {
			const { listServers, discoverOrphans } = await import("./server-registry.ts");
			const servers = await listServers();
			const json = flags.json === true;
			const showAll = flags.all === true;

			if (json) {
				const orphans = showAll ? await discoverOrphans() : [];
				console.log(JSON.stringify({ servers, orphans }));
			} else if (servers.length === 0 && !showAll) {
				console.log("No kitfly servers running");
			} else {
				if (servers.length > 0) {
					console.log("PORT   PID      CONTENT ROOT");
					console.log("─".repeat(60));
					for (const s of servers) {
						const portStr = String(s.port).padEnd(6);
						const pidStr = String(s.pid).padEnd(8);
						console.log(`${portStr} ${pidStr} ${s.contentRoot}`);
					}
					console.log(`\n${servers.length} server(s) running`);
				} else {
					console.log("No kitfly servers running");
				}

				if (showAll) {
					const orphans = await discoverOrphans();
					if (orphans.length > 0) {
						console.log(`\nOrphaned kitfly processes (not in registry):`);
						for (const o of orphans) {
							console.log(`  PID ${o.pid}: ${o.cmd}`);
						}
					}
				}
			}
			break;
		}

		case "stop": {
			const target = positional[0];
			if (!target) {
				console.error("Error: Specify port number or 'all'\n");
				console.error("Usage: kitfly stop <port|all>");
				process.exit(1);
			}

			const { stopServer, stopAllServers } = await import("./server-registry.ts");
			const force = flags.force === true;

			if (target === "all") {
				const result = await stopAllServers(force);
				if (result.stopped === 0 && result.failed === 0 && result.orphans === 0) {
					console.log("No servers to stop");
				} else {
					if (result.stopped > 0) {
						console.log(`Stopped ${result.stopped} server(s)`);
					}
					if (result.failed > 0) {
						console.log(`Failed to stop ${result.failed} server(s)`);
					}
					if (result.orphans > 0) {
						console.log(`Stopped ${result.orphans} orphaned process(es)`);
					}
				}
			} else {
				const port = parseInt(target, 10);
				if (Number.isNaN(port)) {
					console.error(`Error: Invalid port number: ${target}`);
					process.exit(1);
				}
				const result = await stopServer(port, force);
				if (result.success) {
					console.log(result.message);
				} else {
					console.error(`Error: ${result.message}`);
					process.exit(1);
				}
			}
			break;
		}

		case "logs": {
			const { getLogPath, cleanLogs } = await import("./server-registry.ts");

			if (flags.clean === true) {
				const removed = await cleanLogs();
				if (removed.length === 0) {
					console.log("No stale log files to clean");
				} else {
					for (const f of removed) {
						console.log(`Removed: ${f}`);
					}
					console.log(`\nCleaned ${removed.length} stale log file(s)`);
				}
				break;
			}

			const portStr = positional[0];
			if (!portStr) {
				console.error("Error: Specify port number or --clean\n");
				console.error("Usage: kitfly logs <port> [--follow] | kitfly logs --clean");
				process.exit(1);
			}

			const logPort = parseInt(portStr, 10);
			if (Number.isNaN(logPort)) {
				console.error(`Error: Invalid port number: ${portStr}`);
				process.exit(1);
			}

			const logFile = getLogPath(logPort);
			const follow = flags.follow === true || flags.f === true;

			if (follow) {
				if (process.platform !== "win32") {
					// Unix: tail -f is available and efficient
					const proc = Bun.spawn(["tail", "-f", logFile], {
						stdout: "inherit",
						stderr: "inherit",
					});
					await proc.exited;
				} else {
					// Windows: tail -f is not available; poll the file for new content
					const { watch } = await import("node:fs");
					const { open: fsOpen } = await import("node:fs/promises");
					let fd: import("node:fs/promises").FileHandle;
					try {
						fd = await fsOpen(logFile, "r");
					} catch {
						console.error(`No log file found for port ${logPort}`);
						console.error(`  Expected: ${logFile}`);
						process.exit(1);
					}
					// Print existing content first
					const existing = await fd.readFile("utf-8");
					if (existing.length > 0) process.stdout.write(existing);
					let offset = Buffer.byteLength(existing, "utf-8");
					// Watch for changes and stream new bytes
					const watcher = watch(logFile, async () => {
						const buf = Buffer.alloc(65536);
						const { bytesRead } = await fd.read(buf, 0, buf.length, offset);
						if (bytesRead > 0) {
							offset += bytesRead;
							process.stdout.write(buf.subarray(0, bytesRead));
						}
					});
					// Keep running until Ctrl+C
					await new Promise<void>((resolve) => {
						process.on("SIGINT", () => {
							watcher.close();
							void fd.close();
							resolve();
						});
					});
				}
			} else {
				const { readFile } = await import("node:fs/promises");
				try {
					const content = await readFile(logFile, "utf-8");
					if (content.length === 0) {
						console.log(`Log file is empty: ${logFile}`);
					} else {
						process.stdout.write(content);
					}
				} catch {
					console.error(`No log file found for port ${logPort}`);
					console.error(`  Expected: ${logFile}`);
					process.exit(1);
				}
			}
			break;
		}

		case "version":
		case "-v":
		case "--version": {
			const extended = positional.includes("extended") || flags.extended;
			if (extended) {
				printVersionExtended();
			} else {
				console.log(VERSION);
			}
			break;
		}

		case "help":
		case "-h":
		case "--help":
		case undefined:
			console.log(HELP);
			break;

		default:
			console.error(`Unknown command: ${cmd}\n`);
			console.log(HELP);
			process.exit(1);
	}
}

main().catch((err) => {
	console.error(err.message || err);
	process.exit(1);
});
