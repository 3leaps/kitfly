/**
 * Tests for the Crucible template definition
 *
 * Covers: src/templates/crucible.ts
 * Strategy: import the template directly, verify structure and generated content
 */

import { describe, expect, it } from "vitest";
import { crucible } from "../templates/crucible.ts";
import type { BrandingConfig, TemplateContext, TemplateFile } from "../templates/schema.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a standard TemplateContext for testing */
function makeCtx(overrides?: Partial<TemplateContext>): TemplateContext {
	const branding: BrandingConfig = {
		siteName: "Test Crucible",
		brandName: "Acme Corp",
		brandUrl: "https://acme.example.com",
		primaryColor: "#2563eb",
		footerText: "Footer text",
	};
	return {
		name: "test-crucible",
		branding,
		template: crucible,
		year: 2026,
		...overrides,
	};
}

/** Resolve the content of a TemplateFile to a string */
function resolveContent(file: TemplateFile, ctx: TemplateContext): string {
	return typeof file.content === "function" ? file.content(ctx) : file.content;
}

/** Find a file entry by its path */
function findFile(path: string): TemplateFile {
	const f = crucible.files.find((entry) => entry.path === path);
	if (!f) throw new Error(`Template file not found: ${path}`);
	return f;
}

// ---------------------------------------------------------------------------
// Template Definition Structure
// ---------------------------------------------------------------------------

describe("crucible template definition", () => {
	it("has correct identity metadata", () => {
		expect(crucible.id).toBe("crucible");
		expect(crucible.name).toBe("Crucible");
		expect(crucible.version).toBe(1);
		expect(crucible.extends).toBe("minimal");
	});

	it("has a non-empty description", () => {
		expect(crucible.description).toBeTruthy();
		expect(crucible.description.length).toBeGreaterThan(10);
	});

	it("defines exactly six sections", () => {
		expect(crucible.sections).toHaveLength(6);
	});

	it("defines the expected section names", () => {
		const names = crucible.sections.map((s) => s.name);
		expect(names).toEqual(["Specs", "Schemas", "Config", "Policies", "Guides", "Reference"]);
	});

	it("defines the expected section paths", () => {
		const paths = crucible.sections.map((s) => s.path);
		expect(paths).toEqual([
			"content/specs",
			"content/schemas",
			"content/config",
			"content/policies",
			"content/guides",
			"content/reference",
		]);
	});

	it("every section has a description", () => {
		for (const section of crucible.sections) {
			expect(section.description).toBeTruthy();
			expect(typeof section.description).toBe("string");
		}
	});

	it("defines a non-empty files array", () => {
		expect(crucible.files.length).toBeGreaterThan(0);
	});

	it("every file has a non-empty path", () => {
		for (const file of crucible.files) {
			expect(file.path).toBeTruthy();
			expect(typeof file.path).toBe("string");
		}
	});

	it("every file has content (string or function)", () => {
		for (const file of crucible.files) {
			expect(["string", "function"]).toContain(typeof file.content);
		}
	});

	it("has no duplicate file paths", () => {
		const paths = crucible.files.map((f) => f.path);
		const unique = new Set(paths);
		expect(unique.size).toBe(paths.length);
	});
});

// ---------------------------------------------------------------------------
// site.yaml Generation
// ---------------------------------------------------------------------------

describe("crucible site.yaml", () => {
	const ctx = makeCtx();
	const file = findFile("site.yaml");

	it("exists in the file list", () => {
		expect(file).toBeDefined();
	});

	it("includes the site title from context", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('title: "Test Crucible"');
	});

	it("includes the brand name from context", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('name: "Acme Corp"');
	});

	it("includes the brand url from context", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('url: "https://acme.example.com"');
	});

	it("includes sections block with all six sections", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("sections:");
		expect(content).toContain('"Specs"');
		expect(content).toContain('"Schemas"');
		expect(content).toContain('"Config"');
		expect(content).toContain('"Policies"');
		expect(content).toContain('"Guides"');
		expect(content).toContain('"Reference"');
	});

	it("includes section paths", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('"content/specs"');
		expect(content).toContain('"content/schemas"');
		expect(content).toContain('"content/config"');
		expect(content).toContain('"content/policies"');
		expect(content).toContain('"content/guides"');
		expect(content).toContain('"content/reference"');
	});

	it("sets home page to index.md", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('home: "index.md"');
	});

	it("includes documentation link", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("https://github.com/3leaps/kitfly");
	});

	it("responds to different branding values", () => {
		const customCtx = makeCtx({
			branding: {
				siteName: "Widget SSOT",
				brandName: "Widget Inc",
				brandUrl: "/",
			},
		});
		const content = resolveContent(file, customCtx);
		expect(content).toContain('title: "Widget SSOT"');
		expect(content).toContain('name: "Widget Inc"');
		expect(content).toContain('url: "/"');
	});
});

// ---------------------------------------------------------------------------
// index.md Generation
// ---------------------------------------------------------------------------

describe("crucible index.md", () => {
	const ctx = makeCtx();
	const file = findFile("index.md");

	it("exists in the file list", () => {
		expect(file).toBeDefined();
	});

	it("starts with YAML frontmatter", () => {
		const content = resolveContent(file, ctx);
		expect(content).toMatch(/^---\n/);
		expect(content).toContain("title: Home");
	});

	it("includes site name in frontmatter description", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("description: Test Crucible - Information Architecture SSOT");
	});

	it("includes site name in the H1 heading", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("# Test Crucible");
	});

	it("contains a standards status table", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Standards Status");
		expect(content).toContain("| Area | Documents | Status |");
		expect(content).toContain("Specifications");
		expect(content).toContain("Schemas");
		expect(content).toContain("Policies");
	});

	it("contains quick links to key sections", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Quick Links");
		expect(content).toContain("[Specifications](/content/specs/overview)");
		expect(content).toContain("[Schema Catalog](/content/schemas/)");
		expect(content).toContain("[Configuration](/content/config/overview)");
		expect(content).toContain("[Getting Started](/content/guides/getting-started)");
	});

	it("describes the four-zone layout", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Four-Zone Layout");
		expect(content).toContain("**Content**");
		expect(content).toContain("**Machine**");
		expect(content).toContain("**Internal**");
		expect(content).toContain("**Engine**");
	});

	it("includes a last-updated date in ISO format", () => {
		const content = resolveContent(file, ctx);
		// The template uses new Date().toISOString().split("T")[0] which is YYYY-MM-DD
		expect(content).toMatch(/\*Last updated: \d{4}-\d{2}-\d{2}\*/);
	});
});

// ---------------------------------------------------------------------------
// Specs Section Files
// ---------------------------------------------------------------------------

describe("crucible specs section", () => {
	const ctx = makeCtx();

	describe("overview.md", () => {
		const file = findFile("content/specs/overview.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter with title and description", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Specifications");
			expect(content).toContain(`description: Standards catalog for Acme Corp`);
		});

		it("includes a standards catalog table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Standards Catalog");
			expect(content).toContain("| Spec | Version | Status | Description |");
		});

		it("includes status definitions", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Status Definitions");
			expect(content).toContain("**Draft**");
			expect(content).toContain("**Stable**");
			expect(content).toContain("**Deprecated**");
		});

		it("references the spec template", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Spec Template](./spec-template)");
		});

		it("describes specification structure requirements", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("**Purpose**");
			expect(content).toContain("**Scope**");
			expect(content).toContain("**Definitions**");
			expect(content).toContain("**Requirements**");
			expect(content).toContain("RFC 2119");
		});

		it("links to related pages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Change Procedure](/content/policies/change-procedure)");
			expect(content).toContain("[Decisions](/content/reference/decisions/)");
		});
	});

	describe("spec-template.md", () => {
		const file = findFile("content/specs/spec-template.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain('title: "SPEC-000: Specification Template"');
		});

		it("includes all required spec sections", () => {
			const content = resolveContent(file, ctx);
			const requiredSections = [
				"## Status",
				"## Purpose",
				"## Scope",
				"## Definitions",
				"## Requirements",
				"## Examples",
				"## Version History",
			];
			for (const section of requiredSections) {
				expect(content).toContain(section);
			}
		});

		it("includes RFC 2119 language guidance", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("MUST");
			expect(content).toContain("SHOULD");
			expect(content).toContain("MAY");
			expect(content).toContain("RFC 2119");
		});

		it("includes compliant and non-compliant example sections", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### Compliant");
			expect(content).toContain("### Non-Compliant");
		});

		it("is a static template (does not use context)", () => {
			// Call with two different contexts and verify the output is identical
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			const content1 = resolveContent(file, ctx);
			const content2 = resolveContent(file, ctx2);
			expect(content1).toBe(content2);
		});
	});
});

// ---------------------------------------------------------------------------
// Schemas Section Files
// ---------------------------------------------------------------------------

describe("crucible schemas section", () => {
	const ctx = makeCtx();

	describe("index.md", () => {
		const file = findFile("content/schemas/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Schema Catalog");
			expect(content).toContain(`description: Schema documentation for Acme Corp`);
		});

		it("includes a schema catalog table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Schema | Version | Path | Description |");
		});

		it("describes schema organization structure", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Schema Organization");
			expect(content).toContain("schemas/");
		});

		it("links to versioning policy", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Versioning Policy](./versioning)");
		});
	});

	describe("versioning.md", () => {
		const file = findFile("content/schemas/versioning.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Schema Versioning");
		});

		it("includes compatibility rules table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Compatibility Rules");
			expect(content).toContain("| Change Type | Example | Compatibility |");
			expect(content).toContain("**Breaking**");
			expect(content).toContain("Backward compatible");
		});

		it("documents migration process", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Migration");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});
});

// ---------------------------------------------------------------------------
// Config Section Files
// ---------------------------------------------------------------------------

describe("crucible config section", () => {
	const ctx = makeCtx();

	describe("overview.md", () => {
		const file = findFile("content/config/overview.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("references brand name in frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain(`description: Configuration documentation for Acme Corp`);
		});

		it("lists configuration areas", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Configuration Areas");
			expect(content).toContain("Agentic Roles");
			expect(content).toContain("Agentic Prompts");
			expect(content).toContain("Taxonomies");
		});

		it("links to roles and prompts pages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Role Definitions](./roles)");
			expect(content).toContain("[Prompt Templates](./prompts)");
		});
	});

	describe("roles.md", () => {
		const file = findFile("content/config/roles.md");

		it("exists and references brand name", () => {
			expect(file).toBeDefined();
			const content = resolveContent(file, ctx);
			expect(content).toContain(`description: AI agent role catalog for Acme Corp`);
		});

		it("lists a role catalog table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Role Catalog");
			expect(content).toContain("`devlead`");
			expect(content).toContain("`infoarch`");
			expect(content).toContain("`qa`");
		});

		it("shows role file YAML example", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("```yaml");
			expect(content).toContain("name: devlead");
			expect(content).toContain("category: agentic");
		});
	});

	describe("prompts.md", () => {
		const file = findFile("content/config/prompts.md");

		it("exists and references brand name", () => {
			expect(file).toBeDefined();
			const content = resolveContent(file, ctx);
			expect(content).toContain(`description: Reusable AI prompt templates for Acme Corp`);
		});

		it("shows prompt file YAML example", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("```yaml");
			expect(content).toContain("name: write-spec");
		});
	});
});

// ---------------------------------------------------------------------------
// Policies Section Files
// ---------------------------------------------------------------------------

describe("crucible policies section", () => {
	const ctx = makeCtx();

	describe("security-model.md", () => {
		const file = findFile("content/policies/security-model.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("references brand name in frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain(`description: Security baseline for Acme Corp`);
		});

		it("defines security principles", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Principles");
			expect(content).toContain("Safe by default");
			expect(content).toContain("Least privilege");
			expect(content).toContain("Defense in depth");
			expect(content).toContain("Audit everything");
		});

		it("includes access control table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Access Control");
			expect(content).toContain("| Resource | Who | Access Level |");
		});

		it("includes review requirements", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Review Requirements");
		});

		it("warns against storing secrets", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("Never store secrets in this repository");
		});
	});

	describe("dependency-policy.md", () => {
		const file = findFile("content/policies/dependency-policy.md");

		it("exists and is a static template", () => {
			expect(file).toBeDefined();
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});

		it("includes dependency categories table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Dependency Categories");
			expect(content).toContain("Runtime");
			expect(content).toContain("Dev/Build");
		});

		it("describes adding and removing dependencies", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Adding a Dependency");
			expect(content).toContain("## Removing a Dependency");
		});
	});

	describe("change-procedure.md", () => {
		const file = findFile("content/policies/change-procedure.md");

		it("exists and references brand name", () => {
			expect(file).toBeDefined();
			const content = resolveContent(file, ctx);
			expect(content).toContain(`description: How changes flow through Acme Corp`);
		});

		it("defines change types with approval levels", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Change Types");
			expect(content).toContain("New spec");
			expect(content).toContain("Schema breaking change");
			expect(content).toContain("Policy change");
		});

		it("documents the four-step process", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### 1. Propose");
			expect(content).toContain("### 2. Review");
			expect(content).toContain("### 3. Accept");
			expect(content).toContain("### 4. Communicate");
		});
	});
});

// ---------------------------------------------------------------------------
// Guides Section Files
// ---------------------------------------------------------------------------

describe("crucible guides section", () => {
	const ctx = makeCtx();

	describe("getting-started.md", () => {
		const file = findFile("content/guides/getting-started.md");

		it("exists and references branding", () => {
			expect(file).toBeDefined();
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Getting Started");
			expect(content).toContain(`description: How to consume and use Acme Corp`);
		});

		it("uses site name in body content", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("Test Crucible is the single source of truth");
		});

		it("covers consumers, contributors, and AI agents", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## For Consumers");
			expect(content).toContain("## For Contributors");
			expect(content).toContain("## For AI Agents");
		});

		it("references schema and config paths", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("schemas/");
			expect(content).toContain("config/");
		});

		it("links to change procedure and contributing guide", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Change Procedure](/content/policies/change-procedure)");
			expect(content).toContain("[Contributing Guide](./contributing)");
		});
	});

	describe("contributing.md", () => {
		const file = findFile("content/guides/contributing.md");

		it("exists and references brand name", () => {
			expect(file).toBeDefined();
			const content = resolveContent(file, ctx);
			expect(content).toContain(`description: How to add specs, schemas, and config to Acme Corp`);
		});

		it("documents how to add specs, schemas, config, and decisions", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Adding a Specification");
			expect(content).toContain("## Adding a Schema");
			expect(content).toContain("## Adding Configuration");
			expect(content).toContain("## Adding a Decision Record");
		});

		it("includes a style guide", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Style Guide");
		});
	});
});

// ---------------------------------------------------------------------------
// Reference Section Files
// ---------------------------------------------------------------------------

describe("crucible reference section", () => {
	const ctx = makeCtx();

	describe("decisions/index.md", () => {
		const file = findFile("content/reference/decisions/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("is a static template", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});

		it("includes a decision log table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("# Decision Log");
			expect(content).toContain("| ID | Decision | Date | Status |");
		});

		it("links to the ADR template", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[ADR Template](./adr-template)");
		});
	});

	describe("decisions/adr-template.md", () => {
		const file = findFile("content/reference/decisions/adr-template.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter with ADR-000 title", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain('title: "ADR-000: Decision Template"');
		});

		it("includes all ADR sections", () => {
			const content = resolveContent(file, ctx);
			const requiredSections = [
				"## Status",
				"## Context",
				"## Options Considered",
				"## Decision",
				"## Consequences",
			];
			for (const section of requiredSections) {
				expect(content).toContain(section);
			}
		});

		it("includes positive, negative, and risks subsections", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### Positive");
			expect(content).toContain("### Negative");
			expect(content).toContain("### Risks");
		});
	});

	describe("changelog/index.md", () => {
		const file = findFile("content/reference/changelog/index.md");

		it("exists and references brand name", () => {
			expect(file).toBeDefined();
			const content = resolveContent(file, ctx);
			expect(content).toContain(`description: Release history for Acme Corp`);
		});

		it("includes versioning and release process", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Versioning");
			expect(content).toContain("## Release Process");
		});
	});

	describe("glossary.md", () => {
		const file = findFile("content/reference/glossary.md");

		it("exists and references brand name", () => {
			expect(file).toBeDefined();
			const content = resolveContent(file, ctx);
			expect(content).toContain(`description: Terminology and definitions for Acme Corp`);
		});

		it("defines key ecosystem terms", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("Crucible");
			expect(content).toContain("SSOT");
			expect(content).toContain("Spec");
			expect(content).toContain("Schema");
			expect(content).toContain("ADR");
		});

		it("includes naming conventions table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Naming Conventions");
			expect(content).toContain("SPEC-NNN");
			expect(content).toContain("ADR-NNN");
		});
	});
});

// ---------------------------------------------------------------------------
// Internal Zone
// ---------------------------------------------------------------------------

describe("crucible internal zone", () => {
	const ctx = makeCtx();

	describe("internal/ops/README.md", () => {
		const file = findFile("internal/ops/README.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("describes what goes in the internal zone", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## What Goes Here");
			expect(content).toContain("## What Does NOT Go Here");
		});

		it("describes the four-zone model", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Four-Zone Model");
			expect(content).toContain("Content");
			expect(content).toContain("Machine");
			expect(content).toContain("**Internal**");
			expect(content).toContain("Engine");
		});
	});
});

// ---------------------------------------------------------------------------
// CUSTOMIZING.md
// ---------------------------------------------------------------------------

describe("crucible CUSTOMIZING.md", () => {
	const ctx = makeCtx();
	const file = findFile("CUSTOMIZING.md");

	it("exists in the file list", () => {
		expect(file).toBeDefined();
	});

	it("has frontmatter with template metadata", () => {
		const content = resolveContent(file, ctx);
		expect(content).toMatch(/^---\n/);
		expect(content).toContain("template: crucible");
		expect(content).toContain("template_version: 1");
	});

	it("includes the site name in the heading", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("# Customizing Test Crucible");
	});

	it("documents the four-zone layout", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Four-Zone Layout");
		expect(content).toContain("**Content**");
		expect(content).toContain("**Machine**");
		expect(content).toContain("**Internal**");
		expect(content).toContain("**Engine**");
	});

	it("uses the project name in the directory tree", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("test-crucible/");
	});

	it("documents site.yaml configuration", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### site.yaml");
		expect(content).toContain('title: "Test Crucible"');
		expect(content).toContain('name: "Acme Corp"');
	});

	it("documents theme.yaml customization", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### theme.yaml");
	});

	it("includes the current year in footer example", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("2026 Acme Corp");
	});

	it("covers adding content types", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### New Specification");
		expect(content).toContain("### New Schema");
		expect(content).toContain("### New Config Catalog");
		expect(content).toContain("### New Policy");
		expect(content).toContain("### New Decision Record");
		expect(content).toContain("### New Section");
	});

	it("covers machine artifacts", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Machine Artifacts");
		expect(content).toContain("### Adding Schemas");
		expect(content).toContain("### Adding Config");
	});

	it("includes document conventions for each content type", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### Specifications");
		expect(content).toContain("### Schemas");
		expect(content).toContain("### Config");
		expect(content).toContain("### Policies");
	});

	it("responds to different context values", () => {
		const customCtx = makeCtx({
			name: "my-project",
			branding: {
				siteName: "My SSOT",
				brandName: "My Brand",
				brandUrl: "/",
			},
			year: 2027,
		});
		const content = resolveContent(file, customCtx);
		expect(content).toContain("# Customizing My SSOT");
		expect(content).toContain("my-project/");
		expect(content).toContain('name: "My Brand"');
		expect(content).toContain("2027 My Brand");
	});
});

// ---------------------------------------------------------------------------
// File Coverage Completeness
// ---------------------------------------------------------------------------

describe("crucible file coverage", () => {
	const expectedFiles = [
		"site.yaml",
		"index.md",
		"content/specs/overview.md",
		"content/specs/spec-template.md",
		"content/schemas/index.md",
		"content/schemas/versioning.md",
		"content/config/overview.md",
		"content/config/roles.md",
		"content/config/prompts.md",
		"content/policies/security-model.md",
		"content/policies/dependency-policy.md",
		"content/policies/change-procedure.md",
		"content/guides/getting-started.md",
		"content/guides/contributing.md",
		"content/reference/decisions/index.md",
		"content/reference/decisions/adr-template.md",
		"content/reference/changelog/index.md",
		"content/reference/glossary.md",
		"internal/ops/README.md",
		"CUSTOMIZING.md",
	];

	it("defines exactly the expected set of files", () => {
		const actualPaths = crucible.files.map((f) => f.path).sort();
		const expected = [...expectedFiles].sort();
		expect(actualPaths).toEqual(expected);
	});

	it("all content generators produce non-empty strings", () => {
		const ctx = makeCtx();
		for (const file of crucible.files) {
			const content = resolveContent(file, ctx);
			expect(content.length).toBeGreaterThan(0);
			expect(typeof content).toBe("string");
		}
	});

	it("all markdown files start with YAML frontmatter or a markdown heading", () => {
		const ctx = makeCtx();
		for (const file of crucible.files) {
			if (!file.path.endsWith(".md")) continue;
			const content = resolveContent(file, ctx);
			const startsWithFrontmatter = content.startsWith("---\n");
			const startsWithHeading = content.startsWith("#");
			expect(startsWithFrontmatter || startsWithHeading).toBe(true);
		}
	});

	it("site.yaml starts with a YAML comment", () => {
		const ctx = makeCtx();
		const file = findFile("site.yaml");
		const content = resolveContent(file, ctx);
		expect(content.startsWith("#")).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// Branding Substitution Across All Context-Dependent Files
// ---------------------------------------------------------------------------

describe("crucible branding substitution", () => {
	it("context-dependent files use brandName, not a hardcoded value", () => {
		const ctx1 = makeCtx({
			branding: {
				siteName: "Alpha SSOT",
				brandName: "Alpha Corp",
				brandUrl: "/",
			},
		});
		const ctx2 = makeCtx({
			branding: {
				siteName: "Beta SSOT",
				brandName: "Beta Corp",
				brandUrl: "/",
			},
		});

		// Files that use ctx.branding.brandName in their description
		const brandDependentFiles = [
			"content/specs/overview.md",
			"content/schemas/index.md",
			"content/config/overview.md",
			"content/config/roles.md",
			"content/config/prompts.md",
			"content/policies/security-model.md",
			"content/policies/change-procedure.md",
			"content/guides/getting-started.md",
			"content/guides/contributing.md",
			"content/reference/changelog/index.md",
			"content/reference/glossary.md",
		];

		for (const path of brandDependentFiles) {
			const file = findFile(path);
			const content1 = resolveContent(file, ctx1);
			const content2 = resolveContent(file, ctx2);

			expect(content1).toContain("Alpha Corp");
			expect(content1).not.toContain("Beta Corp");
			expect(content2).toContain("Beta Corp");
			expect(content2).not.toContain("Alpha Corp");
		}
	});

	it("context-dependent files use siteName where appropriate", () => {
		const ctx1 = makeCtx({
			branding: {
				siteName: "Gamma Hub",
				brandName: "Gamma Inc",
				brandUrl: "/",
			},
		});

		// site.yaml and index.md use siteName
		const siteYaml = resolveContent(findFile("site.yaml"), ctx1);
		expect(siteYaml).toContain("Gamma Hub");

		const indexMd = resolveContent(findFile("index.md"), ctx1);
		expect(indexMd).toContain("Gamma Hub");

		const customizing = resolveContent(findFile("CUSTOMIZING.md"), ctx1);
		expect(customizing).toContain("Gamma Hub");

		const gettingStarted = resolveContent(findFile("content/guides/getting-started.md"), ctx1);
		expect(gettingStarted).toContain("Gamma Hub");
	});
});
