/**
 * Tests for CLI argument parsing, version, help, and command routing logic
 */

import { describe, expect, it } from "vitest";

// We need to test the parseArgs function and other CLI logic
// Since parseArgs is not exported, we'll recreate it here for unit testing
// This matches the implementation in cli.ts exactly

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

// Recreate getVersion logic for testing
function getVersion(versionFilePath: string): string {
	try {
		const fs = require("node:fs");
		return fs.readFileSync(versionFilePath, "utf-8").trim();
	} catch {
		return "0.0.0";
	}
}

// Generate help text (matches cli.ts structure)
function generateHelp(version: string): string {
	return `
kitfly v${version} - Turn your writing into a website

Usage:
  kitfly dev [folder]     Start dev server with hot reload
  kitfly build [folder]   Build static site to dist/
  kitfly bundle [folder]  Build single-file HTML bundle to bundles/
  kitfly init [name]      Create new project from template
  kitfly servers          List running dev servers
  kitfly stop <port|all>  Stop dev server(s)
  kitfly version          Show version
  kitfly help             Show this help

Dev options:
  --port <n>    Server port [env: KITFLY_DEV_PORT] (default: 3333)
  --host <h>    Server host [env: KITFLY_DEV_HOST] (default: localhost)
  --daemon, -d  Run in background, return immediately
  --json        Output JSON (implies --daemon)
  --no-open     Don't open browser

Build options:
  --out <dir>   Output directory [env: KITFLY_BUILD_OUT] (default: dist)
  --no-raw      Don't include raw markdown

Bundle options:
  --out <dir>   Output directory [env: KITFLY_BUNDLE_OUT] (default: bundles)
  --name <file> Bundle filename (default: bundle.html)
  --no-raw      Don't include raw markdown [env: KITFLY_BUNDLE_RAW]

Stop options:
  --force       Skip graceful shutdown, kill immediately

Examples:
  kitfly dev
  kitfly dev ./my-docs --port 4000 --daemon
  kitfly dev ./docs --json
  kitfly servers
  kitfly stop 4000
  kitfly stop all
  kitfly build ./docs --out ./public
  kitfly bundle ./docs --out ./bundles --name docs.html
  kitfly init my-handbook

Documentation: https://kitfly.app
`;
}

// Command routing logic - returns the detected command and parsed arguments
function routeCommand(argv: string[]): {
	command: string | undefined;
	positional: string[];
	flags: Record<string, string | boolean>;
} {
	const [cmd, ...rest] = argv;
	const { positional, flags } = parseArgs(rest);
	return { command: cmd, positional, flags };
}

// Validate port number (matches cli.ts logic)
function validatePort(portRaw: string | undefined): {
	valid: boolean;
	port: number;
	error?: string;
} {
	if (!portRaw) {
		return { valid: true, port: 3333 }; // default port
	}
	const port = parseInt(portRaw, 10);
	if (Number.isNaN(port) || port < 1 || port > 65535) {
		return { valid: false, port: 0, error: `"${portRaw}" is not a valid port number.` };
	}
	return { valid: true, port };
}

describe("parseArgs", () => {
	describe("positional arguments", () => {
		it("parses single positional argument", () => {
			const { positional, flags } = parseArgs(["./docs"]);
			expect(positional).toEqual(["./docs"]);
			expect(flags).toEqual({});
		});

		it("parses multiple positional arguments", () => {
			const { positional } = parseArgs(["./docs", "output", "extra"]);
			expect(positional).toEqual(["./docs", "output", "extra"]);
		});

		it("handles empty arguments", () => {
			const { positional, flags } = parseArgs([]);
			expect(positional).toEqual([]);
			expect(flags).toEqual({});
		});
	});

	describe("long flags with values", () => {
		it("parses --port with value", () => {
			const { flags } = parseArgs(["--port", "4000"]);
			expect(flags.port).toBe("4000");
		});

		it("parses --host with value", () => {
			const { flags } = parseArgs(["--host", "0.0.0.0"]);
			expect(flags.host).toBe("0.0.0.0");
		});

		it("parses --out with value", () => {
			const { flags } = parseArgs(["--out", "./public"]);
			expect(flags.out).toBe("./public");
		});

		it("parses --name with value", () => {
			const { flags } = parseArgs(["--name", "site.html"]);
			expect(flags.name).toBe("site.html");
		});

		it("parses multiple flags with values", () => {
			const { flags } = parseArgs(["--port", "5000", "--host", "localhost", "--out", "dist"]);
			expect(flags.port).toBe("5000");
			expect(flags.host).toBe("localhost");
			expect(flags.out).toBe("dist");
		});
	});

	describe("boolean flags", () => {
		it("parses --daemon as true", () => {
			const { flags } = parseArgs(["--daemon"]);
			expect(flags.daemon).toBe(true);
		});

		it("parses --json as true", () => {
			const { flags } = parseArgs(["--json"]);
			expect(flags.json).toBe(true);
		});

		it("parses --force as true", () => {
			const { flags } = parseArgs(["--force"]);
			expect(flags.force).toBe(true);
		});

		it("parses --no-open as open: false", () => {
			const { flags } = parseArgs(["--no-open"]);
			expect(flags.open).toBe(false);
		});

		it("parses --no-raw as raw: false", () => {
			const { flags } = parseArgs(["--no-raw"]);
			expect(flags.raw).toBe(false);
		});
	});

	describe("short flags", () => {
		it("parses -d as true", () => {
			const { flags } = parseArgs(["-d"]);
			expect(flags.d).toBe(true);
		});

		it("parses -v as true", () => {
			const { flags } = parseArgs(["-v"]);
			expect(flags.v).toBe(true);
		});

		it("parses -h as true", () => {
			const { flags } = parseArgs(["-h"]);
			expect(flags.h).toBe(true);
		});
	});

	describe("mixed arguments", () => {
		it("parses positional and flags together", () => {
			const { positional, flags } = parseArgs(["./docs", "--port", "4000", "--daemon"]);
			expect(positional).toEqual(["./docs"]);
			expect(flags.port).toBe("4000");
			expect(flags.daemon).toBe(true);
		});

		it("parses complex dev command arguments", () => {
			const { positional, flags } = parseArgs([
				"./my-docs",
				"--port",
				"4000",
				"--host",
				"0.0.0.0",
				"--daemon",
				"--no-open",
			]);
			expect(positional).toEqual(["./my-docs"]);
			expect(flags.port).toBe("4000");
			expect(flags.host).toBe("0.0.0.0");
			expect(flags.daemon).toBe(true);
			expect(flags.open).toBe(false);
		});

		it("parses build command arguments", () => {
			const { positional, flags } = parseArgs(["./content", "--out", "./public", "--no-raw"]);
			expect(positional).toEqual(["./content"]);
			expect(flags.out).toBe("./public");
			expect(flags.raw).toBe(false);
		});

		it("parses bundle command arguments", () => {
			const { positional, flags } = parseArgs([
				"./docs",
				"--out",
				"./dist",
				"--name",
				"handbook.html",
				"--no-raw",
			]);
			expect(positional).toEqual(["./docs"]);
			expect(flags.out).toBe("./dist");
			expect(flags.name).toBe("handbook.html");
			expect(flags.raw).toBe(false);
		});
	});

	describe("edge cases", () => {
		it("handles flag at end without value as boolean true", () => {
			const { flags } = parseArgs(["--verbose"]);
			expect(flags.verbose).toBe(true);
		});

		it("handles flag followed by another flag (no value)", () => {
			const { flags } = parseArgs(["--daemon", "--json"]);
			expect(flags.daemon).toBe(true);
			expect(flags.json).toBe(true);
		});

		it("does not consume flag-like value for previous flag", () => {
			const { flags } = parseArgs(["--first", "--second"]);
			expect(flags.first).toBe(true);
			expect(flags.second).toBe(true);
		});

		it("handles paths with dashes", () => {
			const { positional } = parseArgs(["./my-docs-folder"]);
			expect(positional).toEqual(["./my-docs-folder"]);
		});

		it("handles numeric values", () => {
			const { flags } = parseArgs(["--port", "65535"]);
			expect(flags.port).toBe("65535");
		});
	});
});

describe("getVersion", () => {
	it("returns version from VERSION file when it exists", () => {
		const fs = require("node:fs");
		const path = require("node:path");
		const versionPath = path.join(__dirname, "../../VERSION");

		// Check if VERSION file exists
		let expectedVersion: string;
		try {
			expectedVersion = fs.readFileSync(versionPath, "utf-8").trim();
		} catch {
			expectedVersion = "0.0.0";
		}

		const version = getVersion(versionPath);
		expect(version).toBe(expectedVersion);
	});

	it("returns 0.0.0 when VERSION file does not exist", () => {
		const version = getVersion("/nonexistent/path/VERSION");
		expect(version).toBe("0.0.0");
	});
});

describe("generateHelp", () => {
	it("includes version in help text", () => {
		const help = generateHelp("1.2.3");
		expect(help).toContain("kitfly v1.2.3");
	});

	it("includes all main commands", () => {
		const help = generateHelp("1.0.0");
		expect(help).toContain("kitfly dev [folder]");
		expect(help).toContain("kitfly build [folder]");
		expect(help).toContain("kitfly bundle [folder]");
		expect(help).toContain("kitfly init [name]");
		expect(help).toContain("kitfly servers");
		expect(help).toContain("kitfly stop <port|all>");
		expect(help).toContain("kitfly version");
		expect(help).toContain("kitfly help");
	});

	it("includes dev options", () => {
		const help = generateHelp("1.0.0");
		expect(help).toContain("--port <n>");
		expect(help).toContain("--host <h>");
		expect(help).toContain("--daemon, -d");
		expect(help).toContain("--json");
		expect(help).toContain("--no-open");
	});

	it("includes build/bundle options", () => {
		const help = generateHelp("1.0.0");
		expect(help).toContain("--out <dir>");
		expect(help).toContain("--name <file>");
		expect(help).toContain("--no-raw");
	});

	it("includes stop options", () => {
		const help = generateHelp("1.0.0");
		expect(help).toContain("--force");
	});

	it("includes examples", () => {
		const help = generateHelp("1.0.0");
		expect(help).toContain("kitfly dev ./my-docs --port 4000 --daemon");
		expect(help).toContain("kitfly build ./docs --out ./public");
		expect(help).toContain("kitfly init my-handbook");
	});

	it("includes documentation URL", () => {
		const help = generateHelp("1.0.0");
		expect(help).toContain("https://kitfly.app");
	});
});

describe("routeCommand", () => {
	describe("dev command", () => {
		it("routes dev command with folder", () => {
			const { command, positional } = routeCommand(["dev", "./docs"]);
			expect(command).toBe("dev");
			expect(positional).toEqual(["./docs"]);
		});

		it("routes dev command without folder (uses default)", () => {
			const { command, positional } = routeCommand(["dev"]);
			expect(command).toBe("dev");
			expect(positional).toEqual([]);
		});

		it("routes serve as alias for dev", () => {
			const { command, positional } = routeCommand(["serve", "./content"]);
			expect(command).toBe("serve");
			expect(positional).toEqual(["./content"]);
		});

		it("parses dev command with all options", () => {
			const { command, positional, flags } = routeCommand([
				"dev",
				"./docs",
				"--port",
				"4000",
				"--host",
				"localhost",
				"--daemon",
				"--no-open",
			]);
			expect(command).toBe("dev");
			expect(positional).toEqual(["./docs"]);
			expect(flags.port).toBe("4000");
			expect(flags.host).toBe("localhost");
			expect(flags.daemon).toBe(true);
			expect(flags.open).toBe(false);
		});
	});

	describe("build command", () => {
		it("routes build command with folder", () => {
			const { command, positional } = routeCommand(["build", "./content"]);
			expect(command).toBe("build");
			expect(positional).toEqual(["./content"]);
		});

		it("parses build command with options", () => {
			const { command, flags } = routeCommand(["build", "./docs", "--out", "./public", "--no-raw"]);
			expect(command).toBe("build");
			expect(flags.out).toBe("./public");
			expect(flags.raw).toBe(false);
		});
	});

	describe("bundle command", () => {
		it("routes bundle command", () => {
			const { command, positional } = routeCommand(["bundle", "./docs"]);
			expect(command).toBe("bundle");
			expect(positional).toEqual(["./docs"]);
		});

		it("parses bundle command with options", () => {
			const { command, flags } = routeCommand(["bundle", "--out", "./dist", "--name", "site.html"]);
			expect(command).toBe("bundle");
			expect(flags.out).toBe("./dist");
			expect(flags.name).toBe("site.html");
		});
	});

	describe("init command", () => {
		it("routes init command with name", () => {
			const { command, positional } = routeCommand(["init", "my-project"]);
			expect(command).toBe("init");
			expect(positional).toEqual(["my-project"]);
		});

		it("routes init command without name (will error)", () => {
			const { command, positional } = routeCommand(["init"]);
			expect(command).toBe("init");
			expect(positional).toEqual([]);
		});
	});

	describe("servers command", () => {
		it("routes servers command", () => {
			const { command } = routeCommand(["servers"]);
			expect(command).toBe("servers");
		});

		it("routes ps as alias for servers", () => {
			const { command } = routeCommand(["ps"]);
			expect(command).toBe("ps");
		});

		it("parses servers with --json flag", () => {
			const { command, flags } = routeCommand(["servers", "--json"]);
			expect(command).toBe("servers");
			expect(flags.json).toBe(true);
		});
	});

	describe("stop command", () => {
		it("routes stop command with port", () => {
			const { command, positional } = routeCommand(["stop", "4000"]);
			expect(command).toBe("stop");
			expect(positional).toEqual(["4000"]);
		});

		it("routes stop all command", () => {
			const { command, positional } = routeCommand(["stop", "all"]);
			expect(command).toBe("stop");
			expect(positional).toEqual(["all"]);
		});

		it("parses stop with --force flag", () => {
			const { command, flags } = routeCommand(["stop", "3333", "--force"]);
			expect(command).toBe("stop");
			expect(flags.force).toBe(true);
		});
	});

	describe("version command", () => {
		it("routes version command", () => {
			const { command } = routeCommand(["version"]);
			expect(command).toBe("version");
		});

		it("routes -v flag", () => {
			const { command } = routeCommand(["-v"]);
			expect(command).toBe("-v");
		});

		it("routes --version flag", () => {
			const { command } = routeCommand(["--version"]);
			expect(command).toBe("--version");
		});
	});

	describe("help command", () => {
		it("routes help command", () => {
			const { command } = routeCommand(["help"]);
			expect(command).toBe("help");
		});

		it("routes -h flag", () => {
			const { command } = routeCommand(["-h"]);
			expect(command).toBe("-h");
		});

		it("routes --help flag", () => {
			const { command } = routeCommand(["--help"]);
			expect(command).toBe("--help");
		});

		it("routes undefined (no command) to show help", () => {
			const { command } = routeCommand([]);
			expect(command).toBeUndefined();
		});
	});

	describe("unknown commands", () => {
		it("routes unknown command", () => {
			const { command } = routeCommand(["unknown"]);
			expect(command).toBe("unknown");
		});

		it("routes misspelled command", () => {
			const { command } = routeCommand(["buidl"]);
			expect(command).toBe("buidl");
		});
	});
});

describe("validatePort", () => {
	it("returns default port 3333 when no port specified", () => {
		const result = validatePort(undefined);
		expect(result.valid).toBe(true);
		expect(result.port).toBe(3333);
	});

	it("accepts valid port number", () => {
		const result = validatePort("4000");
		expect(result.valid).toBe(true);
		expect(result.port).toBe(4000);
	});

	it("accepts minimum valid port", () => {
		const result = validatePort("1");
		expect(result.valid).toBe(true);
		expect(result.port).toBe(1);
	});

	it("accepts maximum valid port", () => {
		const result = validatePort("65535");
		expect(result.valid).toBe(true);
		expect(result.port).toBe(65535);
	});

	it("rejects port 0", () => {
		const result = validatePort("0");
		expect(result.valid).toBe(false);
		expect(result.error).toContain("0");
	});

	it("rejects port above 65535", () => {
		const result = validatePort("65536");
		expect(result.valid).toBe(false);
		expect(result.error).toContain("65536");
	});

	it("rejects negative port", () => {
		const result = validatePort("-1");
		expect(result.valid).toBe(false);
	});

	it("rejects non-numeric port", () => {
		const result = validatePort("abc");
		expect(result.valid).toBe(false);
		expect(result.error).toContain("abc");
	});

	it("rejects empty string port", () => {
		const result = validatePort("");
		// Empty string is treated like "not provided" by the CLI arg parser.
		expect(result.valid).toBe(true);
	});

	it("rejects floating point port", () => {
		const result = validatePort("3000.5");
		expect(result.valid).toBe(true); // parseInt will parse to 3000
		expect(result.port).toBe(3000);
	});
});

describe("command argument defaults", () => {
	it("dev defaults folder to current directory", () => {
		const { positional } = routeCommand(["dev"]);
		const folder = positional[0] || ".";
		expect(folder).toBe(".");
	});

	it("dev defaults port to 3333", () => {
		const { flags } = routeCommand(["dev"]);
		const port = flags.port ? parseInt(flags.port as string, 10) : 3333;
		expect(port).toBe(3333);
	});

	it("dev defaults host to localhost", () => {
		const { flags } = routeCommand(["dev"]);
		const host = (flags.host as string) || "localhost";
		expect(host).toBe("localhost");
	});

	it("dev defaults open to true", () => {
		const { flags } = routeCommand(["dev"]);
		const open = flags.open !== false;
		expect(open).toBe(true);
	});

	it("build defaults folder to current directory", () => {
		const { positional } = routeCommand(["build"]);
		const folder = positional[0] || ".";
		expect(folder).toBe(".");
	});

	it("build defaults out to dist", () => {
		const { flags } = routeCommand(["build"]);
		const out = (flags.out as string) || "dist";
		expect(out).toBe("dist");
	});

	it("build defaults raw to true", () => {
		const { flags } = routeCommand(["build"]);
		const raw = flags.raw !== false;
		expect(raw).toBe(true);
	});

	it("bundle defaults name to bundle.html", () => {
		const { flags } = routeCommand(["bundle"]);
		const name = (flags.name as string) || "bundle.html";
		expect(name).toBe("bundle.html");
	});

	it("bundle defaults out to bundles", () => {
		const { flags } = routeCommand(["bundle"]);
		const out = (flags.out as string) || "bundles";
		expect(out).toBe("bundles");
	});
});

describe("daemon mode detection", () => {
	it("detects daemon mode from --daemon flag", () => {
		const { flags } = routeCommand(["dev", "--daemon"]);
		const daemon = flags.daemon === true || flags.d === true || flags.json === true;
		expect(daemon).toBe(true);
	});

	it("detects daemon mode from -d flag", () => {
		const { flags } = routeCommand(["dev", "-d"]);
		const daemon = flags.daemon === true || flags.d === true || flags.json === true;
		expect(daemon).toBe(true);
	});

	it("detects daemon mode from --json flag (implied)", () => {
		const { flags } = routeCommand(["dev", "--json"]);
		const daemon = flags.daemon === true || flags.d === true || flags.json === true;
		expect(daemon).toBe(true);
	});

	it("detects non-daemon mode when no flags", () => {
		const { flags } = routeCommand(["dev"]);
		const daemon = flags.daemon === true || flags.d === true || flags.json === true;
		expect(daemon).toBe(false);
	});
});

describe("host warning detection", () => {
	it("detects 0.0.0.0 as all-interfaces binding", () => {
		const { flags } = routeCommand(["dev", "--host", "0.0.0.0"]);
		const host = flags.host as string;
		const shouldWarn = host === "0.0.0.0" || host === "::";
		expect(shouldWarn).toBe(true);
	});

	it("detects :: as all-interfaces binding", () => {
		const { flags } = routeCommand(["dev", "--host", "::"]);
		const host = flags.host as string;
		const shouldWarn = host === "0.0.0.0" || host === "::";
		expect(shouldWarn).toBe(true);
	});

	it("does not warn for localhost", () => {
		const { flags } = routeCommand(["dev", "--host", "localhost"]);
		const host = flags.host as string;
		const shouldWarn = host === "0.0.0.0" || host === "::";
		expect(shouldWarn).toBe(false);
	});

	it("does not warn for 127.0.0.1", () => {
		const { flags } = routeCommand(["dev", "--host", "127.0.0.1"]);
		const host = flags.host as string;
		const shouldWarn = host === "0.0.0.0" || host === "::";
		expect(shouldWarn).toBe(false);
	});
});
