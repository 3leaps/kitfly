/**
 * kitfly init - Create a new site from template
 *
 * Usage:
 *   kitfly init <name> [--template <type>] [--no-git]
 *
 * Templates: minimal, handbook (more coming)
 */

import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { getTemplate, listTemplates, runTemplate } from "../templates/driver.ts";
import type { InitOptions } from "../templates/schema.ts";

export interface InitFlags {
	template?: string;
	git?: boolean;
	prompt?: boolean;
	standalone?: boolean; // Copy site code for self-contained operation
	aiAssist?: boolean; // Add AI assistance instrumentation
	// Branding overrides
	brand?: string;
	brandUrl?: string;
}

export async function init(name: string, flags: InitFlags = {}) {
	const dest = join(process.cwd(), name);

	// Check if directory exists and is non-empty
	try {
		const stats = await stat(dest);
		if (stats.isDirectory()) {
			const contents = await readdir(dest);
			if (contents.length > 0) {
				console.error(`Error: Directory '${name}' exists and is not empty`);
				process.exit(1);
			}
			// Directory exists but is empty - that's fine
			console.log(`Using existing empty directory: ${name}/`);
		}
	} catch {
		// Directory doesn't exist - that's fine, will be created
	}

	// Validate template
	const templateId = flags.template || "minimal";
	const template = getTemplate(templateId);

	if (!template) {
		console.error(`Error: Unknown template '${templateId}'`);
		console.error(`\nAvailable templates:`);
		for (const t of listTemplates()) {
			console.error(`  ${t.id.padEnd(12)} - ${t.description}`);
		}
		process.exit(1);
	}

	// Build options
	const options: InitOptions = {
		name,
		template: templateId,
		git: flags.git,
		prompt: flags.prompt,
		standalone: flags.standalone,
		aiAssist: flags.aiAssist,
		branding: {},
	};

	// Apply branding overrides from flags
	const branding = options.branding ?? {};
	if (flags.brand) {
		branding.brandName = flags.brand;
		branding.siteName = flags.brand;
	}
	if (flags.brandUrl) {
		branding.brandUrl = flags.brandUrl;
	}
	options.branding = branding;

	// Run the template
	await runTemplate(options);
}

/**
 * List available templates
 */
export function listAvailableTemplates(): void {
	console.log("Available templates:\n");
	for (const t of listTemplates()) {
		console.log(`  ${t.id.padEnd(12)} - ${t.description}`);
	}
}
