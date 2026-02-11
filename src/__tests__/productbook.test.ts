/**
 * Tests for the Productbook template definition
 *
 * Covers: src/templates/productbook.ts
 * Strategy: import the template directly, verify structure and generated content
 */

import { describe, expect, it } from "vitest";
import { productbook } from "../templates/productbook.ts";
import type { BrandingConfig, TemplateContext, TemplateFile } from "../templates/schema.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a standard TemplateContext for testing */
function makeCtx(overrides?: Partial<TemplateContext>): TemplateContext {
	const branding: BrandingConfig = {
		siteName: "Test Productbook",
		brandName: "Acme Corp",
		brandUrl: "https://acme.example.com",
		primaryColor: "#2563eb",
		footerText: "Footer text",
	};
	return {
		name: "test-productbook",
		branding,
		template: productbook,
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
	const f = productbook.files.find((entry) => entry.path === path);
	if (!f) throw new Error(`Template file not found: ${path}`);
	return f;
}

// ---------------------------------------------------------------------------
// Template Definition Structure
// ---------------------------------------------------------------------------

describe("productbook template definition", () => {
	it("has correct identity metadata", () => {
		expect(productbook.id).toBe("productbook");
		expect(productbook.name).toBe("Productbook");
		expect(productbook.version).toBe(1);
		expect(productbook.extends).toBe("minimal");
	});

	it("has a non-empty description", () => {
		expect(productbook.description).toBeTruthy();
		expect(productbook.description.length).toBeGreaterThan(10);
	});

	it("defines exactly six sections", () => {
		expect(productbook.sections).toHaveLength(6);
	});

	it("defines the expected section names", () => {
		const names = productbook.sections.map((s) => s.name);
		expect(names).toEqual(["Product", "Domain", "Planning", "Operations", "Guides", "Reference"]);
	});

	it("defines the expected section paths", () => {
		const paths = productbook.sections.map((s) => s.path);
		expect(paths).toEqual([
			"content/product",
			"content/domain",
			"content/planning",
			"content/operations",
			"content/guides",
			"content/reference",
		]);
	});

	it("every section has a description", () => {
		for (const section of productbook.sections) {
			expect(section.description).toBeTruthy();
			expect(typeof section.description).toBe("string");
		}
	});

	it("defines a non-empty files array", () => {
		expect(productbook.files.length).toBeGreaterThan(0);
	});

	it("every file has a non-empty path", () => {
		for (const file of productbook.files) {
			expect(file.path).toBeTruthy();
			expect(typeof file.path).toBe("string");
		}
	});

	it("every file has content (string or function)", () => {
		for (const file of productbook.files) {
			expect(["string", "function"]).toContain(typeof file.content);
		}
	});

	it("has no duplicate file paths", () => {
		const paths = productbook.files.map((f) => f.path);
		const unique = new Set(paths);
		expect(unique.size).toBe(paths.length);
	});
});

// ---------------------------------------------------------------------------
// site.yaml Generation
// ---------------------------------------------------------------------------

describe("productbook site.yaml", () => {
	const ctx = makeCtx();
	const file = findFile("site.yaml");

	it("exists in the file list", () => {
		expect(file).toBeDefined();
	});

	it("includes the site title from context", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('title: "Test Productbook"');
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
		expect(content).toContain('"Product"');
		expect(content).toContain('"Domain"');
		expect(content).toContain('"Planning"');
		expect(content).toContain('"Operations"');
		expect(content).toContain('"Guides"');
		expect(content).toContain('"Reference"');
	});

	it("includes section paths", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('"content/product"');
		expect(content).toContain('"content/domain"');
		expect(content).toContain('"content/planning"');
		expect(content).toContain('"content/operations"');
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
				siteName: "Widget Docs",
				brandName: "Widget Inc",
				brandUrl: "/",
			},
		});
		const content = resolveContent(file, customCtx);
		expect(content).toContain('title: "Widget Docs"');
		expect(content).toContain('name: "Widget Inc"');
		expect(content).toContain('url: "/"');
	});
});

// ---------------------------------------------------------------------------
// index.md Generation
// ---------------------------------------------------------------------------

describe("productbook index.md", () => {
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
		expect(content).toContain("description: Test Productbook - Product & Domain Documentation");
	});

	it("includes site name in the H1 heading", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("# Test Productbook");
	});

	it("includes brand name in product description", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("Product and domain documentation for Acme Corp.");
	});

	it("contains a product status table", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Product");
		expect(content).toContain("| Area | Description | Status |");
		expect(content).toContain("Core Platform");
		expect(content).toContain("Integrations");
		expect(content).toContain("User Experience");
	});

	it("contains quick links to key sections", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Quick Links");
		expect(content).toContain("[Product Overview](/content/product/overview)");
		expect(content).toContain("[Domain Model](/content/domain/overview)");
		expect(content).toContain("[Roadmap](/content/planning/roadmap)");
		expect(content).toContain("[Getting Started](/content/guides/getting-started)");
	});

	it("includes a last-updated date in ISO format", () => {
		const content = resolveContent(file, ctx);
		expect(content).toMatch(/\*Last updated: \d{4}-\d{2}-\d{2}\*/);
	});
});

// ---------------------------------------------------------------------------
// Product Section Files
// ---------------------------------------------------------------------------

describe("productbook product section", () => {
	const ctx = makeCtx();

	describe("overview.md", () => {
		const file = findFile("content/product/overview.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter with title and description", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Product Overview");
			expect(content).toContain("description: Vision, users, and capabilities for Acme Corp");
		});

		it("includes vision and target users sections", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Vision");
			expect(content).toContain("## Target Users");
		});

		it("includes key capabilities section", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Key Capabilities");
		});

		it("includes success metrics table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Success Metrics");
			expect(content).toContain("| Metric | Target | How Measured |");
		});

		it("links to related pages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Domain Overview](/content/domain/overview)");
			expect(content).toContain("[Roadmap](/content/planning/roadmap)");
		});
	});

	describe("features/index.md", () => {
		const file = findFile("content/product/features/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Features");
			expect(content).toContain("description: Feature catalog for Acme Corp");
		});

		it("includes a feature catalog table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Feature | Status | Description | Spec |");
		});

		it("documents how to add a feature", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Adding a Feature");
			expect(content).toContain("content/product/features/");
		});

		it("links to planning specs", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Planning](/content/planning/specs/)");
		});
	});

	describe("releases/index.md", () => {
		const file = findFile("content/product/releases/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Releases");
			expect(content).toContain("description: Release history for Acme Corp");
		});

		it("includes a release table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Version | Date | Highlights |");
		});

		it("documents the release process", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Release Process");
			expect(content).toContain("[Operations](/content/operations/deployment)");
		});
	});
});

// ---------------------------------------------------------------------------
// Domain Section Files
// ---------------------------------------------------------------------------

describe("productbook domain section", () => {
	const ctx = makeCtx();

	describe("overview.md", () => {
		const file = findFile("content/domain/overview.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter with title and description", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Domain Overview");
			expect(content).toContain("description: Business domain context for Acme Corp");
		});

		it("includes key concepts table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Key Concepts");
			expect(content).toContain("| Concept | Definition | Why It Matters |");
		});

		it("covers domain boundaries and complexity drivers", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Domain Boundaries");
			expect(content).toContain("## Complexity Drivers");
		});

		it("links to related domain pages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Business Processes](/content/domain/processes/)");
			expect(content).toContain("[Data Dictionary](/content/domain/data-dictionary)");
			expect(content).toContain("[Industry Notes](/content/domain/industry-notes)");
		});
	});

	describe("processes/index.md", () => {
		const file = findFile("content/domain/processes/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Business Processes");
			expect(content).toContain("description: Business process catalog for Acme Corp");
		});

		it("includes a process catalog table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Process | Trigger | Key Systems | Documentation |");
		});

		it("documents what each process should capture", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Documenting a Process");
			expect(content).toContain("**Trigger**");
			expect(content).toContain("**Actors**");
			expect(content).toContain("**Steps**");
			expect(content).toContain("**Variations**");
			expect(content).toContain("**Systems**");
			expect(content).toContain("**Data**");
			expect(content).toContain("**Business Rules**");
		});

		it("includes a process template example", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Process Template");
			expect(content).toContain("```markdown");
		});
	});

	describe("data-dictionary.md", () => {
		const file = findFile("content/domain/data-dictionary.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Data Dictionary");
			expect(content).toContain("description: Canonical term definitions for Acme Corp");
		});

		it("includes core terms and data entities sections", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Core Terms");
			expect(content).toContain("| Term | Definition | Also Known As | Used In |");
			expect(content).toContain("## Data Entities");
		});

		it("includes relationships and naming conventions", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Relationships");
			expect(content).toContain("## Naming Conventions");
		});
	});

	describe("industry-notes.md", () => {
		const file = findFile("content/domain/industry-notes.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Industry Notes");
			expect(content).toContain("description: Industry context for Acme Corp");
		});

		it("covers regulatory environment and industry standards", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Regulatory Environment");
			expect(content).toContain("| Regulation | Scope | Impact on Product |");
			expect(content).toContain("## Industry Standards");
		});

		it("covers competitive landscape and market dynamics", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Competitive Landscape");
			expect(content).toContain("## Market Dynamics");
		});
	});
});

// ---------------------------------------------------------------------------
// Planning Section Files
// ---------------------------------------------------------------------------

describe("productbook planning section", () => {
	const ctx = makeCtx();

	describe("roadmap.md", () => {
		const file = findFile("content/planning/roadmap.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Roadmap");
			expect(content).toContain("description: Product roadmap for Acme Corp");
		});

		it("includes current phase and priorities", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Current Phase");
			expect(content).toContain("## Priorities");
			expect(content).toContain("| Priority | Initiative | Rationale | Status |");
		});

		it("includes what we are not doing section", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## What We're NOT Doing (and Why)");
			expect(content).toContain("| Deferred Item | Reason | Revisit When |");
		});

		it("includes phase history", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Phase History");
			expect(content).toContain("| Phase | Dates | Outcome |");
		});

		it("links to related planning pages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Specs](/content/planning/specs/)");
			expect(content).toContain("[Decisions](/content/planning/decisions/)");
			expect(content).toContain("[Research](/content/planning/research/)");
		});
	});

	describe("decisions/index.md", () => {
		const file = findFile("content/planning/decisions/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Decisions");
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

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("decisions/adr-template.md", () => {
		const file = findFile("content/planning/decisions/adr-template.md");

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

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("specs/index.md", () => {
		const file = findFile("content/planning/specs/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Specifications");
			expect(content).toContain("description: Product specifications for Acme Corp");
		});

		it("includes a specifications table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Spec | Feature | Status | Owner |");
		});

		it("documents how to write a spec", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Writing a Spec");
			expect(content).toContain("**Problem Statement**");
			expect(content).toContain("**Proposed Solution**");
			expect(content).toContain("**Acceptance Criteria**");
			expect(content).toContain("**Out of Scope**");
			expect(content).toContain("**Dependencies**");
		});
	});

	describe("research/index.md", () => {
		const file = findFile("content/planning/research/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Research");
			expect(content).toContain("description: Research and analysis for Acme Corp");
		});

		it("includes a research table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Topic | Type | Date | Key Finding |");
		});

		it("defines research types", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Research Types");
			expect(content).toContain("**Market research**");
			expect(content).toContain("**User research**");
			expect(content).toContain("**Technology assessment**");
			expect(content).toContain("**Competitive analysis**");
		});
	});
});

// ---------------------------------------------------------------------------
// Operations Section Files
// ---------------------------------------------------------------------------

describe("productbook operations section", () => {
	const ctx = makeCtx();

	describe("environments.md", () => {
		const file = findFile("content/operations/environments.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Environments");
			expect(content).toContain("description: Environment catalog for Acme Corp");
		});

		it("includes an environments table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Environment | URL | Purpose | Access |");
			expect(content).toContain("Development");
			expect(content).toContain("Staging");
			expect(content).toContain("Production");
		});

		it("covers configuration and access", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Configuration");
			expect(content).toContain("## Access");
		});
	});

	describe("deployment.md", () => {
		const file = findFile("content/operations/deployment.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Deployment");
			expect(content).toContain("description: Deployment procedure for Acme Corp");
		});

		it("includes deployment prerequisites as checkboxes", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Prerequisites");
			expect(content).toContain("- [ ] Code reviewed and approved");
			expect(content).toContain("- [ ] Tests passing");
		});

		it("documents the deployment procedure steps", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### 1. Pre-deployment");
			expect(content).toContain("### 2. Deploy");
			expect(content).toContain("### 3. Verify");
		});

		it("includes rollback section", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Rollback");
		});
	});
});

// ---------------------------------------------------------------------------
// Guides Section Files
// ---------------------------------------------------------------------------

describe("productbook guides section", () => {
	const ctx = makeCtx();

	describe("getting-started.md", () => {
		const file = findFile("content/guides/getting-started.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Getting Started");
			expect(content).toContain("description: Onboarding guide for Acme Corp");
		});

		it("documents onboarding for new team members", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## For New Team Members");
			expect(content).toContain("### 1. Read the Domain");
			expect(content).toContain("### 2. Understand the Product");
			expect(content).toContain("### 3. Review Current Plan");
			expect(content).toContain("### 4. Set Up");
		});

		it("links to key documentation sections", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Domain Overview](/content/domain/overview)");
			expect(content).toContain("[Product Overview](/content/product/overview)");
			expect(content).toContain("[Roadmap](/content/planning/roadmap)");
			expect(content).toContain("[Operations](/content/operations/environments)");
		});

		it("includes AI agent instructions", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## For AI Agents");
			expect(content).toContain("AGENTS.md");
			expect(content).toContain("CUSTOMIZING.md");
		});
	});

	describe("user-guide.md", () => {
		const file = findFile("content/guides/user-guide.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: User Guide");
			expect(content).toContain("description: End-user documentation for Acme Corp");
		});

		it("includes overview and getting started sections", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Overview");
			expect(content).toContain("## Getting Started");
		});

		it("includes common tasks and FAQ sections", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Common Tasks");
			expect(content).toContain("## FAQ");
		});

		it("includes support section", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Support");
		});
	});
});

// ---------------------------------------------------------------------------
// Reference Section Files
// ---------------------------------------------------------------------------

describe("productbook reference section", () => {
	const ctx = makeCtx();

	describe("architecture/overview.md", () => {
		const file = findFile("content/reference/architecture/overview.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Architecture Overview");
			expect(content).toContain("description: System architecture for Acme Corp");
		});

		it("includes components table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Components");
			expect(content).toContain("| Component | Purpose | Technology | Owner |");
		});

		it("includes data flow and key design decisions sections", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Data Flow");
			expect(content).toContain("## Key Design Decisions");
			expect(content).toContain("[Decision Log](/content/planning/decisions/)");
		});
	});

	describe("integrations/index.md", () => {
		const file = findFile("content/reference/integrations/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Integrations");
			expect(content).toContain("description: External system integrations for Acme Corp");
		});

		it("includes an integrations table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| System | Type | Purpose | Documentation |");
		});

		it("documents how to add an integration", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Adding an Integration");
			expect(content).toContain("content/reference/integrations/");
			expect(content).toContain("[Data Dictionary](/content/domain/data-dictionary)");
		});
	});

	describe("data-models/index.md", () => {
		const file = findFile("content/reference/data-models/index.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Data Models");
			expect(content).toContain("description: Database and API schemas for Acme Corp");
		});

		it("includes database and API schema sections", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Database Schema");
			expect(content).toContain("## API Schema");
		});

		it("links to related pages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Data Dictionary](/content/domain/data-dictionary)");
			expect(content).toContain("[Integrations](/content/reference/integrations/)");
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

		it("includes project team, vendor, and stakeholder tables", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Project Team");
			expect(content).toContain("| Role | Contact | Responsibility |");
			expect(content).toContain("## Vendor Contacts");
			expect(content).toContain("| Vendor | Type | Contact |");
			expect(content).toContain("## Stakeholders");
			expect(content).toContain("| Stakeholder | Interest | Communication |");
		});
	});

	describe("metrics/kpis.md", () => {
		const file = findFile("content/reference/metrics/kpis.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: KPIs & Metrics");
			expect(content).toContain("description: Key performance indicators for Acme Corp");
		});

		it("includes product and business metrics tables", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Product Metrics");
			expect(content).toContain("## Business Metrics");
		});

		it("includes monitoring section with alerts table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Monitoring");
			expect(content).toContain("| Alert | Warning | Critical | Action |");
		});
	});
});

// ---------------------------------------------------------------------------
// CUSTOMIZING.md
// ---------------------------------------------------------------------------

describe("productbook CUSTOMIZING.md", () => {
	const ctx = makeCtx();
	const file = findFile("CUSTOMIZING.md");

	it("exists in the file list", () => {
		expect(file).toBeDefined();
	});

	it("has frontmatter with template metadata", () => {
		const content = resolveContent(file, ctx);
		expect(content).toMatch(/^---\n/);
		expect(content).toContain("template: productbook");
		expect(content).toContain("template_version: 1");
	});

	it("includes the site name in the heading", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("# Customizing Test Productbook");
	});

	it("uses the project name in the directory tree", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("test-productbook/");
	});

	it("documents site.yaml configuration", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### site.yaml");
		expect(content).toContain('title: "Test Productbook"');
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

	it("documents the productbook site structure", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Site Structure");
		expect(content).toContain("content/");
		expect(content).toContain("product/");
		expect(content).toContain("domain/");
		expect(content).toContain("planning/");
		expect(content).toContain("operations/");
		expect(content).toContain("guides/");
		expect(content).toContain("reference/");
	});

	it("covers adding content types", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### New Feature");
		expect(content).toContain("### Documenting a Business Process");
		expect(content).toContain("### Recording a Decision");
		expect(content).toContain("### Adding an Integration");
		expect(content).toContain("### New Section");
	});

	it("covers document conventions for each area", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### Product (features, releases)");
		expect(content).toContain("### Domain (processes, data dictionary)");
		expect(content).toContain("### Planning (decisions, specs, research)");
		expect(content).toContain("### Guides (onboarding, user docs)");
	});

	it("includes linking and references section", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Linking and References");
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
			name: "my-project",
			branding: {
				siteName: "My Docs",
				brandName: "My Brand",
				brandUrl: "/",
			},
			year: 2027,
		});
		const content = resolveContent(file, customCtx);
		expect(content).toContain("# Customizing My Docs");
		expect(content).toContain("my-project/");
		expect(content).toContain('name: "My Brand"');
		expect(content).toContain("2027 My Brand");
	});
});

// ---------------------------------------------------------------------------
// File Coverage Completeness
// ---------------------------------------------------------------------------

describe("productbook file coverage", () => {
	const expectedFiles = [
		"site.yaml",
		"index.md",
		"content/product/overview.md",
		"content/product/features/index.md",
		"content/product/releases/index.md",
		"content/domain/overview.md",
		"content/domain/processes/index.md",
		"content/domain/data-dictionary.md",
		"content/domain/industry-notes.md",
		"content/planning/roadmap.md",
		"content/planning/decisions/index.md",
		"content/planning/decisions/adr-template.md",
		"content/planning/specs/index.md",
		"content/planning/research/index.md",
		"content/operations/environments.md",
		"content/operations/deployment.md",
		"content/guides/getting-started.md",
		"content/guides/user-guide.md",
		"content/reference/architecture/overview.md",
		"content/reference/integrations/index.md",
		"content/reference/data-models/index.md",
		"content/reference/contacts/directory.md",
		"content/reference/metrics/kpis.md",
		"CUSTOMIZING.md",
	];

	it("defines exactly the expected set of files", () => {
		const actualPaths = productbook.files.map((f) => f.path).sort();
		const expected = [...expectedFiles].sort();
		expect(actualPaths).toEqual(expected);
	});

	it("all content generators produce non-empty strings", () => {
		const ctx = makeCtx();
		for (const file of productbook.files) {
			const content = resolveContent(file, ctx);
			expect(content.length).toBeGreaterThan(0);
			expect(typeof content).toBe("string");
		}
	});

	it("all markdown files start with YAML frontmatter or a markdown heading", () => {
		const ctx = makeCtx();
		for (const file of productbook.files) {
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

describe("productbook branding substitution", () => {
	it("context-dependent files use brandName, not a hardcoded value", () => {
		const ctx1 = makeCtx({
			branding: {
				siteName: "Alpha Docs",
				brandName: "Alpha Corp",
				brandUrl: "/",
			},
		});
		const ctx2 = makeCtx({
			branding: {
				siteName: "Beta Docs",
				brandName: "Beta Corp",
				brandUrl: "/",
			},
		});

		// Files that use ctx.branding.brandName in their description
		const brandDependentFiles = [
			"content/product/overview.md",
			"content/product/features/index.md",
			"content/product/releases/index.md",
			"content/domain/overview.md",
			"content/domain/processes/index.md",
			"content/domain/data-dictionary.md",
			"content/domain/industry-notes.md",
			"content/planning/roadmap.md",
			"content/planning/specs/index.md",
			"content/planning/research/index.md",
			"content/operations/environments.md",
			"content/operations/deployment.md",
			"content/guides/getting-started.md",
			"content/guides/user-guide.md",
			"content/reference/architecture/overview.md",
			"content/reference/integrations/index.md",
			"content/reference/data-models/index.md",
			"content/reference/contacts/directory.md",
			"content/reference/metrics/kpis.md",
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

	it("static templates are unaffected by context changes", () => {
		const ctx1 = makeCtx({
			branding: { siteName: "One", brandName: "One" },
		});
		const ctx2 = makeCtx({
			branding: { siteName: "Two", brandName: "Two" },
		});

		const staticFiles = [
			"content/planning/decisions/index.md",
			"content/planning/decisions/adr-template.md",
		];

		for (const path of staticFiles) {
			const file = findFile(path);
			expect(resolveContent(file, ctx1)).toBe(resolveContent(file, ctx2));
		}
	});
});
