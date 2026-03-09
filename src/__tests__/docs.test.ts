/**
 * Tests for the kitfly docs command and embed-docs codegen.
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { findSimilar } from "../commands/docs.ts";
import { EMBEDDED_DOCS } from "../generated/embedded-docs.ts";

describe("embed-docs codegen", () => {
	it("generates embedded-docs.ts with entries", () => {
		expect(existsSync("src/generated/embedded-docs.ts")).toBe(true);
		expect(EMBEDDED_DOCS.length).toBeGreaterThan(0);
	});

	it("each entry has [slug, title, content] tuple", () => {
		for (const entry of EMBEDDED_DOCS) {
			expect(entry).toHaveLength(3);
			const [slug, title, content] = entry;
			expect(typeof slug).toBe("string");
			expect(slug.length).toBeGreaterThan(0);
			expect(typeof title).toBe("string");
			expect(title.length).toBeGreaterThan(0);
			expect(typeof content).toBe("string");
			expect(content.length).toBeGreaterThan(0);
		}
	});

	it("slugs do not contain .md extension", () => {
		for (const [slug] of EMBEDDED_DOCS) {
			expect(slug).not.toMatch(/\.md$/);
		}
	});

	it("slugs do not start with docs/ or content/", () => {
		for (const [slug] of EMBEDDED_DOCS) {
			expect(slug).not.toMatch(/^(docs|content)\//);
		}
	});

	it("README/index files collapse to parent directory slug", () => {
		// The docs/userguide/cli/README.md should become userguide/cli
		const slugs = EMBEDDED_DOCS.map(([slug]) => slug);
		expect(slugs).toContain("userguide/cli");
		expect(slugs).not.toContain("userguide/cli/readme");
		expect(slugs).not.toContain("userguide/cli/README");
	});

	it("excludes docs/releases/** and docs/decisions/**", () => {
		const slugs = EMBEDDED_DOCS.map(([slug]) => slug);
		for (const slug of slugs) {
			expect(slug).not.toMatch(/^releases\//);
			expect(slug).not.toMatch(/^decisions\//);
		}
	});

	it("content has frontmatter stripped", () => {
		for (const [, , content] of EMBEDDED_DOCS) {
			// Content should not start with --- (frontmatter delimiter)
			expect(content.trimStart()).not.toMatch(/^---\s*\n/);
		}
	});

	it("entries are sorted by slug", () => {
		const slugs = EMBEDDED_DOCS.map(([slug]) => slug);
		const sorted = [...slugs].sort();
		expect(slugs).toEqual(sorted);
	});
});

describe("findSimilar", () => {
	const slugs = [
		"userguide/cli/dev",
		"userguide/cli/build",
		"userguide/cli/bundle",
		"userguide/sharing",
		"reference/configuration",
		"reference/plugins",
		"guide/getting-started",
	];

	it("finds prefix matches", () => {
		const results = findSimilar("userguide/cli", slugs, 3);
		expect(results.length).toBeGreaterThan(0);
		expect(results.every((r) => r.startsWith("userguide/cli"))).toBe(true);
	});

	it("finds substring matches", () => {
		const results = findSimilar("config", slugs, 3);
		expect(results).toContain("reference/configuration");
	});

	it("returns at most max results", () => {
		const results = findSimilar("userguide", slugs, 2);
		expect(results.length).toBeLessThanOrEqual(2);
	});

	it("returns empty for no match", () => {
		const results = findSimilar("nonexistent-slug-xyz", slugs, 3);
		expect(results).toEqual([]);
	});

	it("prioritizes prefix over substring", () => {
		const results = findSimilar("guide", slugs, 3);
		// "guide/getting-started" is a prefix match, should come first
		expect(results[0]).toBe("guide/getting-started");
	});
});

describe("embed-docs script", () => {
	it("regenerates from manifest without errors", () => {
		const output = execSync("bun scripts/embed-docs.ts", { encoding: "utf-8" });
		expect(output).toContain("Embedded");
		expect(output).toContain("docs into src/generated/embedded-docs.ts");
	});
});
