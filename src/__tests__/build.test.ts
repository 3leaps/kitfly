/**
 * Integration tests for the static site builder (scripts/build.ts)
 *
 * These tests exercise the build() function end-to-end:
 *   create a temp site directory -> run build() -> verify output files
 */

import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { build } from "../../scripts/build.ts";
import { exists } from "../shared.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a temp directory that will be cleaned up after each test. */
const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
	const dir = await mkdtemp(join(tmpdir(), "kitfly-build-test-"));
	tempDirs.push(dir);
	return dir;
}

/** Write a minimal site.yaml into the given directory. */
async function writeSiteYaml(dir: string, extra: Record<string, unknown> = {}): Promise<void> {
	const brand = extra.brand ?? "  name: Test\n  url: /";
	const sections = extra.sections ?? "  - name: Docs\n    path: docs";
	const title = extra.title ?? "Test Site";
	const home = extra.home ? `home: ${extra.home}\n` : "";
	const yaml = `title: ${title}\nbrand:\n${brand}\n${home}sections:\n${sections}\n`;
	await writeFile(join(dir, "site.yaml"), yaml);
}

/** Write a markdown file, creating parent directories as needed. */
async function writeMd(dir: string, relPath: string, content: string): Promise<void> {
	const fullPath = join(dir, relPath);
	await mkdir(join(fullPath, ".."), { recursive: true });
	await writeFile(fullPath, content);
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

afterEach(async () => {
	for (const d of tempDirs) {
		await rm(d, { recursive: true, force: true }).catch(() => {});
	}
	tempDirs.length = 0;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("build", () => {
	it("produces index.html with rendered markdown content", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		await writeSiteYaml(siteDir);
		await writeMd(siteDir, "docs/hello.md", "# Hello\n\nWorld");

		await build({ folder: siteDir, out: outDir });

		const indexPath = join(siteDir, outDir, "index.html");
		expect(await exists(indexPath)).toBe(true);

		const html = await readFile(indexPath, "utf-8");
		// The first file is used as index; its content should include the rendered markdown
		expect(html).toContain("<h1");
		expect(html).toContain("Hello");
		expect(html).toContain("<p>World</p>");
		// Should contain site title somewhere in the page
		expect(html).toContain("Test Site");
	});

	it("creates correct directory structure for multi-section site", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		await writeSiteYaml(siteDir, {
			sections: "  - name: Guides\n    path: guides\n  - name: API\n    path: api",
		});
		await writeMd(siteDir, "guides/intro.md", "# Intro\n\nGuide content");
		await writeMd(siteDir, "api/ref.md", "# Reference\n\nAPI content");

		await build({ folder: siteDir, out: outDir });

		const dist = join(siteDir, outDir);

		// Each section's file should produce a .html under its path
		expect(await exists(join(dist, "guides", "intro.html"))).toBe(true);
		expect(await exists(join(dist, "api", "ref.html"))).toBe(true);

		// Verify content ended up in the right files
		const guidesHtml = await readFile(join(dist, "guides", "intro.html"), "utf-8");
		expect(guidesHtml).toContain("Guide content");

		const apiHtml = await readFile(join(dist, "api", "ref.html"), "utf-8");
		expect(apiHtml).toContain("API content");
	});

	it("copies styles.css to output", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		await writeSiteYaml(siteDir);
		await writeMd(siteDir, "docs/page.md", "# Page");

		await build({ folder: siteDir, out: outDir });

		const cssPath = join(siteDir, outDir, "styles.css");
		expect(await exists(cssPath)).toBe(true);

		const css = await readFile(cssPath, "utf-8");
		// The engine styles.css should be non-trivial
		expect(css.length).toBeGreaterThan(100);
	});

	it("includes nav links to all pages in generated HTML", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		await writeSiteYaml(siteDir);
		await writeMd(siteDir, "docs/alpha.md", "# Alpha");
		await writeMd(siteDir, "docs/beta.md", "# Beta");

		await build({ folder: siteDir, out: outDir });

		// Check the index page has nav links to both files
		const indexHtml = await readFile(join(siteDir, outDir, "index.html"), "utf-8");
		expect(indexHtml).toContain("alpha.html");
		expect(indexHtml).toContain("beta.html");
	});

	it("produces getting-started page when no content files exist", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		// Point section at an empty directory
		await mkdir(join(siteDir, "docs"), { recursive: true });
		await writeSiteYaml(siteDir);

		await build({ folder: siteDir, out: outDir });

		const indexPath = join(siteDir, outDir, "index.html");
		expect(await exists(indexPath)).toBe(true);

		const html = await readFile(indexPath, "utf-8");
		expect(html).toContain("Getting Started");
	});

	it("respects custom output directory path", async () => {
		const siteDir = await makeTempDir();
		const customOut = "my-custom-output";
		await writeSiteYaml(siteDir);
		await writeMd(siteDir, "docs/page.md", "# Page");

		await build({ folder: siteDir, out: customOut });

		// Output should be at siteDir/my-custom-output, NOT siteDir/dist
		expect(await exists(join(siteDir, customOut, "index.html"))).toBe(true);
		expect(await exists(join(siteDir, "dist", "index.html"))).toBe(false);
	});

	it("generates provenance.json in output", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		await writeSiteYaml(siteDir);
		await writeMd(siteDir, "docs/page.md", "# Page");

		await build({ folder: siteDir, out: outDir });

		const provPath = join(siteDir, outDir, "provenance.json");
		expect(await exists(provPath)).toBe(true);

		const prov = JSON.parse(await readFile(provPath, "utf-8"));
		expect(prov).toHaveProperty("version");
		expect(prov).toHaveProperty("buildDate");
		expect(prov).toHaveProperty("gitCommit");
		expect(prov).toHaveProperty("gitBranch");
	});

	it("generates AI accessibility files (content-index.json, llms.txt, _raw/)", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		await writeSiteYaml(siteDir);
		await writeMd(siteDir, "docs/page.md", "---\ntitle: My Page\n---\n\n# My Page\n\nBody text");

		await build({ folder: siteDir, out: outDir, raw: true });

		const dist = join(siteDir, outDir);

		// content-index.json
		const ciPath = join(dist, "content-index.json");
		expect(await exists(ciPath)).toBe(true);
		const ci = JSON.parse(await readFile(ciPath, "utf-8"));
		expect(ci.title).toBe("Test Site");
		expect(ci.pages).toHaveLength(1);
		expect(ci.pages[0].title).toBe("My Page");

		// llms.txt
		const llmsPath = join(dist, "llms.txt");
		expect(await exists(llmsPath)).toBe(true);
		const llms = await readFile(llmsPath, "utf-8");
		expect(llms).toContain("Test Site");

		// _raw/ directory with markdown copy
		const rawEntries = await readdir(join(dist, "_raw"), { recursive: true });
		expect(rawEntries.length).toBeGreaterThan(0);
	});
});
