import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Migration, MigrationContext } from "./schema.ts";

function ensureYamlSchemaComment(content: string, schemaPath: string): string {
	const lines = content.split("\n");
	const desired = `# yaml-language-server: $schema=${schemaPath}`;
	if (lines[0]?.startsWith("# yaml-language-server:")) {
		lines[0] = desired;
		return lines.join("\n");
	}
	return `${desired}\n${content}`;
}

function ensureSiteSchemaVersion(content: string, version: string): string {
	if (/^schemaVersion\s*:/m.test(content)) return content;
	const lines = content.split("\n");
	const insertLine = `schemaVersion: "${version}"`;
	if (lines[0]?.startsWith("# yaml-language-server:")) {
		lines.splice(1, 0, insertLine);
		return lines.join("\n");
	}
	return `${insertLine}\n${content}`;
}

export const migration: Migration = {
	id: "0000_schema_versioning",
	version: "0.1.0",
	description: "Add schemaVersion and update $schema comment paths",
	breaking: false,
	applies: async (ctx: MigrationContext) => {
		const sitePath = join(ctx.root, "site.yaml");
		try {
			const content = await readFile(sitePath, "utf-8");
			return (
				!content.startsWith("# yaml-language-server: $schema=./schemas/v0/site.schema.json") ||
				!/^schemaVersion\s*:/m.test(content)
			);
		} catch {
			return false;
		}
	},
	describe: () =>
		[
			"Ensures site.yaml includes:",
			"",
			"# yaml-language-server: $schema=./schemas/v0/site.schema.json",
			'schemaVersion: "0.1.0"',
			"",
			"This is additive; it does not change runtime behavior.",
		].join("\n"),
	apply: async (ctx: MigrationContext) => {
		const sitePath = join(ctx.root, "site.yaml");
		let content: string;
		try {
			content = await readFile(sitePath, "utf-8");
		} catch {
			return { applied: false, message: "site.yaml not found" };
		}

		let next = ensureYamlSchemaComment(content, "./schemas/v0/site.schema.json");
		next = ensureSiteSchemaVersion(next, ctx.toSchemaVersion);
		if (next === content) return { applied: false, message: "site.yaml already up to date" };
		await writeFile(sitePath, next, "utf-8");
		return { applied: true, message: "Updated site.yaml schema header" };
	},
};
