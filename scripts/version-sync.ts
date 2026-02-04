#!/usr/bin/env bun
/**
 * version-sync.ts - Sync VERSION file to package.json
 *
 * VERSION file is the Single Source of Truth (SSOT) for kitfly versioning.
 * This script propagates the version to package.json.
 *
 * Usage:
 *   bun run scripts/version-sync.ts           # Sync and display result
 *   bun run scripts/version-sync.ts --check   # Verify they match (CI)
 *   bun run scripts/version-sync.ts --set X.Y.Z  # Set VERSION and sync
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const VERSION_PATH = join(ROOT, "VERSION");
const PACKAGE_PATH = join(ROOT, "package.json");

function getVersionFromFile(): string {
	return readFileSync(VERSION_PATH, "utf-8").trim();
}

function getPackageVersion(): string {
	const pkg = JSON.parse(readFileSync(PACKAGE_PATH, "utf-8"));
	return pkg.version;
}

function setVersionFile(version: string): void {
	writeFileSync(VERSION_PATH, `${version}\n`);
}

function syncPackageJson(version: string): void {
	const pkg = JSON.parse(readFileSync(PACKAGE_PATH, "utf-8"));
	pkg.version = version;
	writeFileSync(PACKAGE_PATH, `${JSON.stringify(pkg, null, 2)}\n`);
}

function main() {
	const args = process.argv.slice(2);

	// --check: Verify versions match (for CI)
	if (args.includes("--check")) {
		const fileVersion = getVersionFromFile();
		const pkgVersion = getPackageVersion();
		if (fileVersion !== pkgVersion) {
			console.error(`Version mismatch: VERSION=${fileVersion}, package.json=${pkgVersion}`);
			console.error("Run: bun run scripts/version-sync.ts");
			process.exit(1);
		}
		console.log(`Versions match: ${fileVersion}`);
		process.exit(0);
	}

	// --set X.Y.Z: Set VERSION file and sync
	const setIndex = args.indexOf("--set");
	if (setIndex !== -1) {
		const newVersion = args[setIndex + 1];
		if (!newVersion || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(newVersion)) {
			console.error("Usage: bun run scripts/version-sync.ts --set X.Y.Z");
			process.exit(1);
		}
		setVersionFile(newVersion);
		syncPackageJson(newVersion);
		console.log(`Version set to ${newVersion}`);
		process.exit(0);
	}

	// Default: Sync VERSION → package.json
	const version = getVersionFromFile();
	const pkgVersion = getPackageVersion();

	if (version === pkgVersion) {
		console.log(`Already in sync: ${version}`);
	} else {
		syncPackageJson(version);
		console.log(`Synced package.json: ${pkgVersion} → ${version}`);
	}
}

main();
