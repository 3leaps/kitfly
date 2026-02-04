/**
 * Tests for the template initialization system
 *
 * Covers: src/commands/init.ts and src/templates/driver.ts
 * Strategy: run templates against real temp directories, verify output files and content
 */

import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { init } from "../commands/init.ts";
import { defaultBranding, getTemplate, listTemplates, runTemplate } from "../templates/driver.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tempDir: string;
let originalCwd: string;

beforeEach(async () => {
	originalCwd = process.cwd();
	tempDir = await mkdtemp(join(tmpdir(), "kitfly-init-test-"));
	process.chdir(tempDir);
});

afterEach(async () => {
	process.chdir(originalCwd);
	await rm(tempDir, { recursive: true, force: true });
});

/** Read a file from the generated project as utf-8 text */
async function readGenerated(projectName: string, relPath: string): Promise<string> {
	return readFile(join(tempDir, projectName, relPath), "utf-8");
}

/** Check whether a path exists inside the generated project */
function generatedExists(projectName: string, relPath: string): boolean {
	return existsSync(join(tempDir, projectName, relPath));
}

// ---------------------------------------------------------------------------
// Template Registry
// ---------------------------------------------------------------------------

describe("template registry", () => {
	it("lists all registered templates", () => {
		const templates = listTemplates();
		const ids = templates.map((t) => t.id);

		expect(ids).toContain("minimal");
		expect(ids).toContain("handbook");
		expect(templates.length).toBeGreaterThanOrEqual(2);
	});

	it("retrieves a template by id", () => {
		const tpl = getTemplate("handbook");
		expect(tpl).toBeDefined();
		expect(tpl?.id).toBe("handbook");
		expect(tpl?.extends).toBe("minimal");
	});

	it("returns undefined for unknown template", () => {
		expect(getTemplate("nonexistent")).toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
// Minimal Template
// ---------------------------------------------------------------------------

describe("minimal template", () => {
	const projectName = "test-minimal";

	it("creates the expected file structure", async () => {
		await runTemplate({
			name: projectName,
			template: "minimal",
			git: false,
		});

		// Core files from minimal template
		expect(generatedExists(projectName, "site.yaml")).toBe(true);
		expect(generatedExists(projectName, "index.md")).toBe(true);
		expect(generatedExists(projectName, ".gitignore")).toBe(true);
		expect(generatedExists(projectName, "README.md")).toBe(true);

		// Section directories
		expect(generatedExists(projectName, "content")).toBe(true);
		expect(generatedExists(projectName, "assets/brand")).toBe(true);

		// Gitkeep files to preserve empty dirs
		expect(generatedExists(projectName, "content/.gitkeep")).toBe(true);
		expect(generatedExists(projectName, "assets/brand/.gitkeep")).toBe(true);

		// Manifest metadata
		expect(generatedExists(projectName, ".kitfly/manifest.json")).toBe(true);
	});

	it("generates site.yaml with correct branding defaults", async () => {
		await runTemplate({
			name: projectName,
			template: "minimal",
			git: false,
		});

		const siteYaml = await readGenerated(projectName, "site.yaml");

		// Default branding derives title-case name from project name
		expect(siteYaml).toContain('title: "Test Minimal"');
		expect(siteYaml).toContain('name: "Test Minimal"');
		expect(siteYaml).toContain('url: "/"');
	});

	it("generates index.md with frontmatter", async () => {
		await runTemplate({
			name: projectName,
			template: "minimal",
			git: false,
		});

		const indexMd = await readGenerated(projectName, "index.md");

		// Has YAML frontmatter
		expect(indexMd).toMatch(/^---\n/);
		expect(indexMd).toContain("title: Welcome");
		expect(indexMd).toContain("description: Test Minimal documentation");
		// Body content references the site
		expect(indexMd).toContain("Welcome to Test Minimal");
	});

	it("writes manifest with template metadata", async () => {
		await runTemplate({
			name: projectName,
			template: "minimal",
			git: false,
		});

		const manifestRaw = await readGenerated(projectName, ".kitfly/manifest.json");
		const manifest = JSON.parse(manifestRaw);

		expect(manifest.template).toBe("minimal");
		expect(manifest.templateVersion).toBe(1);
		expect(manifest.standalone).toBe(false);
		expect(manifest.created).toBeTruthy();
		expect(manifest.kitflyVersion).toBeTruthy();
	});

	it("does not create .git directory when git: false", async () => {
		await runTemplate({
			name: projectName,
			template: "minimal",
			git: false,
		});

		expect(generatedExists(projectName, ".git")).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// Handbook Template (extends minimal)
// ---------------------------------------------------------------------------

describe("handbook template", () => {
	const projectName = "test-handbook";

	it("creates handbook sections and starter files", async () => {
		await runTemplate({
			name: projectName,
			template: "handbook",
			git: false,
		});

		// Handbook-specific section directories
		expect(generatedExists(projectName, "content/overview")).toBe(true);
		expect(generatedExists(projectName, "content/guides")).toBe(true);
		expect(generatedExists(projectName, "content/reference")).toBe(true);

		// Handbook starter content files
		expect(generatedExists(projectName, "content/overview/introduction.md")).toBe(true);
		expect(generatedExists(projectName, "content/guides/getting-started.md")).toBe(true);
		expect(generatedExists(projectName, "content/reference/glossary.md")).toBe(true);

		// Handbook-specific extras
		expect(generatedExists(projectName, "CUSTOMIZING.md")).toBe(true);
	});

	it("inherits minimal template files", async () => {
		await runTemplate({
			name: projectName,
			template: "handbook",
			git: false,
		});

		// Files from minimal (base) template should also be present
		expect(generatedExists(projectName, ".gitignore")).toBe(true);
		expect(generatedExists(projectName, "content/.gitkeep")).toBe(true);
		expect(generatedExists(projectName, "assets/brand/.gitkeep")).toBe(true);

		// Inherited section directories from minimal
		expect(generatedExists(projectName, "content")).toBe(true);
		expect(generatedExists(projectName, "assets/brand")).toBe(true);
	});

	it("handbook site.yaml includes section definitions", async () => {
		await runTemplate({
			name: projectName,
			template: "handbook",
			git: false,
		});

		const siteYaml = await readGenerated(projectName, "site.yaml");

		// Handbook overrides minimal's site.yaml with section config
		expect(siteYaml).toContain("sections:");
		expect(siteYaml).toContain('"Overview"');
		expect(siteYaml).toContain('"Guides"');
		expect(siteYaml).toContain('"Reference"');
		expect(siteYaml).toContain("content/overview");
		expect(siteYaml).toContain("content/guides");
		expect(siteYaml).toContain("content/reference");
	});

	it("handbook starter files contain correct frontmatter", async () => {
		await runTemplate({
			name: projectName,
			template: "handbook",
			git: false,
		});

		const intro = await readGenerated(projectName, "content/overview/introduction.md");
		expect(intro).toMatch(/^---\n/);
		expect(intro).toContain("title: Introduction");
		expect(intro).toContain("description: Introduction to Test Handbook");

		const guide = await readGenerated(projectName, "content/guides/getting-started.md");
		expect(guide).toContain("title: Getting Started");

		const glossary = await readGenerated(projectName, "content/reference/glossary.md");
		expect(glossary).toContain("title: Glossary");
	});

	it("manifest records handbook template", async () => {
		await runTemplate({
			name: projectName,
			template: "handbook",
			git: false,
		});

		const manifestRaw = await readGenerated(projectName, ".kitfly/manifest.json");
		const manifest = JSON.parse(manifestRaw);

		expect(manifest.template).toBe("handbook");
		expect(manifest.standalone).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// Custom Branding
// ---------------------------------------------------------------------------

describe("custom branding", () => {
	const projectName = "branded-site";

	it("applies brand name override to generated files", async () => {
		await runTemplate({
			name: projectName,
			template: "minimal",
			git: false,
			branding: {
				brandName: "Acme Corp",
				siteName: "Acme Corp",
			},
		});

		const siteYaml = await readGenerated(projectName, "site.yaml");
		expect(siteYaml).toContain('name: "Acme Corp"');
		expect(siteYaml).toContain('title: "Acme Corp"');

		const indexMd = await readGenerated(projectName, "index.md");
		expect(indexMd).toContain("Welcome to Acme Corp");
		expect(indexMd).toContain("description: Acme Corp documentation");
	});

	it("applies brand URL override", async () => {
		await runTemplate({
			name: projectName,
			template: "minimal",
			git: false,
			branding: {
				brandUrl: "https://acme.example.com",
			},
		});

		const siteYaml = await readGenerated(projectName, "site.yaml");
		expect(siteYaml).toContain('url: "https://acme.example.com"');
	});
});

// ---------------------------------------------------------------------------
// init() via CLI entry point
// ---------------------------------------------------------------------------

describe("init() entry point", () => {
	const projectName = "test-via-init";

	it("creates a site using the default minimal template", async () => {
		await init(projectName, { git: false });

		expect(generatedExists(projectName, "site.yaml")).toBe(true);
		expect(generatedExists(projectName, "index.md")).toBe(true);
		expect(generatedExists(projectName, ".gitignore")).toBe(true);
		expect(generatedExists(projectName, ".kitfly/manifest.json")).toBe(true);
	});

	it("creates a handbook site when template flag is set", async () => {
		await init(projectName, { template: "handbook", git: false });

		expect(generatedExists(projectName, "content/overview/introduction.md")).toBe(true);
		expect(generatedExists(projectName, "content/guides/getting-started.md")).toBe(true);
		expect(generatedExists(projectName, "CUSTOMIZING.md")).toBe(true);
	});

	it("passes brand overrides through to template context", async () => {
		await init(projectName, {
			git: false,
			brand: "Widget Co",
		});

		const siteYaml = await readGenerated(projectName, "site.yaml");
		expect(siteYaml).toContain('name: "Widget Co"');
		expect(siteYaml).toContain('title: "Widget Co"');
	});
});

// ---------------------------------------------------------------------------
// Standalone Mode
// ---------------------------------------------------------------------------

describe("standalone mode", () => {
	const projectName = "test-standalone";

	it("copies site scripts and generates package.json", async () => {
		await runTemplate({
			name: projectName,
			template: "minimal",
			git: false,
			standalone: true,
		});

		// Standalone package.json
		expect(generatedExists(projectName, "package.json")).toBe(true);
		const pkgRaw = await readGenerated(projectName, "package.json");
		const pkg = JSON.parse(pkgRaw);
		expect(pkg.name).toBe(projectName);
		expect(pkg.scripts.dev).toBe("bun run scripts/dev.ts");
		expect(pkg.scripts.build).toBe("bun run scripts/build.ts");
		expect(pkg.dependencies.marked).toBeTruthy();

		// Standalone provenance tracking
		expect(generatedExists(projectName, ".kitfly/provenance.json")).toBe(true);
		const provRaw = await readGenerated(projectName, ".kitfly/provenance.json");
		const prov = JSON.parse(provRaw);
		expect(prov.template).toBe("minimal");
		expect(prov.files.length).toBeGreaterThan(0);

		// Manifest records standalone: true
		const manifestRaw = await readGenerated(projectName, ".kitfly/manifest.json");
		const manifest = JSON.parse(manifestRaw);
		expect(manifest.standalone).toBe(true);
	});

	it("copies core site engine files", async () => {
		await runTemplate({
			name: projectName,
			template: "minimal",
			git: false,
			standalone: true,
		});

		// Key standalone files should be copied from kitfly source
		expect(generatedExists(projectName, "scripts/dev.ts")).toBe(true);
		expect(generatedExists(projectName, "scripts/build.ts")).toBe(true);
		expect(generatedExists(projectName, "scripts/bundle.ts")).toBe(true);
		expect(generatedExists(projectName, "src/shared.ts")).toBe(true);
		expect(generatedExists(projectName, "src/engine.ts")).toBe(true);
		expect(generatedExists(projectName, "src/theme.ts")).toBe(true);
	});

	it("generates standalone-specific README", async () => {
		await runTemplate({
			name: projectName,
			template: "minimal",
			git: false,
			standalone: true,
		});

		const readme = await readGenerated(projectName, "README.md");
		expect(readme).toContain("standalone mode");
		expect(readme).toContain("bun install");
		expect(readme).toContain("bun run dev");
	});
});

// ---------------------------------------------------------------------------
// Default Branding Derivation
// ---------------------------------------------------------------------------

describe("defaultBranding", () => {
	it("converts hyphenated name to title case", () => {
		const b = defaultBranding("my-cool-project");
		expect(b.siteName).toBe("My Cool Project");
		expect(b.brandName).toBe("My Cool Project");
	});

	it("converts underscore name to title case", () => {
		const b = defaultBranding("team_handbook");
		expect(b.siteName).toBe("Team Handbook");
	});

	it("defaults brandUrl to /", () => {
		const b = defaultBranding("anything");
		expect(b.brandUrl).toBe("/");
	});

	it("includes footer text with current year", () => {
		const b = defaultBranding("acme");
		const year = new Date().getFullYear();
		expect(b.footerText).toContain(String(year));
		expect(b.footerText).toContain("Acme");
	});
});

// ---------------------------------------------------------------------------
// Error: directory already exists and non-empty
// ---------------------------------------------------------------------------

describe("directory conflict", () => {
	it("runTemplate throws for unknown template", async () => {
		await expect(
			runTemplate({
				name: "whatever",
				template: "does-not-exist",
				git: false,
			}),
		).rejects.toThrow("Unknown template: does-not-exist");
	});
});
