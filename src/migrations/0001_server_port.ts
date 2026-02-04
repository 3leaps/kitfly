import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Migration, MigrationContext } from "./schema.ts";

const SNIPPET = [
	"",
	"# Server configuration (optional)",
	"# server:",
	"#   port: 3333",
	'#   host: "localhost"',
	"",
].join("\n");

export const migration: Migration = {
	id: "0001_server_port",
	version: "0.1.0",
	description: "Add server.port configuration option (commented)",
	breaking: false,
	applies: async (ctx: MigrationContext) => {
		const sitePath = join(ctx.root, "site.yaml");
		try {
			const content = await readFile(sitePath, "utf-8");
			return !/^server\s*:/m.test(content);
		} catch {
			return false;
		}
	},
	describe: () =>
		[
			"Adds an optional server section you can enable:",
			"",
			"server:",
			"  port: 3333",
			'  host: "localhost"',
			"",
			"Kitfly defaults remain unchanged if you skip this.",
		].join("\n"),
	apply: async (ctx: MigrationContext) => {
		const sitePath = join(ctx.root, "site.yaml");
		let content: string;
		try {
			content = await readFile(sitePath, "utf-8");
		} catch {
			return { applied: false, message: "site.yaml not found" };
		}
		if (/^server\s*:/m.test(content)) {
			return { applied: false, message: "server config already exists" };
		}
		await writeFile(sitePath, `${content.replace(/\s+$/, "")}\n${SNIPPET}`, "utf-8");
		return { applied: true, message: "Appended server config snippet" };
	},
};
