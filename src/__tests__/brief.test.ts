/**
 * Tests for the Brief template definition
 *
 * Covers: src/templates/brief.ts
 * Strategy: import the template directly, verify structure and generated content
 */

import { describe, expect, it } from "vitest";
import { brief } from "../templates/brief.ts";
import type { BrandingConfig, TemplateContext, TemplateFile } from "../templates/schema.ts";

function makeCtx(overrides?: Partial<TemplateContext>): TemplateContext {
	const branding: BrandingConfig = {
		siteName: "Test Brief",
		brandName: "Acme Corp",
		brandUrl: "https://acme.example.com",
		primaryColor: "#2563eb",
		footerText: "Footer text",
	};
	return {
		name: "test-brief",
		branding,
		template: brief,
		year: 2026,
		...overrides,
	};
}

function resolveContent(file: TemplateFile, ctx: TemplateContext): string {
	return typeof file.content === "function" ? file.content(ctx) : file.content;
}

function findFile(path: string): TemplateFile {
	const f = brief.files.find((entry) => entry.path === path);
	if (!f) throw new Error(`Template file not found: ${path}`);
	return f;
}

describe("brief template definition", () => {
	it("has correct identity metadata", () => {
		expect(brief.id).toBe("brief");
		expect(brief.name).toBe("Brief");
		expect(brief.version).toBe(1);
		expect(brief.extends).toBe("minimal");
	});

	it("defines exactly four sections", () => {
		expect(brief.sections).toHaveLength(4);
		expect(brief.sections.map((s) => s.name)).toEqual([
			"Product",
			"Use Cases",
			"Getting Started",
			"Reference",
		]);
		expect(brief.sections.map((s) => s.path)).toEqual([
			"content/product",
			"content/use-cases",
			"content/getting-started",
			"content/reference",
		]);
	});

	it("defines unique file paths", () => {
		const paths = brief.files.map((f) => f.path);
		expect(new Set(paths).size).toBe(paths.length);
	});
});

describe("brief site.yaml", () => {
	const ctx = makeCtx();
	const file = findFile("site.yaml");

	it("includes branding and all four section paths", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('title: "Test Brief"');
		expect(content).toContain('name: "Acme Corp"');
		expect(content).toContain('url: "https://acme.example.com"');
		expect(content).toContain('"content/product"');
		expect(content).toContain('"content/use-cases"');
		expect(content).toContain('"content/getting-started"');
		expect(content).toContain('"content/reference"');
		expect(content).toContain('home: "index.md"');
	});
});

describe("brief starter files", () => {
	const ctx = makeCtx();
	const starterFiles = [
		"index.md",
		"content/product/overview.md",
		"content/product/capabilities.md",
		"content/use-cases/overview.md",
		"content/use-cases/example-use-case.md",
		"content/getting-started/overview.md",
		"content/getting-started/requirements.md",
		"content/reference/architecture.md",
		"content/reference/faq.md",
		"content/reference/contacts.md",
	];

	it("ships all 10 starter files", () => {
		expect(starterFiles).toHaveLength(10);
		for (const path of starterFiles) {
			expect(brief.files.some((f) => f.path === path)).toBe(true);
		}
	});

	it("includes frontmatter in markdown starter files", () => {
		for (const path of starterFiles) {
			const content = resolveContent(findFile(path), ctx);
			expect(content).toMatch(/^---\n/);
		}
	});

	it("includes customize markers in starter files", () => {
		for (const path of starterFiles) {
			const content = resolveContent(findFile(path), ctx);
			expect(content).toContain("<!-- ← CUSTOMIZE");
		}
	});

	it("uses professional framing in index and use cases", () => {
		const index = resolveContent(findFile("index.md"), ctx);
		expect(index).toContain("At a Glance");
		expect(index).toContain("[Use Cases](/content/use-cases/overview)");

		const useCases = resolveContent(findFile("content/use-cases/example-use-case.md"), ctx);
		expect(useCases).toContain("## Scenario");
		expect(useCases).toContain("## Outcome");
		expect(useCases).toContain("| Metric | Before | After |");
	});
});

describe("brief CUSTOMIZING.md", () => {
	const ctx = makeCtx();
	const file = findFile("CUSTOMIZING.md");

	it("documents template identity and external-audience tone", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("template: brief");
		expect(content).toContain("clients, prospects, and partners");
		expect(content).toContain("Informational and professional");
		expect(content).toContain("Not sales copy");
	});

	it("guides use-case duplication workflow", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("Duplicate `content/use-cases/example-use-case.md`");
		expect(content).toContain("problem -> solution -> outcome");
	});
});
