import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getMigrationsForVersion } from "../migrations/index.ts";
import type { SiteManifest, StandaloneProvenance } from "../templates/schema.ts";

const KITFLY_REPO = "3leaps/kitfly";
const GITHUB_RAW = "https://raw.githubusercontent.com";

export interface UpdateFlags {
	check?: boolean;
	dryRun?: boolean;
	force?: boolean;
	yes?: boolean;
	migrationsOnly?: boolean;
	// Dev/offline aid: update from local kitfly source tree.
	local?: boolean;
}

class UpdateError extends Error {
	name = "UpdateError";
}

function toArrayBuffer(data: Uint8Array): ArrayBuffer {
	return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

async function sha256Hex(data: Uint8Array): Promise<string> {
	const hash = await crypto.subtle.digest("SHA-256", toArrayBuffer(data));
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function readJson<T>(path: string): Promise<T> {
	const raw = await readFile(path, "utf-8");
	return JSON.parse(raw) as T;
}

async function writeJsonAtomic(path: string, obj: unknown): Promise<void> {
	await ensureDir(dirname(path));
	const tmp = `${path}.tmp.${Date.now()}`;
	await writeFile(tmp, JSON.stringify(obj, null, 2), "utf-8");
	await rename(tmp, path);
}

async function writeBytesAtomic(path: string, bytes: Uint8Array): Promise<void> {
	await ensureDir(dirname(path));
	const tmp = `${path}.tmp.${Date.now()}`;
	await writeFile(tmp, bytes);
	await rename(tmp, path);
}

async function ensureDir(path: string): Promise<void> {
	await mkdir(path, { recursive: true });
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const KITFLY_ROOT = resolve(join(__dirname, "../.."));

async function readLocalKitflyFileBytes(relPath: string): Promise<Uint8Array> {
	const path = join(KITFLY_ROOT, relPath);
	const buf = await readFile(path);
	return new Uint8Array(buf);
}

async function fetchKitflyFileBytes(relPath: string, version: string): Promise<Uint8Array> {
	if (process.env.KITFLY_UPDATE_SOURCE === "local") {
		return readLocalKitflyFileBytes(relPath);
	}

	const ref = version === "latest" ? "main" : `v${version}`;
	const url = `${GITHUB_RAW}/${KITFLY_REPO}/${ref}/${relPath}`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new UpdateError(`Failed to fetch ${relPath}: ${res.status} (${url})`);
	}
	const ab = await res.arrayBuffer();
	return new Uint8Array(ab);
}

async function getLatestVersion(): Promise<string> {
	const bytes = await fetchKitflyFileBytes("VERSION", "latest");
	return new TextDecoder().decode(bytes).trim();
}

function parseSemver(v: string): [number, number, number] {
	const [maj, min, pat] = v.split(".").map((n) => parseInt(n, 10));
	return [maj || 0, min || 0, pat || 0];
}

function cmp(a: string, b: string): number {
	const aa = parseSemver(a);
	const bb = parseSemver(b);
	for (let i = 0; i < 3; i++) {
		if (aa[i] !== bb[i]) return aa[i] < bb[i] ? -1 : 1;
	}
	return 0;
}

async function promptConfirm(message: string): Promise<boolean> {
	if (!process.stdin.isTTY) return false;
	process.stdout.write(`${message} [y/N] `);
	const chunks: Buffer[] = [];
	return new Promise((resolve) => {
		process.stdin.resume();
		process.stdin.once("data", (d) => {
			chunks.push(d as Buffer);
			process.stdin.pause();
			const ans = Buffer.concat(chunks).toString("utf-8").trim().toLowerCase();
			resolve(ans === "y" || ans === "yes");
		});
	});
}

type FileDecision =
	| { kind: "update"; path: string }
	| { kind: "add"; path: string }
	| { kind: "skip_modified"; path: string }
	| { kind: "skip_missing"; path: string }
	| { kind: "error"; path: string; error: string };

function uniq(paths: string[]): string[] {
	return Array.from(new Set(paths));
}

function getSchemaVersionFromSiteYaml(content: string): string | null {
	const m = content.match(/^schemaVersion\s*:\s*"?([0-9]+\.[0-9]+\.[0-9]+)"?/m);
	return m ? m[1] : null;
}

async function readSiteYamlSchemaVersion(root: string): Promise<string | null> {
	try {
		const content = await readFile(join(root, "site.yaml"), "utf-8");
		return getSchemaVersionFromSiteYaml(content);
	} catch {
		return null;
	}
}

function formatPlan(from: string, to: string, decisions: FileDecision[], migs: string[]): string {
	const updates = decisions.filter((d) => d.kind === "update");
	const adds = decisions.filter((d) => d.kind === "add");
	const modified = decisions.filter((d) => d.kind === "skip_modified");
	const missing = decisions.filter((d) => d.kind === "skip_missing");
	const errors = decisions.filter((d) => d.kind === "error");

	const lines: string[] = [];
	lines.push(`Kitfly Update: ${from} -> ${to}`);
	lines.push("");

	if (updates.length) {
		lines.push("Files to update (unmodified):");
		for (const d of updates) lines.push(`  - ${d.path}`);
		lines.push("");
	}
	if (adds.length) {
		lines.push("New files to add:");
		for (const d of adds) lines.push(`  - ${d.path}`);
		lines.push("");
	}
	if (modified.length) {
		lines.push("Files with local changes:");
		for (const d of modified) lines.push(`  - ${d.path} (modified; will skip)`);
		lines.push("");
	}
	if (missing.length) {
		lines.push("Files missing locally:");
		for (const d of missing) lines.push(`  - ${d.path} (missing; will skip)`);
		lines.push("");
	}
	if (errors.length) {
		lines.push("Fetch errors:");
		for (const d of errors) lines.push(`  - ${d.path}: ${d.error}`);
		lines.push("");
	}
	if (migs.length) {
		lines.push("Config migrations:");
		for (const m of migs) lines.push(`  - ${m}`);
		lines.push("");
	}
	if (!updates.length && !adds.length && !modified.length && !missing.length && !errors.length) {
		lines.push("No managed files found in provenance.");
		lines.push("");
	}

	return lines.join("\n");
}

export async function update(
	versionArg: string | undefined,
	flags: UpdateFlags = {},
): Promise<void> {
	const root = resolve(process.cwd());

	if (flags.local) {
		process.env.KITFLY_UPDATE_SOURCE = "local";
	}
	const manifestPath = join(root, ".kitfly/manifest.json");
	const provenancePath = join(root, ".kitfly/provenance.json");

	let manifest: SiteManifest;
	try {
		manifest = await readJson<SiteManifest>(manifestPath);
	} catch {
		throw new UpdateError(
			`No .kitfly/manifest.json found.\nThis doesn't appear to be a kitfly site, or it was created before metadata tracking.`,
		);
	}

	if (!manifest.standalone) {
		throw new UpdateError(
			`This site is not in standalone mode.\n\nUpdate kitfly globally instead:\n  bun update -g kitfly`,
		);
	}

	let provenance: StandaloneProvenance;
	try {
		provenance = await readJson<StandaloneProvenance>(provenancePath);
	} catch {
		throw new UpdateError(
			`No .kitfly/provenance.json found.\nThis site may have been created before provenance tracking.`,
		);
	}

	const currentVersion = manifest.kitflyVersion || provenance.kitflyVersion || "0.0.0";
	let targetVersion: string;
	try {
		targetVersion = versionArg ? versionArg : await getLatestVersion();
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		throw new UpdateError(
			`Failed to determine latest kitfly version from GitHub.\n${msg}\n\nIf you're developing locally (no remote yet), try:\n  kitfly update --check --local`,
		);
	}

	if (flags.check) {
		const latest = versionArg ? targetVersion : targetVersion;
		console.log(`Current: ${currentVersion}`);
		console.log(`Latest:  ${latest}`);
		if (cmp(currentVersion, latest) === 0) {
			console.log("\nUp to date.");
		} else {
			console.log("\nRun 'kitfly update' to upgrade.");
		}
		return;
	}

	if (cmp(currentVersion, targetVersion) === 0) {
		console.log(`Already on kitfly ${currentVersion}`);
		return;
	}

	const baselinePaths = provenance.files.map((f) => f.path);
	const managedPaths = uniq([
		...baselinePaths,
		// Ensure schema files can be introduced on update.
		"schemas/README.md",
		"schemas/site.schema.json",
		"schemas/theme.schema.json",
		"schemas/v0/site.schema.json",
		"schemas/v0/theme.schema.json",
	]);

	const baselineByPath = new Map(provenance.files.map((f) => [f.path, f] as const));
	const decisions: FileDecision[] = [];
	const remoteCache = new Map<string, { bytes: Uint8Array; hash: string }>();

	for (const relPath of managedPaths) {
		const localPath = join(root, relPath);
		const baseline = baselineByPath.get(relPath);

		// Determine local hash/state
		let localBytes: Uint8Array | null = null;
		let localHash: string | null = null;
		try {
			const buf = await readFile(localPath);
			localBytes = new Uint8Array(buf);
			localHash = await sha256Hex(localBytes);
		} catch {
			localBytes = null;
			localHash = null;
		}

		if (baseline) {
			// Existing managed file
			if (!localBytes || !localHash) {
				decisions.push({ kind: "skip_missing", path: relPath });
				continue;
			}
			if (localHash !== baseline.sourceHash) {
				decisions.push({ kind: "skip_modified", path: relPath });
				continue;
			}
			decisions.push({ kind: "update", path: relPath });
		} else {
			// New file introduced in newer kitfly
			if (localBytes) {
				decisions.push({ kind: "skip_modified", path: relPath });
			} else {
				decisions.push({ kind: "add", path: relPath });
			}
		}
	}

	// Pre-fetch remote content for files we intend to write.
	for (const d of decisions) {
		if (d.kind !== "update" && d.kind !== "add") continue;
		try {
			const bytes = await fetchKitflyFileBytes(d.path, targetVersion);
			const hash = await sha256Hex(bytes);
			remoteCache.set(d.path, { bytes, hash });
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			remoteCache.delete(d.path);
			// Replace decision with error
			const idx = decisions.findIndex((x) => x.kind === d.kind && x.path === d.path);
			if (idx >= 0) decisions[idx] = { kind: "error", path: d.path, error: msg };
		}
	}

	const fromSchema = (await readSiteYamlSchemaVersion(root)) || manifest.schemaVersion || "0.1.0";
	const toSchema = targetVersion; // schema $version tracks release in v0.x
	const migs = getMigrationsForVersion(fromSchema, toSchema);

	const planText = formatPlan(
		currentVersion,
		targetVersion,
		decisions,
		migs.map((m) => `${m.id}: ${m.description}`),
	);
	console.log(planText);

	if (flags.dryRun) return;

	if (!flags.yes) {
		const ok = await promptConfirm(`Proceed?`);
		if (!ok) {
			console.log("Cancelled.");
			return;
		}
	}

	if (flags.migrationsOnly) {
		for (const m of migs) {
			const ctx = { root, manifest, fromSchemaVersion: fromSchema, toSchemaVersion: toSchema };
			if (await m.applies(ctx)) {
				const res = await m.apply(ctx);
				console.log(`${m.id}: ${res.message}`);
			}
		}
		return;
	}

	// Apply file updates
	const now = new Date().toISOString();
	let changed = 0;
	let skipped = 0;

	for (const d of decisions) {
		if (d.kind === "skip_modified" || d.kind === "skip_missing") {
			skipped++;
			continue;
		}
		if (d.kind === "error") {
			skipped++;
			continue;
		}

		const entry = remoteCache.get(d.path);
		if (!entry) {
			skipped++;
			continue;
		}

		// If baseline existed and file is modified, require --force.
		const baseline = baselineByPath.get(d.path);
		if (baseline) {
			const localPath = join(root, d.path);
			let localHash: string | null = null;
			try {
				const buf = await readFile(localPath);
				localHash = await sha256Hex(new Uint8Array(buf));
			} catch {
				localHash = null;
			}
			if (!localHash || localHash !== baseline.sourceHash) {
				if (!flags.force) {
					skipped++;
					continue;
				}
			}
		}

		await writeBytesAtomic(join(root, d.path), entry.bytes);
		changed++;

		// Update provenance entry (create if new)
		const localHash = await sha256Hex(entry.bytes);
		const existing = baselineByPath.get(d.path);
		if (existing) {
			existing.localHash = localHash;
			existing.modified = false;
			existing.sourceHash = entry.hash;
		} else {
			provenance.files.push({ path: d.path, sourceHash: entry.hash, localHash, modified: false });
			baselineByPath.set(d.path, provenance.files[provenance.files.length - 1]);
		}
	}

	// Mark skipped baseline files as modified (best-effort)
	for (const d of decisions) {
		if (d.kind !== "skip_modified" && d.kind !== "skip_missing") continue;
		const entry = baselineByPath.get(d.path);
		if (!entry) continue;
		entry.modified = true;
		// localHash is unknown/irrelevant if missing
		if (d.kind === "skip_missing") entry.localHash = undefined;
	}

	// Apply migrations after file updates
	for (const m of migs) {
		const ctx = { root, manifest, fromSchemaVersion: fromSchema, toSchemaVersion: toSchema };
		if (await m.applies(ctx)) {
			await m.apply(ctx);
		}
	}

	// Update metadata
	const prev = manifest.kitflyVersion;
	manifest.kitflyVersion = targetVersion;
	manifest.lastUpdated = now;
	manifest.updateHistory = manifest.updateHistory || [];
	manifest.updateHistory.push({ from: prev, to: targetVersion, date: now });
	manifest.schemaVersion = toSchema;

	provenance.kitflyVersion = targetVersion;
	provenance.updatedAt = now;

	await writeJsonAtomic(manifestPath, manifest);
	await writeJsonAtomic(provenancePath, provenance);

	console.log(`\nUpdated ${changed} file(s). Skipped ${skipped} file(s).`);
}
