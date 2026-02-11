/**
 * Tests for the Servicebook template definition
 *
 * Covers: src/templates/servicebook.ts
 * Strategy: import the template directly, verify structure and generated content
 */

import { describe, expect, it } from "vitest";
import type { BrandingConfig, TemplateContext, TemplateFile } from "../templates/schema.ts";
import { servicebook } from "../templates/servicebook.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a standard TemplateContext for testing */
function makeCtx(overrides?: Partial<TemplateContext>): TemplateContext {
	const branding: BrandingConfig = {
		siteName: "Test Servicebook",
		brandName: "Acme Consulting",
		brandUrl: "https://acme.example.com",
		primaryColor: "#2563eb",
		footerText: "Footer text",
	};
	return {
		name: "test-servicebook",
		branding,
		template: servicebook,
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
	const f = servicebook.files.find((entry) => entry.path === path);
	if (!f) throw new Error(`Template file not found: ${path}`);
	return f;
}

// ---------------------------------------------------------------------------
// Template Definition Structure
// ---------------------------------------------------------------------------

describe("servicebook template definition", () => {
	it("has correct identity metadata", () => {
		expect(servicebook.id).toBe("servicebook");
		expect(servicebook.name).toBe("Servicebook");
		expect(servicebook.version).toBe(1);
		expect(servicebook.extends).toBe("minimal");
	});

	it("has a non-empty description", () => {
		expect(servicebook.description).toBeTruthy();
		expect(servicebook.description.length).toBeGreaterThan(10);
	});

	it("defines exactly six sections", () => {
		expect(servicebook.sections).toHaveLength(6);
	});

	it("defines the expected section names", () => {
		const names = servicebook.sections.map((s) => s.name);
		expect(names).toEqual([
			"Offerings",
			"Methodology",
			"Delivery",
			"Verticals",
			"Case Studies",
			"Reference",
		]);
	});

	it("defines the expected section paths", () => {
		const paths = servicebook.sections.map((s) => s.path);
		expect(paths).toEqual([
			"content/offerings",
			"content/methodology",
			"content/delivery",
			"content/verticals",
			"content/case-studies",
			"content/reference",
		]);
	});

	it("every section has a description", () => {
		for (const section of servicebook.sections) {
			expect(section.description).toBeTruthy();
			expect(typeof section.description).toBe("string");
		}
	});

	it("defines a non-empty files array", () => {
		expect(servicebook.files.length).toBeGreaterThan(0);
	});

	it("every file has a non-empty path", () => {
		for (const file of servicebook.files) {
			expect(file.path).toBeTruthy();
			expect(typeof file.path).toBe("string");
		}
	});

	it("every file has content (string or function)", () => {
		for (const file of servicebook.files) {
			expect(["string", "function"]).toContain(typeof file.content);
		}
	});

	it("has no duplicate file paths", () => {
		const paths = servicebook.files.map((f) => f.path);
		const unique = new Set(paths);
		expect(unique.size).toBe(paths.length);
	});
});

// ---------------------------------------------------------------------------
// site.yaml Generation
// ---------------------------------------------------------------------------

describe("servicebook site.yaml", () => {
	const ctx = makeCtx();
	const file = findFile("site.yaml");

	it("exists in the file list", () => {
		expect(file).toBeDefined();
	});

	it("includes the site title from context", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('title: "Test Servicebook"');
	});

	it("includes the brand name from context", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('name: "Acme Consulting"');
	});

	it("includes the brand url from context", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('url: "https://acme.example.com"');
	});

	it("includes sections block with all six sections", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("sections:");
		expect(content).toContain('"Offerings"');
		expect(content).toContain('"Methodology"');
		expect(content).toContain('"Delivery"');
		expect(content).toContain('"Verticals"');
		expect(content).toContain('"Case Studies"');
		expect(content).toContain('"Reference"');
	});

	it("includes section paths", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('"content/offerings"');
		expect(content).toContain('"content/methodology"');
		expect(content).toContain('"content/delivery"');
		expect(content).toContain('"content/verticals"');
		expect(content).toContain('"content/case-studies"');
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
				siteName: "Widget Services",
				brandName: "Widget Inc",
				brandUrl: "/",
			},
		});
		const content = resolveContent(file, customCtx);
		expect(content).toContain('title: "Widget Services"');
		expect(content).toContain('name: "Widget Inc"');
		expect(content).toContain('url: "/"');
	});
});

// ---------------------------------------------------------------------------
// index.md Generation
// ---------------------------------------------------------------------------

describe("servicebook index.md", () => {
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
		expect(content).toContain("description: Test Servicebook - Professional Services Catalog");
	});

	it("includes site name in the H1 heading", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("# Test Servicebook");
	});

	it("references brand name in body content", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("Acme Consulting");
	});

	it("contains a service offerings table", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Service Offerings");
		expect(content).toContain("| Service | Engagement Model | Typical Duration | Status |");
		expect(content).toContain("Assessment");
		expect(content).toContain("Advisory");
		expect(content).toContain("Implementation");
	});

	it("contains quick links to key sections", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Quick Links");
		expect(content).toContain("[Service Catalog](/content/offerings/overview)");
		expect(content).toContain("[Our Methodology](/content/methodology/phases)");
		expect(content).toContain("[Engagement Lifecycle](/content/delivery/engagement-lifecycle)");
		expect(content).toContain("[Case Studies](/content/case-studies/)");
	});

	it("includes a last-updated date in ISO format", () => {
		const content = resolveContent(file, ctx);
		expect(content).toMatch(/\*Last updated: \d{4}-\d{2}-\d{2}\*/);
	});
});

// ---------------------------------------------------------------------------
// Offerings Section Files
// ---------------------------------------------------------------------------

describe("servicebook offerings section", () => {
	const ctx = makeCtx();

	describe("overview.md", () => {
		const file = findFile("content/offerings/overview.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter with title and description", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Service Catalog");
			expect(content).toContain("description: Service offerings for Acme Consulting");
		});

		it("includes service tiers table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Service Tiers");
			expect(content).toContain("| Tier | Description | Typical Client | Duration |");
			expect(content).toContain("Assessment");
			expect(content).toContain("Advisory");
			expect(content).toContain("Implementation");
		});

		it("includes engagement models", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Engagement Models");
			expect(content).toContain("### Fixed-Scope");
			expect(content).toContain("### Time & Materials");
			expect(content).toContain("### Milestone-Based");
		});

		it("links to pricing models", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Pricing Models](/content/reference/pricing-models)");
		});

		it("links to related pages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Methodology](/content/methodology/phases)");
			expect(content).toContain("[Delivery Lifecycle](/content/delivery/engagement-lifecycle)");
		});
	});

	describe("assess/overview.md", () => {
		const file = findFile("content/offerings/assess/overview.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Assessment Service");
		});

		it("describes the service", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## What It Is");
			expect(content).toContain("## Client Problem");
		});

		it("includes deliverables table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Deliverables");
			expect(content).toContain("| Deliverable | Format | Description |");
			expect(content).toContain("Current-State Report");
			expect(content).toContain("Gap Analysis");
			expect(content).toContain("Recommendations");
			expect(content).toContain("Roadmap");
		});

		it("includes timeline table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Timeline");
			expect(content).toContain("| Phase | Duration | Activities |");
			expect(content).toContain("Discovery");
			expect(content).toContain("Analysis");
			expect(content).toContain("Synthesis");
			expect(content).toContain("Delivery");
		});

		it("links to related pages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Assessment Scoping](/content/offerings/assess/scoping)");
			expect(content).toContain("[Deliverables](/content/offerings/assess/deliverables)");
			expect(content).toContain("[Methodology Phases](/content/methodology/phases)");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("assess/deliverables.md", () => {
		const file = findFile("content/offerings/assess/deliverables.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Assessment Deliverables");
		});

		it("describes each deliverable", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Current-State Report");
			expect(content).toContain("## Gap Analysis");
			expect(content).toContain("## Recommendations");
			expect(content).toContain("## Roadmap");
		});

		it("links to deliverable templates", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Deliverable Templates](/content/delivery/templates/)");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("assess/scoping.md", () => {
		const file = findFile("content/offerings/assess/scoping.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Assessment Scoping");
		});

		it("includes scoping criteria table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Scoping Criteria");
			expect(content).toContain("| Factor | Questions | Impact on Scope |");
		});

		it("documents the scoping process", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Scoping Process");
			expect(content).toContain("### 1. Discovery Call");
			expect(content).toContain("### 2. Scope Document");
			expect(content).toContain("### 3. Client Approval");
		});

		it("includes scope variables table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Scope Variables");
			expect(content).toContain("| Variable | Small | Medium | Large |");
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
// Methodology Section Files
// ---------------------------------------------------------------------------

describe("servicebook methodology section", () => {
	const ctx = makeCtx();

	describe("phases.md", () => {
		const file = findFile("content/methodology/phases.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Methodology Phases");
			expect(content).toContain("description: Delivery methodology for Acme Consulting");
		});

		it("includes all four phases", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### 1. Explore");
			expect(content).toContain("### 2. Analyze");
			expect(content).toContain("### 3. Synthesize");
			expect(content).toContain("### 4. Deliver");
		});

		it("each phase has input/activities/output tables", () => {
			const content = resolveContent(file, ctx);
			// Count occurrences of the table header
			const tableHeaders = content.match(/\| Input \| Activities \| Output \|/g);
			expect(tableHeaders).toHaveLength(4);
		});

		it("includes phase adaptation table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Phase Adaptation");
			expect(content).toContain("| Engagement Type | Explore | Analyze | Synthesize | Deliver |");
		});

		it("links to related pages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Tools](/content/methodology/tools)");
			expect(content).toContain("[Frameworks](/content/methodology/frameworks)");
			expect(content).toContain("[Decisions](/content/methodology/decisions/)");
		});
	});

	describe("tools.md", () => {
		const file = findFile("content/methodology/tools.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Tools");
		});

		it("includes tool categories", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Discovery Tools");
			expect(content).toContain("## Analysis Tools");
			expect(content).toContain("## Documentation Tools");
			expect(content).toContain("## Collaboration Tools");
		});

		it("includes tool selection criteria", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Tool Selection Criteria");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("frameworks.md", () => {
		const file = findFile("content/methodology/frameworks.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Frameworks");
		});

		it("includes maturity model table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Maturity Model");
			expect(content).toContain("| Level | Label | Description |");
			expect(content).toContain("Initial");
			expect(content).toContain("Optimized");
		});

		it("includes scoring template table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Scoring Template");
			expect(content).toContain("| Dimension | Current Level | Target Level | Gap | Priority |");
		});

		it("includes framework selection table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Framework Selection");
			expect(content).toContain("Maturity Model");
			expect(content).toContain("SWOT");
			expect(content).toContain("Risk Matrix");
			expect(content).toContain("Weighted Scoring");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("decisions/index.md", () => {
		const file = findFile("content/methodology/decisions/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Methodology Decisions");
		});

		it("includes a decision log table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| ID | Decision | Date | Status |");
			expect(content).toContain("MDR-001");
		});

		it("links to the MDR template", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[MDR Template](./mdr-template)");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("decisions/mdr-template.md", () => {
		const file = findFile("content/methodology/decisions/mdr-template.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter with MDR-000 title", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain('title: "MDR-000: Decision Template"');
		});

		it("includes all MDR sections", () => {
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

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});
});

// ---------------------------------------------------------------------------
// Delivery Section Files
// ---------------------------------------------------------------------------

describe("servicebook delivery section", () => {
	const ctx = makeCtx();

	describe("engagement-lifecycle.md", () => {
		const file = findFile("content/delivery/engagement-lifecycle.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Engagement Lifecycle");
			expect(content).toContain("description: End-to-end engagement flow for Acme Consulting");
		});

		it("includes all six lifecycle stages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### 1. Qualify");
			expect(content).toContain("### 2. Scope");
			expect(content).toContain("### 3. Kickoff");
			expect(content).toContain("### 4. Deliver");
			expect(content).toContain("### 5. Review");
			expect(content).toContain("### 6. Close");
		});

		it("includes quality gates at each stage", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("**Gate**:");
		});

		it("links to related pages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Client Onboarding](/content/delivery/client-onboarding)");
			expect(content).toContain("[Quality Gates](/content/delivery/quality-gates)");
		});
	});

	describe("client-onboarding.md", () => {
		const file = findFile("content/delivery/client-onboarding.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Client Onboarding");
		});

		it("includes pre-engagement checklist", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Pre-Engagement Checklist");
			expect(content).toContain("- [ ]");
		});

		it("includes kickoff meeting agenda", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Kickoff Meeting Agenda");
		});

		it("includes working agreements table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Working Agreements");
			expect(content).toContain("| Topic | Agreement |");
		});

		it("includes onboarding for the delivery team", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Onboarding for the Delivery Team");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("quality-gates.md", () => {
		const file = findFile("content/delivery/quality-gates.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Quality Gates");
		});

		it("defines all five gates", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### G1: Scope Approval");
			expect(content).toContain("### G2: Discovery Complete");
			expect(content).toContain("### G3: Analysis Reviewed");
			expect(content).toContain("### G4: Deliverable Review");
			expect(content).toContain("### G5: Client Acceptance");
		});

		it("includes gate process steps", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Gate Process");
			expect(content).toContain("**Pass**");
			expect(content).toContain("**Conditional pass**");
			expect(content).toContain("**Hold**");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("templates/index.md", () => {
		const file = findFile("content/delivery/templates/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Deliverable Templates");
		});

		it("includes available templates table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Available Templates");
			expect(content).toContain("| Template | Used For | Format |");
			expect(content).toContain("Assessment Report");
			expect(content).toContain("Gap Analysis Matrix");
		});

		it("includes template conventions", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Template Conventions");
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
// Verticals Section Files
// ---------------------------------------------------------------------------

describe("servicebook verticals section", () => {
	const ctx = makeCtx();

	describe("overview.md", () => {
		const file = findFile("content/verticals/overview.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Verticals Overview");
		});

		it("describes what to capture per vertical", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### Regulatory Environment");
			expect(content).toContain("### Industry Terminology");
			expect(content).toContain("### Common Challenges");
			expect(content).toContain("### Competitive Landscape");
		});

		it("documents adding a vertical", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Adding a Vertical");
			expect(content).toContain("content/verticals/");
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
// Case Studies Section Files
// ---------------------------------------------------------------------------

describe("servicebook case-studies section", () => {
	const ctx = makeCtx();

	describe("index.md", () => {
		const file = findFile("content/case-studies/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Case Studies");
		});

		it("includes a case studies table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Case Study | Vertical | Service | Outcome |");
		});

		it("documents the case study template structure", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### Context");
			expect(content).toContain("### Approach");
			expect(content).toContain("### Deliverables");
			expect(content).toContain("### Outcomes");
			expect(content).toContain("### Lessons Learned");
		});

		it("includes anonymization guidelines", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Anonymization Guidelines");
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

describe("servicebook reference section", () => {
	const ctx = makeCtx();

	describe("team-expertise.md", () => {
		const file = findFile("content/reference/team-expertise.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Team Expertise");
		});

		it("includes capability matrix table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Capability Matrix");
			expect(content).toContain("| Capability | Team Members | Depth | Verticals |");
		});

		it("includes certifications table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Certifications & Credentials");
			expect(content).toContain("| Person | Certification | Issuer | Expiry |");
		});

		it("includes capacity planning table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Capacity Planning");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("pricing-models.md", () => {
		const file = findFile("content/reference/pricing-models.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Pricing Models");
		});

		it("includes all three pricing types", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### Fixed-Price");
			expect(content).toContain("### Time & Materials");
			expect(content).toContain("### Milestone-Based");
		});

		it("includes rate structure table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Rate Structure");
			expect(content).toContain("| Role | Rate Range | Notes |");
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
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Contact Directory");
			expect(content).toContain("description: Team contacts and escalation for Acme Consulting");
		});

		it("includes delivery team table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Delivery Team");
			expect(content).toContain("| Role | Contact | Responsibility |");
			expect(content).toContain("Practice Lead");
			expect(content).toContain("Engagement Lead");
		});

		it("includes escalation path", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Escalation Path");
			expect(content).toContain("**Engagement Lead**");
			expect(content).toContain("**Practice Lead**");
			expect(content).toContain("**Managing Partner**");
		});

		it("includes client communication table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Client Communication");
			expect(content).toContain("| Channel | Purpose | Response Time |");
		});
	});
});

// ---------------------------------------------------------------------------
// CUSTOMIZING.md
// ---------------------------------------------------------------------------

describe("servicebook CUSTOMIZING.md", () => {
	const ctx = makeCtx();
	const file = findFile("CUSTOMIZING.md");

	it("exists in the file list", () => {
		expect(file).toBeDefined();
	});

	it("has frontmatter with template metadata", () => {
		const content = resolveContent(file, ctx);
		expect(content).toMatch(/^---\n/);
		expect(content).toContain("template: servicebook");
		expect(content).toContain("template_version: 1");
	});

	it("includes the site name in the heading", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("# Customizing Test Servicebook");
	});

	it("uses the project name in the directory tree", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("test-servicebook/");
	});

	it("documents site.yaml configuration", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### site.yaml");
		expect(content).toContain('title: "Test Servicebook"');
		expect(content).toContain('name: "Acme Consulting"');
	});

	it("documents theme.yaml customization", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### theme.yaml");
	});

	it("includes the current year in footer example", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("2026 Acme Consulting");
	});

	it("covers adding content types", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### New Service Offering");
		expect(content).toContain("### Documenting a Methodology Change");
		expect(content).toContain("### Adding a Case Study");
		expect(content).toContain("### Adding a Vertical");
		expect(content).toContain("### New Section");
	});

	it("includes document conventions", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### Offerings");
		expect(content).toContain("### Methodology");
		expect(content).toContain("### Delivery");
		expect(content).toContain("### Case Studies");
	});

	it("includes site structure diagram", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Site Structure");
		expect(content).toContain("content/");
		expect(content).toContain("offerings/");
		expect(content).toContain("methodology/");
		expect(content).toContain("delivery/");
		expect(content).toContain("verticals/");
		expect(content).toContain("case-studies/");
		expect(content).toContain("reference/");
	});

	it("responds to different context values", () => {
		const customCtx = makeCtx({
			name: "my-services",
			branding: {
				siteName: "My Services",
				brandName: "My Brand",
				brandUrl: "/",
			},
			year: 2027,
		});
		const content = resolveContent(file, customCtx);
		expect(content).toContain("# Customizing My Services");
		expect(content).toContain("my-services/");
		expect(content).toContain('name: "My Brand"');
		expect(content).toContain("2027 My Brand");
	});
});

// ---------------------------------------------------------------------------
// File Coverage Completeness
// ---------------------------------------------------------------------------

describe("servicebook file coverage", () => {
	const expectedFiles = [
		"site.yaml",
		"index.md",
		"content/offerings/overview.md",
		"content/offerings/assess/overview.md",
		"content/offerings/assess/deliverables.md",
		"content/offerings/assess/scoping.md",
		"content/methodology/phases.md",
		"content/methodology/tools.md",
		"content/methodology/frameworks.md",
		"content/methodology/decisions/index.md",
		"content/methodology/decisions/mdr-template.md",
		"content/delivery/engagement-lifecycle.md",
		"content/delivery/client-onboarding.md",
		"content/delivery/quality-gates.md",
		"content/delivery/templates/index.md",
		"content/verticals/overview.md",
		"content/case-studies/index.md",
		"content/reference/team-expertise.md",
		"content/reference/pricing-models.md",
		"content/reference/contacts/directory.md",
		"CUSTOMIZING.md",
	];

	it("defines exactly the expected set of files", () => {
		const actualPaths = servicebook.files.map((f) => f.path).sort();
		const expected = [...expectedFiles].sort();
		expect(actualPaths).toEqual(expected);
	});

	it("all content generators produce non-empty strings", () => {
		const ctx = makeCtx();
		for (const file of servicebook.files) {
			const content = resolveContent(file, ctx);
			expect(content.length).toBeGreaterThan(0);
			expect(typeof content).toBe("string");
		}
	});

	it("all markdown files start with YAML frontmatter or a markdown heading", () => {
		const ctx = makeCtx();
		for (const file of servicebook.files) {
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

describe("servicebook branding substitution", () => {
	it("context-dependent files use brandName, not a hardcoded value", () => {
		const ctx1 = makeCtx({
			branding: {
				siteName: "Alpha Services",
				brandName: "Alpha Corp",
				brandUrl: "/",
			},
		});
		const ctx2 = makeCtx({
			branding: {
				siteName: "Beta Services",
				brandName: "Beta Corp",
				brandUrl: "/",
			},
		});

		// Files that use ctx.branding.brandName in their description
		const brandDependentFiles = [
			"content/offerings/overview.md",
			"content/methodology/phases.md",
			"content/delivery/engagement-lifecycle.md",
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
	});

	it("static templates are not affected by context changes", () => {
		const ctx1 = makeCtx({
			branding: { siteName: "One", brandName: "One" },
		});
		const ctx2 = makeCtx({
			branding: { siteName: "Two", brandName: "Two" },
		});

		const staticFiles = [
			"content/offerings/assess/overview.md",
			"content/offerings/assess/deliverables.md",
			"content/offerings/assess/scoping.md",
			"content/methodology/tools.md",
			"content/methodology/frameworks.md",
			"content/methodology/decisions/index.md",
			"content/methodology/decisions/mdr-template.md",
			"content/delivery/client-onboarding.md",
			"content/delivery/quality-gates.md",
			"content/delivery/templates/index.md",
			"content/verticals/overview.md",
			"content/case-studies/index.md",
			"content/reference/team-expertise.md",
			"content/reference/pricing-models.md",
		];

		for (const path of staticFiles) {
			const file = findFile(path);
			expect(resolveContent(file, ctx1)).toBe(resolveContent(file, ctx2));
		}
	});
});
