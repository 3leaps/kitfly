import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Migration, MigrationContext } from "./schema.ts";

const SNIPPET = [
	"",
	"# Brand assets (optional)",
	"# brand:",
	'#   logo: "assets/brand/logo.png"',
	'#   favicon: "assets/brand/favicon.png"',
	'#   logoType: "icon"  # icon | wordmark',
	"",
].join("\n");

export const migration: Migration = {
	id: "0002_brand_logo",
	version: "0.1.0",
	description: "Add brand.logo and brand.favicon options (commented)",
	breaking: false,
	applies: async (ctx: MigrationContext) => {
		const sitePath = join(ctx.root, "site.yaml");
		try {
			const content = await readFile(sitePath, "utf-8");
			return !/\n\s*logo\s*:/m.test(content) && !/\n\s*favicon\s*:/m.test(content);
		} catch {
			return false;
		}
	},
	describe: () =>
		[
			"Adds optional brand asset fields (logo + favicon).",
			"",
			"These are already supported by Kitfly defaults; this just documents them in site.yaml.",
		].join("\n"),
	apply: async (ctx: MigrationContext) => {
		const sitePath = join(ctx.root, "site.yaml");
		let content: string;
		try {
			content = await readFile(sitePath, "utf-8");
		} catch {
			return { applied: false, message: "site.yaml not found" };
		}
		if (/\n\s*logo\s*:/m.test(content) || /\n\s*favicon\s*:/m.test(content)) {
			return { applied: false, message: "brand asset fields already present" };
		}
		await writeFile(sitePath, `${content.replace(/\s+$/, "")}\n${SNIPPET}`, "utf-8");
		return { applied: true, message: "Appended brand asset snippet" };
	},
};
