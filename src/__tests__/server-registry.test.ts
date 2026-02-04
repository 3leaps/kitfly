/**
 * Tests for server registry - track running kitfly dev servers
 *
 * Testability notes:
 * -  Registry I/O functions (registerServer, listServers, findServerByPort,
 *    findServerByContentRoot, unregisterServer, cleanRegistry) all read/write
 *    to a hardcoded REGISTRY_PATH (~/.kitfly/servers.json) with no override
 *    mechanism, AND call isProcessAlive() which uses process.kill(pid, 0).
 *    Testing these would require either mocking fs + process, or writing to the
 *    real ~/.kitfly directory (risky - could affect running servers).
 * -  stopServer / stopAllServers send real signals (SIGTERM/SIGKILL) — excluded
 *    per constraint.
 * -  findPidOnPort, discoverOrphans, getProcessInfo depend on @3leaps/sysprims
 *    which queries real OS state — excluded per constraint.
 * -  cleanLogs reads from hardcoded LOGS_DIR and calls listServers — same
 *    issues as registry I/O.
 *
 * What IS tested below: pure path functions, type shape validation, the log
 * filename regex pattern (extracted from cleanLogs logic), and structural
 * contracts that do not require I/O.
 */

import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, sep } from "node:path";
import { describe, expect, it } from "vitest";
import {
	getKitflyHome,
	getLogPath,
	getLogsDir,
	type PortConflict,
	type ServerEntry,
} from "../server-registry.ts";

// ---------------------------------------------------------------------------
// Path utility tests (pure functions)
// ---------------------------------------------------------------------------

describe("getKitflyHome", () => {
	it("returns ~/.kitfly directory path", () => {
		const result = getKitflyHome();
		const expected = join(homedir(), ".kitfly");
		expect(result).toBe(expected);
	});

	it("returns consistent value across multiple calls", () => {
		const first = getKitflyHome();
		const second = getKitflyHome();
		expect(first).toBe(second);
	});

	it("includes home directory as prefix", () => {
		const result = getKitflyHome();
		expect(result).toContain(homedir());
	});

	it("ends with .kitfly", () => {
		const result = getKitflyHome();
		expect(result.endsWith(".kitfly")).toBe(true);
	});
});

describe("getLogsDir", () => {
	it("returns ~/.kitfly/logs directory path", () => {
		const result = getLogsDir();
		const kitflyHome = getKitflyHome();
		expect(result).toBe(join(kitflyHome, "logs"));
	});

	it("is subdirectory of kitfly home", () => {
		const result = getLogsDir();
		const kitflyHome = getKitflyHome();
		expect(result).toContain(kitflyHome);
	});

	it("ends with logs", () => {
		const result = getLogsDir();
		expect(result.endsWith("logs")).toBe(true);
	});

	it("returns consistent value across multiple calls", () => {
		const first = getLogsDir();
		const second = getLogsDir();
		expect(first).toBe(second);
	});
});

describe("getLogPath", () => {
	it("returns log file path for given port", () => {
		const port = 3000;
		const result = getLogPath(port);
		const expected = join(getLogsDir(), `${port}.log`);
		expect(result).toBe(expected);
	});

	it("includes port number in filename", () => {
		const port = 8080;
		const result = getLogPath(port);
		expect(result).toContain("8080.log");
	});

	it("includes logs directory in path", () => {
		const port = 5000;
		const result = getLogPath(port);
		expect(result).toContain(join(getLogsDir(), "5000.log"));
	});

	it("handles different port numbers", () => {
		const ports = [3000, 8080, 5000, 3001, 9999];
		for (const port of ports) {
			const result = getLogPath(port);
			expect(result).toContain(`${port}.log`);
			expect(result).toContain(getLogsDir());
		}
	});

	it("adds .log extension to port number", () => {
		const result = getLogPath(3000);
		expect(result).toMatch(/\d+\.log$/);
		expect(result.endsWith(".log")).toBe(true);
	});

	it("handles edge case port numbers", () => {
		// Minimum port
		const minPort = getLogPath(1);
		expect(minPort).toBe(join(getLogsDir(), "1.log"));

		// Maximum valid port
		const maxPort = getLogPath(65535);
		expect(maxPort).toBe(join(getLogsDir(), "65535.log"));
	});

	it("produces unique paths for different ports", () => {
		const paths = [3000, 3001, 3002].map((p) => getLogPath(p));
		const uniquePaths = new Set(paths);
		expect(uniquePaths.size).toBe(paths.length);
	});

	it("returns string path", () => {
		const result = getLogPath(3000);
		expect(typeof result).toBe("string");
	});
});

// ---------------------------------------------------------------------------
// Type tests
// ---------------------------------------------------------------------------

describe("ServerEntry type", () => {
	it("can create valid server entry", () => {
		const entry: ServerEntry = {
			pid: 12345,
			port: 3000,
			host: "localhost",
			contentRoot: "/home/user/project",
			startTime: Date.now(),
			kitflyVersion: "0.1.0",
			daemonized: true,
		};

		expect(entry.pid).toBe(12345);
		expect(entry.port).toBe(3000);
		expect(entry.host).toBe("localhost");
		expect(entry.contentRoot).toBe("/home/user/project");
		expect(typeof entry.startTime).toBe("number");
		expect(entry.kitflyVersion).toBe("0.1.0");
		expect(entry.daemonized).toBe(true);
	});

	it("server entry with different values", () => {
		const entry: ServerEntry = {
			pid: 99999,
			port: 8080,
			host: "0.0.0.0",
			contentRoot: "/var/www/site",
			startTime: 1000000000,
			kitflyVersion: "0.2.0",
			daemonized: false,
		};

		expect(entry.pid).toBe(99999);
		expect(entry.port).toBe(8080);
		expect(entry.daemonized).toBe(false);
	});

	it("server entry properties are required", () => {
		// This is more of a type check - the following would not compile in TS
		// but we test the runtime behavior is sensible
		const entry: ServerEntry = {
			pid: 123,
			port: 3000,
			host: "localhost",
			contentRoot: "/path",
			startTime: 0,
			kitflyVersion: "0.1.0",
			daemonized: false,
		};

		// All properties should be defined
		expect(entry).toHaveProperty("pid");
		expect(entry).toHaveProperty("port");
		expect(entry).toHaveProperty("host");
		expect(entry).toHaveProperty("contentRoot");
		expect(entry).toHaveProperty("startTime");
		expect(entry).toHaveProperty("kitflyVersion");
		expect(entry).toHaveProperty("daemonized");
	});
});

// ---------------------------------------------------------------------------
// Path composition tests
// ---------------------------------------------------------------------------

describe("Path relationships", () => {
	it("logs directory is under kitfly home", () => {
		const kitflyHome = getKitflyHome();
		const logsDir = getLogsDir();
		expect(logsDir.startsWith(kitflyHome)).toBe(true);
	});

	it("log path is under logs directory", () => {
		const logsDir = getLogsDir();
		const logPath = getLogPath(3000);
		expect(logPath.startsWith(logsDir)).toBe(true);
	});

	it("all paths are absolute", () => {
		const kitflyHome = getKitflyHome();
		const logsDir = getLogsDir();
		const logPath = getLogPath(3000);

		expect(isAbsolute(kitflyHome)).toBe(true);
		expect(isAbsolute(logsDir)).toBe(true);
		expect(isAbsolute(logPath)).toBe(true);
	});

	it("nested hierarchy is correct", () => {
		const kitflyHome = getKitflyHome();
		const logsDir = getLogsDir();
		const logPath = getLogPath(8080);

		// logPath should contain logsDir should contain kitflyHome
		expect(logPath).toContain(logsDir);
		expect(logsDir).toContain(kitflyHome);
		expect(kitflyHome).toContain(homedir());
	});
});

// ---------------------------------------------------------------------------
// Edge case tests
// ---------------------------------------------------------------------------

describe("Path edge cases", () => {
	it("handles zero port number", () => {
		const result = getLogPath(0);
		expect(result).toBe(join(getLogsDir(), "0.log"));
	});

	it("handles large port numbers", () => {
		const result = getLogPath(999999);
		expect(result).toContain("999999.log");
	});

	it("handles port at boundaries", () => {
		expect(getLogPath(1)).toContain("1.log");
		expect(getLogPath(65535)).toContain("65535.log");
	});

	it("log paths with same port are identical", () => {
		const path1 = getLogPath(3000);
		const path2 = getLogPath(3000);
		expect(path1).toBe(path2);
	});

	it("different ports produce different paths", () => {
		const path1 = getLogPath(3000);
		const path2 = getLogPath(3001);
		expect(path1).not.toBe(path2);
	});
});

// ---------------------------------------------------------------------------
// String format tests
// ---------------------------------------------------------------------------

describe("Path string formats", () => {
	it("kitfly home path format is valid", () => {
		const result = getKitflyHome();
		// Should be a valid path string (not empty, is string)
		expect(result.length).toBeGreaterThan(0);
		expect(typeof result).toBe("string");
		// Should not have trailing slash
		expect(result.endsWith("/")).toBe(false);
	});

	it("logs dir path format is valid", () => {
		const result = getLogsDir();
		expect(result.length).toBeGreaterThan(0);
		expect(typeof result).toBe("string");
		expect(result.endsWith("/")).toBe(false);
	});

	it("log path format is valid", () => {
		const result = getLogPath(3000);
		expect(result.length).toBeGreaterThan(0);
		expect(typeof result).toBe("string");
		expect(result).toMatch(/\d+\.log$/);
		// Should not have trailing slash
		expect(result.endsWith("/")).toBe(false);
	});

	it("paths use OS-native separators consistently", () => {
		// path.join uses OS-native separators (/ on Unix, \ on Windows)
		const kitflyHome = getKitflyHome();
		const logsDir = getLogsDir();
		const logPath = getLogPath(3000);

		// All paths should be well-formed and non-empty
		expect(kitflyHome.length).toBeGreaterThan(0);
		expect(logsDir.length).toBeGreaterThan(0);
		expect(logPath.length).toBeGreaterThan(0);
	});
});

// ---------------------------------------------------------------------------
// PortConflict type shape
// ---------------------------------------------------------------------------

describe("PortConflict type", () => {
	it("can represent a kitfly conflict", () => {
		const conflict: PortConflict = {
			type: "kitfly",
			port: 3000,
			pid: 12345,
			contentRoot: "/home/user/project",
		};

		expect(conflict.type).toBe("kitfly");
		expect(conflict.port).toBe(3000);
		expect(conflict.pid).toBe(12345);
		expect(conflict.contentRoot).toBe("/home/user/project");
		expect(conflict.processName).toBeUndefined();
	});

	it("can represent an external process conflict", () => {
		const conflict: PortConflict = {
			type: "other",
			port: 8080,
			pid: 54321,
			processName: "nginx",
		};

		expect(conflict.type).toBe("other");
		expect(conflict.port).toBe(8080);
		expect(conflict.pid).toBe(54321);
		expect(conflict.processName).toBe("nginx");
		expect(conflict.contentRoot).toBeUndefined();
	});

	it("type field only allows kitfly or other", () => {
		const kitflyConflict: PortConflict = {
			type: "kitfly",
			port: 3000,
			pid: 1,
		};
		const otherConflict: PortConflict = {
			type: "other",
			port: 3000,
			pid: 1,
		};
		expect(["kitfly", "other"]).toContain(kitflyConflict.type);
		expect(["kitfly", "other"]).toContain(otherConflict.type);
	});

	it("optional fields can be omitted", () => {
		const conflict: PortConflict = {
			type: "kitfly",
			port: 3000,
			pid: 100,
		};

		// processName and contentRoot are optional
		expect(conflict).not.toHaveProperty("processName");
		expect(conflict).not.toHaveProperty("contentRoot");
	});

	it("can have both optional fields set", () => {
		const conflict: PortConflict = {
			type: "kitfly",
			port: 3000,
			pid: 100,
			processName: "bun",
			contentRoot: "/tmp/site",
		};

		expect(conflict.processName).toBe("bun");
		expect(conflict.contentRoot).toBe("/tmp/site");
	});
});

// ---------------------------------------------------------------------------
// Log filename regex (same pattern used by cleanLogs)
// ---------------------------------------------------------------------------

describe("Log filename pattern", () => {
	// cleanLogs uses /^(\d+)\.log$/ to match log files — test this regex
	// to ensure the logic matches expected filenames
	const LOG_FILE_PATTERN = /^(\d+)\.log$/;

	it("matches standard port log files", () => {
		expect(LOG_FILE_PATTERN.test("3000.log")).toBe(true);
		expect(LOG_FILE_PATTERN.test("8080.log")).toBe(true);
		expect(LOG_FILE_PATTERN.test("1.log")).toBe(true);
		expect(LOG_FILE_PATTERN.test("65535.log")).toBe(true);
	});

	it("extracts port number from filename", () => {
		const match = "3000.log".match(LOG_FILE_PATTERN);
		expect(match).not.toBeNull();
		expect(match?.[1]).toBe("3000");
		expect(parseInt(match?.[1] ?? "", 10)).toBe(3000);
	});

	it("extracts port from high-numbered filename", () => {
		const match = "65535.log".match(LOG_FILE_PATTERN);
		expect(match).not.toBeNull();
		expect(parseInt(match?.[1] ?? "", 10)).toBe(65535);
	});

	it("does not match non-numeric filenames", () => {
		expect(LOG_FILE_PATTERN.test("server.log")).toBe(false);
		expect(LOG_FILE_PATTERN.test("access.log")).toBe(false);
		expect(LOG_FILE_PATTERN.test("error.log")).toBe(false);
	});

	it("does not match filenames with non-digit characters", () => {
		expect(LOG_FILE_PATTERN.test("3000a.log")).toBe(false);
		expect(LOG_FILE_PATTERN.test("a3000.log")).toBe(false);
		expect(LOG_FILE_PATTERN.test("30-00.log")).toBe(false);
		expect(LOG_FILE_PATTERN.test("30.00.log")).toBe(false);
	});

	it("does not match wrong extensions", () => {
		expect(LOG_FILE_PATTERN.test("3000.txt")).toBe(false);
		expect(LOG_FILE_PATTERN.test("3000.json")).toBe(false);
		expect(LOG_FILE_PATTERN.test("3000.log.bak")).toBe(false);
		expect(LOG_FILE_PATTERN.test("3000")).toBe(false);
	});

	it("does not match hidden files or directories", () => {
		expect(LOG_FILE_PATTERN.test(".3000.log")).toBe(false);
		expect(LOG_FILE_PATTERN.test(".log")).toBe(false);
	});

	it("does not match partial matches", () => {
		// The ^ and $ anchors prevent substring matches
		expect(LOG_FILE_PATTERN.test("prefix3000.log")).toBe(false);
		expect(LOG_FILE_PATTERN.test("3000.logsuffix")).toBe(false);
	});

	it("matches zero port", () => {
		expect(LOG_FILE_PATTERN.test("0.log")).toBe(true);
		const match = "0.log".match(LOG_FILE_PATTERN);
		expect(parseInt(match?.[1] ?? "", 10)).toBe(0);
	});

	it("matches large numbers beyond valid port range", () => {
		// The regex does not enforce port range — it matches any digit sequence
		expect(LOG_FILE_PATTERN.test("999999.log")).toBe(true);
		expect(LOG_FILE_PATTERN.test("100000.log")).toBe(true);
	});

	it("does not match empty port", () => {
		expect(LOG_FILE_PATTERN.test(".log")).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// ServerEntry edge cases and serialization
// ---------------------------------------------------------------------------

describe("ServerEntry edge cases", () => {
	it("handles minimum valid values", () => {
		const entry: ServerEntry = {
			pid: 1,
			port: 1,
			host: "",
			contentRoot: "/",
			startTime: 0,
			kitflyVersion: "",
			daemonized: false,
		};
		expect(entry.pid).toBe(1);
		expect(entry.port).toBe(1);
		expect(entry.startTime).toBe(0);
	});

	it("handles large PID values", () => {
		// Linux max PID is typically 4194304, macOS can go higher
		const entry: ServerEntry = {
			pid: 4194304,
			port: 3000,
			host: "localhost",
			contentRoot: "/home/user/site",
			startTime: Date.now(),
			kitflyVersion: "1.0.0",
			daemonized: true,
		};
		expect(entry.pid).toBe(4194304);
	});

	it("roundtrips through JSON serialization", () => {
		const entry: ServerEntry = {
			pid: 12345,
			port: 3000,
			host: "localhost",
			contentRoot: "/home/user/project",
			startTime: 1700000000000,
			kitflyVersion: "0.1.0",
			daemonized: true,
		};

		const json = JSON.stringify(entry);
		const parsed = JSON.parse(json) as ServerEntry;

		expect(parsed.pid).toBe(entry.pid);
		expect(parsed.port).toBe(entry.port);
		expect(parsed.host).toBe(entry.host);
		expect(parsed.contentRoot).toBe(entry.contentRoot);
		expect(parsed.startTime).toBe(entry.startTime);
		expect(parsed.kitflyVersion).toBe(entry.kitflyVersion);
		expect(parsed.daemonized).toBe(entry.daemonized);
	});

	it("preserves exact property count (7 fields)", () => {
		const entry: ServerEntry = {
			pid: 1,
			port: 1,
			host: "h",
			contentRoot: "/",
			startTime: 0,
			kitflyVersion: "0",
			daemonized: false,
		};
		expect(Object.keys(entry)).toHaveLength(7);
	});

	it("host can be any string (localhost, 0.0.0.0, IP, hostname)", () => {
		const hosts = ["localhost", "0.0.0.0", "127.0.0.1", "::1", "my-host.local"];
		for (const host of hosts) {
			const entry: ServerEntry = {
				pid: 1,
				port: 3000,
				host,
				contentRoot: "/tmp",
				startTime: 0,
				kitflyVersion: "0.1.0",
				daemonized: false,
			};
			expect(entry.host).toBe(host);
		}
	});

	it("contentRoot accepts various path formats", () => {
		const paths = ["/", "/home/user", "/tmp/my-site", "/var/www/html"];
		for (const p of paths) {
			const entry: ServerEntry = {
				pid: 1,
				port: 3000,
				host: "localhost",
				contentRoot: p,
				startTime: 0,
				kitflyVersion: "0.1.0",
				daemonized: false,
			};
			expect(entry.contentRoot).toBe(p);
		}
	});

	it("startTime is a unix epoch timestamp in milliseconds", () => {
		const now = Date.now();
		const entry: ServerEntry = {
			pid: 1,
			port: 3000,
			host: "localhost",
			contentRoot: "/tmp",
			startTime: now,
			kitflyVersion: "0.1.0",
			daemonized: false,
		};
		// Verify it's a reasonable ms timestamp (after year 2020, before year 2100)
		expect(entry.startTime).toBeGreaterThan(1577836800000);
		expect(entry.startTime).toBeLessThan(4102444800000);
	});
});

// ---------------------------------------------------------------------------
// ServerRegistry JSON structure
// ---------------------------------------------------------------------------

describe("ServerRegistry JSON structure", () => {
	it("empty registry has version 1 and empty servers array", () => {
		// This matches what readRegistry() returns on parse failure
		const emptyRegistry = { version: 1 as const, servers: [] as ServerEntry[] };
		expect(emptyRegistry.version).toBe(1);
		expect(emptyRegistry.servers).toEqual([]);
	});

	it("registry with servers preserves all entries through serialization", () => {
		const entries: ServerEntry[] = [
			{
				pid: 100,
				port: 3000,
				host: "localhost",
				contentRoot: "/project-a",
				startTime: 1700000000000,
				kitflyVersion: "0.1.0",
				daemonized: true,
			},
			{
				pid: 200,
				port: 3001,
				host: "localhost",
				contentRoot: "/project-b",
				startTime: 1700000001000,
				kitflyVersion: "0.1.0",
				daemonized: false,
			},
		];
		const registry = { version: 1 as const, servers: entries };

		const json = JSON.stringify(registry, null, 2);
		const parsed = JSON.parse(json);

		expect(parsed.version).toBe(1);
		expect(parsed.servers).toHaveLength(2);
		expect(parsed.servers[0].port).toBe(3000);
		expect(parsed.servers[1].port).toBe(3001);
	});

	it("registry JSON uses pretty-print format (2-space indent)", () => {
		// writeRegistry uses JSON.stringify(registry, null, 2)
		const registry = { version: 1 as const, servers: [] as ServerEntry[] };
		const json = JSON.stringify(registry, null, 2);

		expect(json).toContain("\n");
		expect(json).toContain("  "); // 2-space indent
		expect(json).not.toContain("\t"); // no tabs
	});

	it("servers can be filtered by port (registerServer dedup logic)", () => {
		const servers: ServerEntry[] = [
			{
				pid: 100,
				port: 3000,
				host: "localhost",
				contentRoot: "/project-a",
				startTime: 1700000000000,
				kitflyVersion: "0.1.0",
				daemonized: true,
			},
			{
				pid: 200,
				port: 3001,
				host: "localhost",
				contentRoot: "/project-b",
				startTime: 1700000001000,
				kitflyVersion: "0.1.0",
				daemonized: false,
			},
			{
				pid: 300,
				port: 3000,
				host: "localhost",
				contentRoot: "/project-c",
				startTime: 1700000002000,
				kitflyVersion: "0.1.0",
				daemonized: true,
			},
		];

		// registerServer filters out existing entries for the same port
		const filtered = servers.filter((s) => s.port !== 3000);
		expect(filtered).toHaveLength(1);
		expect(filtered[0].port).toBe(3001);
	});

	it("servers can be looked up by port (findServerByPort logic)", () => {
		const servers: ServerEntry[] = [
			{
				pid: 100,
				port: 3000,
				host: "localhost",
				contentRoot: "/project-a",
				startTime: 1700000000000,
				kitflyVersion: "0.1.0",
				daemonized: true,
			},
			{
				pid: 200,
				port: 8080,
				host: "localhost",
				contentRoot: "/project-b",
				startTime: 1700000001000,
				kitflyVersion: "0.1.0",
				daemonized: false,
			},
		];

		const found = servers.find((s) => s.port === 8080) ?? null;
		expect(found).not.toBeNull();
		expect(found?.pid).toBe(200);
		expect(found?.contentRoot).toBe("/project-b");

		const notFound = servers.find((s) => s.port === 9999) ?? null;
		expect(notFound).toBeNull();
	});

	it("servers can be looked up by contentRoot (findServerByContentRoot logic)", () => {
		const servers: ServerEntry[] = [
			{
				pid: 100,
				port: 3000,
				host: "localhost",
				contentRoot: "/project-a",
				startTime: 1700000000000,
				kitflyVersion: "0.1.0",
				daemonized: true,
			},
			{
				pid: 200,
				port: 3001,
				host: "localhost",
				contentRoot: "/project-b",
				startTime: 1700000001000,
				kitflyVersion: "0.1.0",
				daemonized: false,
			},
		];

		const found = servers.find((s) => s.contentRoot === "/project-a") ?? null;
		expect(found).not.toBeNull();
		expect(found?.port).toBe(3000);

		// contentRoot match is exact (no normalization)
		const notFound = servers.find((s) => s.contentRoot === "/project-a/") ?? null;
		expect(notFound).toBeNull();
	});

	it("unregister filters by port and returns length change", () => {
		const servers: ServerEntry[] = [
			{
				pid: 100,
				port: 3000,
				host: "localhost",
				contentRoot: "/a",
				startTime: 0,
				kitflyVersion: "0.1.0",
				daemonized: false,
			},
			{
				pid: 200,
				port: 3001,
				host: "localhost",
				contentRoot: "/b",
				startTime: 0,
				kitflyVersion: "0.1.0",
				daemonized: false,
			},
		];

		const before = servers.length;
		const after = servers.filter((s) => s.port !== 3000);
		const removed = after.length < before;

		expect(removed).toBe(true);
		expect(after).toHaveLength(1);
		expect(after[0].port).toBe(3001);
	});

	it("unregister returns false when port not found", () => {
		const servers: ServerEntry[] = [
			{
				pid: 100,
				port: 3000,
				host: "localhost",
				contentRoot: "/a",
				startTime: 0,
				kitflyVersion: "0.1.0",
				daemonized: false,
			},
		];

		const before = servers.length;
		const after = servers.filter((s) => s.port !== 9999);
		const removed = after.length < before;

		expect(removed).toBe(false);
		expect(after).toHaveLength(1);
	});
});

// ---------------------------------------------------------------------------
// Port conflict detection logic
// ---------------------------------------------------------------------------

describe("Port conflict detection logic", () => {
	it("same contentRoot means no conflict (reuse scenario)", () => {
		const existingServer: ServerEntry = {
			pid: 100,
			port: 3000,
			host: "localhost",
			contentRoot: "/project",
			startTime: 0,
			kitflyVersion: "0.1.0",
			daemonized: true,
		};

		// checkPortConflict returns null when contentRoot matches
		const requestedContentRoot = "/project";
		const isConflict = existingServer.contentRoot !== requestedContentRoot;
		expect(isConflict).toBe(false);
	});

	it("different contentRoot on same port is a kitfly conflict", () => {
		const existingServer: ServerEntry = {
			pid: 100,
			port: 3000,
			host: "localhost",
			contentRoot: "/project-a",
			startTime: 0,
			kitflyVersion: "0.1.0",
			daemonized: true,
		};

		const requestedContentRoot = "/project-b";
		const isConflict = existingServer.contentRoot !== requestedContentRoot;
		expect(isConflict).toBe(true);

		// The conflict would be typed as "kitfly" with the existing server's details
		const conflict: PortConflict = {
			type: "kitfly",
			port: existingServer.port,
			pid: existingServer.pid,
			contentRoot: existingServer.contentRoot,
		};
		expect(conflict.type).toBe("kitfly");
		expect(conflict.contentRoot).toBe("/project-a");
	});

	it("contentRoot comparison is exact string equality", () => {
		// No path normalization is done — trailing slash matters
		const root1: string = "/home/user/project";
		const root2: string = "/home/user/project/";
		expect(root1 === root2).toBe(false);

		// Case sensitivity matters
		const root3: string = "/Home/User/Project";
		expect(root1 === root3).toBe(false);
	});

	it("external process conflict has type other", () => {
		const conflict: PortConflict = {
			type: "other",
			port: 80,
			pid: 1,
			processName: "httpd",
		};
		expect(conflict.type).toBe("other");
		expect(conflict.processName).toBe("httpd");
		expect(conflict.contentRoot).toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
// stopServer return type shapes
// ---------------------------------------------------------------------------

describe("stopServer return type shapes", () => {
	it("success result has expected shape", () => {
		const result = { success: true, message: "Stopped server on port 3000" };
		expect(result).toHaveProperty("success");
		expect(result).toHaveProperty("message");
		expect(result.success).toBe(true);
		expect(typeof result.message).toBe("string");
	});

	it("no-server-found result", () => {
		const port = 3000;
		const result = { success: false, message: `No server running on port ${port}` };
		expect(result.success).toBe(false);
		expect(result.message).toContain("3000");
	});

	it("invalid-pid result includes pid in message", () => {
		const port = 3000;
		const pid = -1;
		const result = {
			success: false,
			message: `Removed invalid registry entry for port ${port} (pid: ${pid})`,
		};
		expect(result.success).toBe(false);
		expect(result.message).toContain("invalid");
		expect(result.message).toContain(String(pid));
		expect(result.message).toContain(String(port));
	});

	it("failure result includes error details", () => {
		const pid = 12345;
		const err = new Error("EPERM");
		const result = {
			success: false,
			message: `Failed to stop server (PID ${pid}): ${err}`,
		};
		expect(result.success).toBe(false);
		expect(result.message).toContain("Failed");
		expect(result.message).toContain(String(pid));
	});
});

// ---------------------------------------------------------------------------
// stopAllServers return type shapes
// ---------------------------------------------------------------------------

describe("stopAllServers return type shape", () => {
	it("has stopped, failed, and orphans counts", () => {
		const result = { stopped: 2, failed: 1, orphans: 0 };
		expect(result).toHaveProperty("stopped");
		expect(result).toHaveProperty("failed");
		expect(result).toHaveProperty("orphans");
		expect(typeof result.stopped).toBe("number");
		expect(typeof result.failed).toBe("number");
		expect(typeof result.orphans).toBe("number");
	});

	it("all-success scenario", () => {
		const result = { stopped: 3, failed: 0, orphans: 0 };
		expect(result.stopped).toBeGreaterThan(0);
		expect(result.failed).toBe(0);
	});

	it("empty scenario (no servers running)", () => {
		const result = { stopped: 0, failed: 0, orphans: 0 };
		expect(result.stopped + result.failed + result.orphans).toBe(0);
	});

	it("orphans-only scenario", () => {
		const result = { stopped: 0, failed: 0, orphans: 2 };
		expect(result.orphans).toBe(2);
		expect(result.stopped).toBe(0);
	});
});

// ---------------------------------------------------------------------------
// Path component extraction
// ---------------------------------------------------------------------------

describe("Path component extraction", () => {
	it("getLogPath filename is <port>.log", () => {
		const logPath = getLogPath(3000);
		const filename = basename(logPath);
		expect(filename).toBe("3000.log");
	});

	it("getLogPath parent directory is the logs dir", () => {
		const logPath = getLogPath(3000);
		const logsDir = getLogsDir();
		expect(dirname(logPath)).toBe(logsDir);
	});

	it("getKitflyHome basename is .kitfly", () => {
		const home = getKitflyHome();
		const name = basename(home);
		expect(name).toBe(".kitfly");
	});

	it("getLogsDir basename is logs", () => {
		const dir = getLogsDir();
		const name = basename(dir);
		expect(name).toBe("logs");
	});

	it("directory depth from homedir is exactly 1 for kitfly home", () => {
		const home = getKitflyHome();
		const relative = home.slice(homedir().length);
		const segments = relative.split(sep).filter(Boolean);
		expect(segments).toEqual([".kitfly"]);
	});

	it("directory depth from homedir is exactly 2 for logs dir", () => {
		const dir = getLogsDir();
		const relative = dir.slice(homedir().length);
		const segments = relative.split(sep).filter(Boolean);
		expect(segments).toEqual([".kitfly", "logs"]);
	});

	it("directory depth from homedir is exactly 2 for log file (plus filename)", () => {
		const logPath = getLogPath(3000);
		const relative = logPath.slice(homedir().length);
		const segments = relative.split(sep).filter(Boolean);
		expect(segments).toEqual([".kitfly", "logs", "3000.log"]);
	});
});

// ---------------------------------------------------------------------------
// cleanLogs filtering logic (offline / data-only)
// ---------------------------------------------------------------------------

describe("cleanLogs filtering logic", () => {
	// Tests the data-filtering logic that cleanLogs applies, without real I/O.
	// cleanLogs: for each <port>.log file, remove it if port is NOT in activePorts.

	function simulateCleanLogs(dirEntries: string[], activePorts: Set<number>): string[] {
		const removed: string[] = [];
		for (const entry of dirEntries) {
			const match = entry.match(/^(\d+)\.log$/);
			if (!match) continue;
			const port = parseInt(match[1], 10);
			if (!activePorts.has(port)) {
				removed.push(entry);
			}
		}
		return removed;
	}

	it("removes logs for ports not in active set", () => {
		const dirEntries = ["3000.log", "3001.log", "3002.log"];
		const activePorts = new Set([3000]);
		const removed = simulateCleanLogs(dirEntries, activePorts);
		expect(removed).toEqual(["3001.log", "3002.log"]);
	});

	it("keeps logs for all active ports", () => {
		const dirEntries = ["3000.log", "3001.log"];
		const activePorts = new Set([3000, 3001]);
		const removed = simulateCleanLogs(dirEntries, activePorts);
		expect(removed).toEqual([]);
	});

	it("removes all logs when no servers are active", () => {
		const dirEntries = ["3000.log", "8080.log"];
		const activePorts = new Set<number>();
		const removed = simulateCleanLogs(dirEntries, activePorts);
		expect(removed).toEqual(["3000.log", "8080.log"]);
	});

	it("ignores non-log files", () => {
		const dirEntries = ["3000.log", "readme.txt", ".gitkeep", "backup.tar.gz"];
		const activePorts = new Set<number>();
		const removed = simulateCleanLogs(dirEntries, activePorts);
		// Only 3000.log matches the pattern
		expect(removed).toEqual(["3000.log"]);
	});

	it("ignores files with non-numeric names", () => {
		const dirEntries = ["server.log", "access.log", "error.log"];
		const activePorts = new Set<number>();
		const removed = simulateCleanLogs(dirEntries, activePorts);
		expect(removed).toEqual([]);
	});

	it("handles empty directory", () => {
		const dirEntries: string[] = [];
		const activePorts = new Set([3000]);
		const removed = simulateCleanLogs(dirEntries, activePorts);
		expect(removed).toEqual([]);
	});

	it("handles mixed valid and invalid log filenames", () => {
		const dirEntries = ["3000.log", "abc.log", "3001.log", ".3002.log", "3003.log.bak", "3004.log"];
		const activePorts = new Set([3001]);
		const removed = simulateCleanLogs(dirEntries, activePorts);
		// Only 3000.log and 3004.log match the pattern and are not active
		expect(removed).toEqual(["3000.log", "3004.log"]);
	});

	it("port 0 is a valid log filename", () => {
		const dirEntries = ["0.log"];
		const activePorts = new Set<number>();
		const removed = simulateCleanLogs(dirEntries, activePorts);
		expect(removed).toEqual(["0.log"]);
	});

	it("large port numbers are matched correctly", () => {
		const dirEntries = ["99999.log"];
		const activePorts = new Set([99999]);
		const removed = simulateCleanLogs(dirEntries, activePorts);
		expect(removed).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// cleanRegistry filtering logic (offline / data-only)
// ---------------------------------------------------------------------------

describe("cleanRegistry filtering logic", () => {
	// Tests the alive/dead partitioning logic used by cleanRegistry,
	// without real process checks.

	function simulateCleanRegistry(
		servers: ServerEntry[],
		isAlive: (entry: ServerEntry) => boolean,
	): { alive: ServerEntry[]; removed: ServerEntry[] } {
		const alive: ServerEntry[] = [];
		const removed: ServerEntry[] = [];
		for (const entry of servers) {
			if (isAlive(entry)) {
				alive.push(entry);
			} else {
				removed.push(entry);
			}
		}
		return { alive, removed };
	}

	function makeEntry(overrides: Partial<ServerEntry> = {}): ServerEntry {
		return {
			pid: 100,
			port: 3000,
			host: "localhost",
			contentRoot: "/tmp",
			startTime: 0,
			kitflyVersion: "0.1.0",
			daemonized: false,
			...overrides,
		};
	}

	it("keeps alive servers, removes dead ones", () => {
		const servers = [
			makeEntry({ pid: 100, port: 3000 }),
			makeEntry({ pid: 200, port: 3001 }),
			makeEntry({ pid: 300, port: 3002 }),
		];
		const alivePids = new Set([100, 300]);
		const { alive, removed } = simulateCleanRegistry(servers, (e) => alivePids.has(e.pid));

		expect(alive).toHaveLength(2);
		expect(alive.map((s) => s.pid)).toEqual([100, 300]);
		expect(removed).toHaveLength(1);
		expect(removed[0].pid).toBe(200);
	});

	it("returns all servers when all are alive", () => {
		const servers = [makeEntry({ pid: 100 }), makeEntry({ pid: 200 })];
		const { alive, removed } = simulateCleanRegistry(servers, () => true);
		expect(alive).toHaveLength(2);
		expect(removed).toHaveLength(0);
	});

	it("removes all servers when none are alive", () => {
		const servers = [makeEntry({ pid: 100 }), makeEntry({ pid: 200 })];
		const { alive, removed } = simulateCleanRegistry(servers, () => false);
		expect(alive).toHaveLength(0);
		expect(removed).toHaveLength(2);
	});

	it("handles empty server list", () => {
		const { alive, removed } = simulateCleanRegistry([], () => true);
		expect(alive).toHaveLength(0);
		expect(removed).toHaveLength(0);
	});

	it("pid <= 0 is always considered dead (safety rule)", () => {
		// isProcessAlive returns false for pid <= 0 without calling process.kill
		const servers = [
			makeEntry({ pid: 0, port: 3000 }),
			makeEntry({ pid: -1, port: 3001 }),
			makeEntry({ pid: 100, port: 3002 }),
		];
		const { alive, removed } = simulateCleanRegistry(servers, (e) => e.pid > 0);
		expect(alive).toHaveLength(1);
		expect(alive[0].pid).toBe(100);
		expect(removed).toHaveLength(2);
	});
});

// ---------------------------------------------------------------------------
// registerServer deduplication logic
// ---------------------------------------------------------------------------

describe("registerServer deduplication logic", () => {
	function makeEntry(overrides: Partial<ServerEntry> = {}): ServerEntry {
		return {
			pid: 100,
			port: 3000,
			host: "localhost",
			contentRoot: "/tmp",
			startTime: 0,
			kitflyVersion: "0.1.0",
			daemonized: false,
			...overrides,
		};
	}

	it("adding to empty list produces single-entry list", () => {
		const existing: ServerEntry[] = [];
		const newEntry = makeEntry({ pid: 500, port: 4000 });
		const filtered = existing.filter((s) => s.port !== newEntry.port);
		filtered.push(newEntry);
		expect(filtered).toHaveLength(1);
		expect(filtered[0].pid).toBe(500);
	});

	it("replaces existing entry for same port", () => {
		const existing = [makeEntry({ pid: 100, port: 3000, contentRoot: "/old" })];
		const newEntry = makeEntry({ pid: 200, port: 3000, contentRoot: "/new" });
		const filtered = existing.filter((s) => s.port !== newEntry.port);
		filtered.push(newEntry);

		expect(filtered).toHaveLength(1);
		expect(filtered[0].pid).toBe(200);
		expect(filtered[0].contentRoot).toBe("/new");
	});

	it("preserves entries on other ports", () => {
		const existing = [makeEntry({ pid: 100, port: 3000 }), makeEntry({ pid: 200, port: 3001 })];
		const newEntry = makeEntry({ pid: 300, port: 3000, contentRoot: "/new" });
		const filtered = existing.filter((s) => s.port !== newEntry.port);
		filtered.push(newEntry);

		expect(filtered).toHaveLength(2);
		expect(filtered[0].port).toBe(3001);
		expect(filtered[1].port).toBe(3000);
		expect(filtered[1].pid).toBe(300);
	});

	it("adding to list with no port conflict appends", () => {
		const existing = [makeEntry({ pid: 100, port: 3000 }), makeEntry({ pid: 200, port: 3001 })];
		const newEntry = makeEntry({ pid: 300, port: 4000 });
		const filtered = existing.filter((s) => s.port !== newEntry.port);
		filtered.push(newEntry);

		expect(filtered).toHaveLength(3);
		expect(filtered[2].port).toBe(4000);
	});

	it("multiple registrations on same port keep only the latest", () => {
		let servers: ServerEntry[] = [];

		// Register three times on port 3000
		for (let i = 1; i <= 3; i++) {
			const entry = makeEntry({ pid: i * 100, port: 3000, contentRoot: `/v${i}` });
			servers = servers.filter((s) => s.port !== entry.port);
			servers.push(entry);
		}

		expect(servers).toHaveLength(1);
		expect(servers[0].pid).toBe(300);
		expect(servers[0].contentRoot).toBe("/v3");
	});
});
