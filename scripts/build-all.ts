#!/usr/bin/env bun

/**
 * Cross-platform binary builder using `bun build --compile`.
 *
 * Builds standalone kitfly binaries for all supported platforms.
 * Each binary embeds the Bun runtime (~50-90 MB).
 *
 * Usage:
 *   bun scripts/build-all.ts
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

interface BuildTarget {
	os: string;
	arch: string;
	bunTarget: string;
	suffix: string;
}

const TARGETS: BuildTarget[] = [
	{
		os: "linux",
		arch: "amd64",
		bunTarget: "bun-linux-x64",
		suffix: "linux-amd64",
	},
	{
		os: "linux",
		arch: "arm64",
		bunTarget: "bun-linux-arm64",
		suffix: "linux-arm64",
	},
	{
		os: "darwin",
		arch: "arm64",
		bunTarget: "bun-darwin-arm64",
		suffix: "darwin-arm64",
	},
	{
		os: "windows",
		arch: "amd64",
		bunTarget: "bun-windows-x64",
		suffix: "windows-amd64",
	},
	// windows-arm64: Bun cannot cross-compile to bun-windows-aarch64 from Linux.
	// Built natively via release-windows-arm64.yml on a windows-arm64 runner.
];

const BINARY_NAME = "kitfly";
const ENTRY_POINT = "src/cli.ts";
const OUT_DIR = "dist/release";

function formatSize(bytes: number): string {
	const mb = bytes / (1024 * 1024);
	return `${mb.toFixed(1)} MB`;
}

function getVersion(): string {
	try {
		return readFileSync("VERSION", "utf-8").trim();
	} catch {
		return "0.0.0";
	}
}

function main(): void {
	const version = getVersion();

	console.log(`Building ${TARGETS.length} binaries for '${BINARY_NAME}' v${version}`);
	console.log(`  Entry point: ${ENTRY_POINT}`);
	console.log(`  Output dir:  ${OUT_DIR}`);
	console.log();

	if (!existsSync(ENTRY_POINT)) {
		console.error(`Error: entry point ${ENTRY_POINT} not found`);
		process.exit(1);
	}

	mkdirSync(OUT_DIR, { recursive: true });

	let succeeded = 0;
	let failed = 0;

	for (const target of TARGETS) {
		const ext = target.os === "windows" ? ".exe" : "";
		const binaryFile = `${BINARY_NAME}-${target.suffix}${ext}`;
		const outfile = join(OUT_DIR, binaryFile);
		const define = `--define __KITFLY_VERSION__='"${version}"'`;
		const cmd = `bun build ${ENTRY_POINT} --compile --target=${target.bunTarget} ${define} --outfile ${outfile}`;

		process.stdout.write(`  ${target.os}/${target.arch} -> ${binaryFile} ... `);

		try {
			execSync(cmd, { stdio: "pipe" });
			const size = formatSize(statSync(outfile).size);
			console.log(`ok (${size})`);
			succeeded++;
		} catch (err: unknown) {
			console.log("FAILED");
			const msg =
				err instanceof Error
					? (err as { stderr?: Buffer }).stderr?.toString().trim() || err.message
					: String(err);
			console.error(`    ${msg}`);
			failed++;
		}
	}

	console.log();
	console.log(`Done: ${succeeded} succeeded, ${failed} failed`);

	if (failed > 0) {
		process.exit(1);
	}
}

main();
