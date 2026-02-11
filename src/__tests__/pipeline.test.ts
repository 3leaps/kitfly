/**
 * Tests for the Pipeline template definition
 *
 * Covers: src/templates/pipeline.ts
 * Strategy: import the template directly, verify structure and generated content
 */

import { describe, expect, it } from "vitest";
import { pipeline } from "../templates/pipeline.ts";
import type { BrandingConfig, TemplateContext, TemplateFile } from "../templates/schema.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a standard TemplateContext for testing */
function makeCtx(overrides?: Partial<TemplateContext>): TemplateContext {
	const branding: BrandingConfig = {
		siteName: "Test Pipeline",
		brandName: "Acme Corp",
		brandUrl: "https://acme.example.com",
		primaryColor: "#2563eb",
		footerText: "Footer text",
	};
	return {
		name: "test-pipeline",
		branding,
		template: pipeline,
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
	const f = pipeline.files.find((entry) => entry.path === path);
	if (!f) throw new Error(`Template file not found: ${path}`);
	return f;
}

// ---------------------------------------------------------------------------
// Template Definition Structure
// ---------------------------------------------------------------------------

describe("pipeline template definition", () => {
	it("has correct identity metadata", () => {
		expect(pipeline.id).toBe("pipeline");
		expect(pipeline.name).toBe("Pipeline");
		expect(pipeline.version).toBe(1);
		expect(pipeline.extends).toBe("minimal");
	});

	it("has a non-empty description", () => {
		expect(pipeline.description).toBeTruthy();
		expect(pipeline.description.length).toBeGreaterThan(10);
	});

	it("defines exactly six sections", () => {
		expect(pipeline.sections).toHaveLength(6);
	});

	it("defines the expected section names", () => {
		const names = pipeline.sections.map((s) => s.name);
		expect(names).toEqual([
			"Pipeline",
			"Sources",
			"Destinations",
			"Operations",
			"Troubleshooting",
			"Reference",
		]);
	});

	it("defines the expected section paths", () => {
		const paths = pipeline.sections.map((s) => s.path);
		expect(paths).toEqual([
			"content/pipeline",
			"content/sources",
			"content/destinations",
			"content/operations",
			"content/troubleshooting",
			"content/reference",
		]);
	});

	it("every section has a description", () => {
		for (const section of pipeline.sections) {
			expect(section.description).toBeTruthy();
			expect(typeof section.description).toBe("string");
		}
	});

	it("defines a non-empty files array", () => {
		expect(pipeline.files.length).toBeGreaterThan(0);
	});

	it("every file has a non-empty path", () => {
		for (const file of pipeline.files) {
			expect(file.path).toBeTruthy();
			expect(typeof file.path).toBe("string");
		}
	});

	it("every file has content (string or function)", () => {
		for (const file of pipeline.files) {
			expect(["string", "function"]).toContain(typeof file.content);
		}
	});

	it("has no duplicate file paths", () => {
		const paths = pipeline.files.map((f) => f.path);
		const unique = new Set(paths);
		expect(unique.size).toBe(paths.length);
	});
});

// ---------------------------------------------------------------------------
// site.yaml Generation
// ---------------------------------------------------------------------------

describe("pipeline site.yaml", () => {
	const ctx = makeCtx();
	const file = findFile("site.yaml");

	it("exists in the file list", () => {
		expect(file).toBeDefined();
	});

	it("includes the site title from context", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('title: "Test Pipeline"');
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
		expect(content).toContain('"Pipeline"');
		expect(content).toContain('"Sources"');
		expect(content).toContain('"Destinations"');
		expect(content).toContain('"Operations"');
		expect(content).toContain('"Troubleshooting"');
		expect(content).toContain('"Reference"');
	});

	it("includes section paths", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('"content/pipeline"');
		expect(content).toContain('"content/sources"');
		expect(content).toContain('"content/destinations"');
		expect(content).toContain('"content/operations"');
		expect(content).toContain('"content/troubleshooting"');
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
				siteName: "Widget Pipeline",
				brandName: "Widget Inc",
				brandUrl: "/",
			},
		});
		const content = resolveContent(file, customCtx);
		expect(content).toContain('title: "Widget Pipeline"');
		expect(content).toContain('name: "Widget Inc"');
		expect(content).toContain('url: "/"');
	});
});

// ---------------------------------------------------------------------------
// index.md Generation
// ---------------------------------------------------------------------------

describe("pipeline index.md", () => {
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
		expect(content).toContain("description: Test Pipeline - Data Pipeline Operations");
	});

	it("includes site name in the H1 heading", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("# Test Pipeline");
	});

	it("includes brand name in intro text", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("Data pipeline operations for Acme Corp.");
	});

	it("contains a pipeline status table", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Pipeline Status");
		expect(content).toContain("| Stage | Description | Status |");
		expect(content).toContain("Index");
		expect(content).toContain("Extract");
		expect(content).toContain("Transfer");
		expect(content).toContain("Validate");
	});

	it("contains quick links to key sections", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Quick Links");
		expect(content).toContain("[Pipeline Overview](/content/pipeline/overview)");
		expect(content).toContain("[Run a Pipeline](/content/operations/run-pipeline)");
		expect(content).toContain("[Source Systems](/content/sources/)");
		expect(content).toContain("[Troubleshooting](/content/troubleshooting/common-issues)");
	});

	it("includes a last-updated date in ISO format", () => {
		const content = resolveContent(file, ctx);
		expect(content).toMatch(/\*Last updated: \d{4}-\d{2}-\d{2}\*/);
	});
});

// ---------------------------------------------------------------------------
// Pipeline Section Files
// ---------------------------------------------------------------------------

describe("pipeline pipeline section", () => {
	const ctx = makeCtx();

	describe("overview.md", () => {
		const file = findFile("content/pipeline/overview.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter with title and description", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Pipeline Overview");
			expect(content).toContain("description: End-to-end dataflow for Acme Corp");
		});

		it("describes the dataflow", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Dataflow");
			expect(content).toContain("Source");
			expect(content).toContain("Index");
			expect(content).toContain("Extract");
			expect(content).toContain("Transfer");
			expect(content).toContain("Validate");
			expect(content).toContain("Destination");
		});

		it("documents all four stages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### 1. Index Build");
			expect(content).toContain("### 2. Content Extraction");
			expect(content).toContain("### 3. Transfer / Reflow");
			expect(content).toContain("### 4. Validation");
		});

		it("links to individual stage pages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Index Build](/content/pipeline/index-build)");
			expect(content).toContain("[Content Extraction](/content/pipeline/extract)");
			expect(content).toContain("[Transfer](/content/pipeline/transfer)");
			expect(content).toContain("[Validation](/content/pipeline/validate)");
		});
	});

	describe("index-build.md", () => {
		const file = findFile("content/pipeline/index-build.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Index Build");
		});

		it("includes objective, prerequisites, procedure, and verification", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Objective");
			expect(content).toContain("## Prerequisites");
			expect(content).toContain("## Procedure");
			expect(content).toContain("## Verification");
		});

		it("links to manifest templates", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Manifest Templates](/content/reference/manifests/)");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("extract.md", () => {
		const file = findFile("content/pipeline/extract.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Content Extraction");
		});

		it("includes a field extraction table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Field | Source | Extraction Method |");
		});

		it("includes objective and procedure", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Objective");
			expect(content).toContain("## Procedure");
			expect(content).toContain("## Verification");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("transfer.md", () => {
		const file = findFile("content/pipeline/transfer.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Transfer / Reflow");
		});

		it("documents dry run and execute phases", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Dry Run");
			expect(content).toContain("## Execute");
			expect(content).toContain("## Resume from Checkpoint");
		});

		it("includes objective and configuration", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Objective");
			expect(content).toContain("## Configuration");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("validate.md", () => {
		const file = findFile("content/pipeline/validate.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Validation");
		});

		it("includes validation checks as checkboxes", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Checks");
			expect(content).toContain("- [ ] Object count matches expected");
			expect(content).toContain("- [ ] No duplicate files in destination");
		});

		it("includes a common issues table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Common Issues");
			expect(content).toContain("| Issue | Cause | Resolution |");
			expect(content).toContain("Count mismatch");
			expect(content).toContain("Duplicates");
			expect(content).toContain("Wrong paths");
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
// Sources Section Files
// ---------------------------------------------------------------------------

describe("pipeline sources section", () => {
	const ctx = makeCtx();

	describe("index.md", () => {
		const file = findFile("content/sources/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Source Systems");
			expect(content).toContain("description: Source data systems for Acme Corp");
		});

		it("includes a source systems table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Source | Type | Auth | Documentation |");
		});

		it("documents how to add a new source", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Adding a New Source");
		});
	});
});

// ---------------------------------------------------------------------------
// Destinations Section Files
// ---------------------------------------------------------------------------

describe("pipeline destinations section", () => {
	const ctx = makeCtx();

	describe("index.md", () => {
		const file = findFile("content/destinations/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Destinations");
			expect(content).toContain("description: Target structures for Acme Corp");
		});

		it("includes a destinations table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Destination | Type | Structure | Documentation |");
		});

		it("documents path structure", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Path Structure");
			expect(content).toContain("destination-root/");
		});

		it("documents how to add a new destination", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Adding a New Destination");
		});
	});
});

// ---------------------------------------------------------------------------
// Operations Section Files
// ---------------------------------------------------------------------------

describe("pipeline operations section", () => {
	const ctx = makeCtx();

	describe("run-pipeline.md", () => {
		const file = findFile("content/operations/run-pipeline.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Run a Pipeline");
		});

		it("includes prerequisites as checkboxes", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Prerequisites");
			expect(content).toContain("- [ ] Source and destination credentials valid");
			expect(content).toContain("- [ ] Index up to date for target scope");
		});

		it("documents all four pipeline steps", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### Step 1: Index Build");
			expect(content).toContain("### Step 2: Content Probe");
			expect(content).toContain("### Step 3: Transfer Reflow");
			expect(content).toContain("### Step 4: Validate");
		});

		it("documents checkpoint and resume", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Checkpoint / Resume");
		});

		it("includes post-run checklist", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Post-Run");
			expect(content).toContain("- [ ] Review validation report");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("schedules.md", () => {
		const file = findFile("content/operations/schedules.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Schedules");
		});

		it("includes a schedules table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Pipeline | Frequency | Scope | Notes |");
		});

		it("links to run-pipeline page", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Run a Pipeline](/content/operations/run-pipeline)");
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
// Troubleshooting Section Files
// ---------------------------------------------------------------------------

describe("pipeline troubleshooting section", () => {
	const ctx = makeCtx();

	describe("common-issues.md", () => {
		const file = findFile("content/troubleshooting/common-issues.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Common Issues");
		});

		it("documents authentication expiry issue", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Authentication Expiry Mid-Pipeline");
			expect(content).toContain("**Symptoms**:");
			expect(content).toContain("**Possible Causes**:");
			expect(content).toContain("**Resolution**:");
			expect(content).toContain("**Prevention**:");
		});

		it("documents index lock / corruption issue", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Index Lock / Corruption");
		});

		it("documents duplicate detection conflicts", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Duplicate Detection Conflicts");
		});

		it("documents destination collision handling", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Destination Collision Handling");
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
// Reference Section Files
// ---------------------------------------------------------------------------

describe("pipeline reference section", () => {
	const ctx = makeCtx();

	describe("manifests/job-template.md", () => {
		const file = findFile("content/reference/manifests/job-template.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Job Manifest Template");
		});

		it("includes a YAML manifest example", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("```yaml");
			expect(content).toContain("job:");
			expect(content).toContain("name:");
			expect(content).toContain("pipeline:");
			expect(content).toContain("scope:");
		});

		it("includes a fields table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Fields");
			expect(content).toContain("| Field | Required | Description |");
			expect(content).toContain("`job.name`");
			expect(content).toContain("`job.pipeline`");
			expect(content).toContain("`job.options.dry_run`");
			expect(content).toContain("`job.options.collision`");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("field-mappings/mapping-template.md", () => {
		const file = findFile("content/reference/field-mappings/mapping-template.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Field Mapping Template");
		});

		it("includes a field mapping table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Source Field | Destination Field | Transform | Notes |");
		});

		it("documents transform rules", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Transform Rules");
			expect(content).toContain("### Date Formatting");
			expect(content).toContain("### Lookup Tables");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("metrics/pipeline-kpis.md", () => {
		const file = findFile("content/reference/metrics/pipeline-kpis.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Pipeline KPIs");
		});

		it("includes a key metrics table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Key Metrics");
			expect(content).toContain("| Metric | Target | Dashboard |");
			expect(content).toContain("Pipeline success rate");
			expect(content).toContain("Error rate");
		});

		it("includes SLAs and alerting", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## SLAs");
			expect(content).toContain("## Alerting");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("checklists/pre-run.md", () => {
		const file = findFile("content/reference/checklists/pre-run.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Pre-Run Checklist");
		});

		it("includes checklist categories", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Credentials");
			expect(content).toContain("## Scope");
			expect(content).toContain("## Configuration");
			expect(content).toContain("## Environment");
		});

		it("includes a Go/No-Go decision point", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Go/No-Go");
			expect(content).toContain("GO / ");
			expect(content).toContain("NO-GO");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("contacts/directory.md", () => {
		const file = findFile("content/reference/contacts/directory.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Contact Directory");
			expect(content).toContain("description: Team and vendor contacts for Acme Corp");
		});

		it("includes pipeline team table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Pipeline Team");
			expect(content).toContain("| Role | Contact | Responsibility |");
			expect(content).toContain("Pipeline Lead");
			expect(content).toContain("Data Engineer");
			expect(content).toContain("On-Call");
		});

		it("includes vendor contacts", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Vendor Contacts");
		});

		it("includes escalation info", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Escalation");
		});
	});
});

// ---------------------------------------------------------------------------
// CUSTOMIZING.md
// ---------------------------------------------------------------------------

describe("pipeline CUSTOMIZING.md", () => {
	const ctx = makeCtx();
	const file = findFile("CUSTOMIZING.md");

	it("exists in the file list", () => {
		expect(file).toBeDefined();
	});

	it("has frontmatter with template metadata", () => {
		const content = resolveContent(file, ctx);
		expect(content).toMatch(/^---\n/);
		expect(content).toContain("template: pipeline");
		expect(content).toContain("template_version: 1");
	});

	it("includes the site name in the heading", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("# Customizing Test Pipeline");
	});

	it("uses the project name in the directory tree", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("test-pipeline/");
	});

	it("documents site.yaml configuration", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### site.yaml");
		expect(content).toContain('title: "Test Pipeline"');
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

	it("documents the site structure with all sections", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Site Structure");
		expect(content).toContain("pipeline/");
		expect(content).toContain("sources/");
		expect(content).toContain("destinations/");
		expect(content).toContain("operations/");
		expect(content).toContain("troubleshooting/");
		expect(content).toContain("reference/");
	});

	it("documents adding content types", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### New Pipeline Stage");
		expect(content).toContain("### New Source System");
		expect(content).toContain("### New Destination");
		expect(content).toContain("### Creating Manifest Templates");
		expect(content).toContain("### New Troubleshooting Guide");
		expect(content).toContain("### New Section");
	});

	it("documents document conventions", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### Pipeline Stages");
		expect(content).toContain("### Troubleshooting");
		expect(content).toContain("### Checklists");
	});

	it("includes linking references", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### Internal Links");
		expect(content).toContain("### External Links");
	});

	it("includes getting help links", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Getting Help");
		expect(content).toContain("https://github.com/3leaps/kitfly");
	});

	it("responds to different context values", () => {
		const customCtx = makeCtx({
			name: "my-pipeline",
			branding: {
				siteName: "My Pipeline Ops",
				brandName: "My Brand",
				brandUrl: "/",
			},
			year: 2027,
		});
		const content = resolveContent(file, customCtx);
		expect(content).toContain("# Customizing My Pipeline Ops");
		expect(content).toContain("my-pipeline/");
		expect(content).toContain('name: "My Brand"');
		expect(content).toContain("2027 My Brand");
	});
});

// ---------------------------------------------------------------------------
// File Coverage Completeness
// ---------------------------------------------------------------------------

describe("pipeline file coverage", () => {
	const expectedFiles = [
		"site.yaml",
		"index.md",
		"content/pipeline/overview.md",
		"content/pipeline/index-build.md",
		"content/pipeline/extract.md",
		"content/pipeline/transfer.md",
		"content/pipeline/validate.md",
		"content/sources/index.md",
		"content/destinations/index.md",
		"content/operations/run-pipeline.md",
		"content/operations/schedules.md",
		"content/troubleshooting/common-issues.md",
		"content/reference/manifests/job-template.md",
		"content/reference/field-mappings/mapping-template.md",
		"content/reference/metrics/pipeline-kpis.md",
		"content/reference/checklists/pre-run.md",
		"content/reference/contacts/directory.md",
		"CUSTOMIZING.md",
	];

	it("defines exactly the expected set of files", () => {
		const actualPaths = pipeline.files.map((f) => f.path).sort();
		const expected = [...expectedFiles].sort();
		expect(actualPaths).toEqual(expected);
	});

	it("all content generators produce non-empty strings", () => {
		const ctx = makeCtx();
		for (const file of pipeline.files) {
			const content = resolveContent(file, ctx);
			expect(content.length).toBeGreaterThan(0);
			expect(typeof content).toBe("string");
		}
	});

	it("all markdown files start with YAML frontmatter or a markdown heading", () => {
		const ctx = makeCtx();
		for (const file of pipeline.files) {
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

describe("pipeline branding substitution", () => {
	it("context-dependent files use brandName, not a hardcoded value", () => {
		const ctx1 = makeCtx({
			branding: {
				siteName: "Alpha Pipeline",
				brandName: "Alpha Corp",
				brandUrl: "/",
			},
		});
		const ctx2 = makeCtx({
			branding: {
				siteName: "Beta Pipeline",
				brandName: "Beta Corp",
				brandUrl: "/",
			},
		});

		// Files that use ctx.branding.brandName in their content
		const brandDependentFiles = [
			"content/pipeline/overview.md",
			"content/sources/index.md",
			"content/destinations/index.md",
			"content/reference/contacts/directory.md",
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
				siteName: "Gamma Pipeline",
				brandName: "Gamma Inc",
				brandUrl: "/",
			},
		});

		// site.yaml and index.md use siteName
		const siteYaml = resolveContent(findFile("site.yaml"), ctx1);
		expect(siteYaml).toContain("Gamma Pipeline");

		const indexMd = resolveContent(findFile("index.md"), ctx1);
		expect(indexMd).toContain("Gamma Pipeline");

		const customizing = resolveContent(findFile("CUSTOMIZING.md"), ctx1);
		expect(customizing).toContain("Gamma Pipeline");
	});

	it("static templates are not affected by branding changes", () => {
		const ctx1 = makeCtx({
			branding: { siteName: "A", brandName: "A Corp", brandUrl: "/" },
		});
		const ctx2 = makeCtx({
			branding: { siteName: "B", brandName: "B Corp", brandUrl: "/" },
		});

		const staticFiles = [
			"content/pipeline/index-build.md",
			"content/pipeline/extract.md",
			"content/pipeline/transfer.md",
			"content/pipeline/validate.md",
			"content/operations/run-pipeline.md",
			"content/operations/schedules.md",
			"content/troubleshooting/common-issues.md",
			"content/reference/manifests/job-template.md",
			"content/reference/field-mappings/mapping-template.md",
			"content/reference/metrics/pipeline-kpis.md",
			"content/reference/checklists/pre-run.md",
		];

		for (const path of staticFiles) {
			const file = findFile(path);
			expect(resolveContent(file, ctx1)).toBe(resolveContent(file, ctx2));
		}
	});
});
