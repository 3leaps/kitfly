/**
 * Integration tests for the static site builder (scripts/build.ts)
 *
 * These tests exercise the build() function end-to-end:
 *   create a temp site directory -> run build() -> verify output files
 */

import { createHash } from "node:crypto";
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
	const version = extra.version ? `version: ${extra.version}\n` : "";
	const mode = extra.mode ? `mode: ${extra.mode}\n` : "";
	const aspect = extra.aspect ? `aspect: ${extra.aspect}\n` : "";
	const home = extra.home ? `home: ${extra.home}\n` : "";
	const yaml = `title: ${title}\n${version}${mode}${aspect}brand:\n${brand}\n${home}sections:\n${sections}\n`;
	await writeFile(join(dir, "site.yaml"), yaml);
}

/** Write a markdown file, creating parent directories as needed. */
async function writeMd(dir: string, relPath: string, content: string): Promise<void> {
	const fullPath = join(dir, relPath);
	await mkdir(join(fullPath, ".."), { recursive: true });
	await writeFile(fullPath, content);
}

function sha256Hex(text: string): string {
	return createHash("sha256").update(new TextEncoder().encode(text)).digest("hex");
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
		// version is omitted when no site.yaml version or git tag exists
		expect(prov).toHaveProperty("buildDate");
		expect(prov).toHaveProperty("gitCommit");
		expect(prov).toHaveProperty("gitBranch");
	});

	it("uses configured site version in rendered sidebar and provenance", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		await writeSiteYaml(siteDir, { version: '"2.4.1"' });
		await writeMd(siteDir, "docs/page.md", "# Page");

		await build({ folder: siteDir, out: outDir });

		const html = await readFile(join(siteDir, outDir, "index.html"), "utf-8");
		expect(html).toContain("v2.4.1");

		const prov = JSON.parse(await readFile(join(siteDir, outDir, "provenance.json"), "utf-8"));
		expect(prov.version).toBe("2.4.1");
	});

	it("shows unversioned in sidebar when no site version or tag is available", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		await writeSiteYaml(siteDir);
		await writeMd(siteDir, "docs/page.md", "# Page");

		await build({ folder: siteDir, out: outDir });

		const html = await readFile(join(siteDir, outDir, "index.html"), "utf-8");
		expect(html).toContain("unversioned");
	});

	it("builds a single-page hash-routed deck when mode is slides", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		await writeSiteYaml(siteDir, {
			mode: "slides",
			aspect: '"4/3"',
			sections: "  - name: Slides\n    path: slides",
		});
		await writeMd(
			siteDir,
			"slides/deck.md",
			`---
title: Intro
---

# Intro
![Diagram](./img/diagram.png)
[Report](../files/report.pdf)
--- slide ---
# Next`,
		);

		await build({ folder: siteDir, out: outDir });

		const html = await readFile(join(siteDir, outDir, "index.html"), "utf-8");
		expect(html).toContain('class="mode-slides"');
		expect(html).toContain('id="slide-1"');
		expect(html).toContain('id="slide-2"');
		expect(html).toContain('href="#slide-1"');
		expect(html).toContain('href="#slide-2"');
		expect(html).toContain('src="./slides/img/diagram.png"');
		expect(html).toContain('href="./files/report.pdf"');
		expect(await exists(join(siteDir, outDir, "slides", "deck.html"))).toBe(false);
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

	it("injects enabled plugins into generated HTML", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		await writeSiteYaml(siteDir);
		await writeMd(siteDir, "docs/page.md", "> NOTE: Hello\n\nBody");

		// Local plugin assets + registry
		const js = "console.log('callouts');";
		const css = ".kitfly-callout{border-left:6px solid red;}";
		await mkdir(join(siteDir, "plugins-dist"), { recursive: true });
		await writeFile(join(siteDir, "plugins-dist", "callouts.js"), js, "utf-8");
		await writeFile(join(siteDir, "plugins-dist", "callouts.css"), css, "utf-8");

		await mkdir(join(siteDir, "registry"), { recursive: true });
		await writeFile(
			join(siteDir, "registry", "plugins.yaml"),
			`version: 1
updated: "2026-02-12"
baseUrl: ""
plugins:
  callouts:
    name: "Callout Boxes"
    description: "Test callouts"
    version: "0.2.0"
    contract: "1"
    kitfly: ">=0.2.0 <1.0.0"
    license: MIT
    verified: true
    assets:
      js: "plugins-dist/callouts.js"
      css: "plugins-dist/callouts.css"
      assetSha256:
        js: "sha256:${sha256Hex(js)}"
        css: "sha256:${sha256Hex(css)}"
`,
			"utf-8",
		);

		await writeFile(
			join(siteDir, "kitfly.plugins.yaml"),
			"plugins:\n  - callouts@0.2.0\n",
			"utf-8",
		);

		await build({ folder: siteDir, out: outDir });

		const html = await readFile(join(siteDir, outDir, "index.html"), "utf-8");
		expect(html).toContain('data-kitfly-plugin="callouts@0.2.0"');
		expect(html).toContain(css);
		expect(html).toContain(js);
	});

	it("injects latex plugin in docs mode", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		await writeSiteYaml(siteDir);
		await writeMd(
			siteDir,
			"docs/math.md",
			"# Math\n\nInline: $x^2$.\n\n$$\n\\\\int_0^1 x^2 dx\n$$\n\n```math\n\\\\sum_{i=1}^{n} i\n```",
		);
		await writeFile(join(siteDir, "kitfly.plugins.yaml"), "plugins:\n  - latex@0.2.2\n", "utf-8");

		await build({ folder: siteDir, out: outDir });

		const html = await readFile(join(siteDir, outDir, "index.html"), "utf-8");
		expect(html).toContain('data-kitfly-plugin="latex@0.2.2"');
		expect(html).toContain('.katex .katex-version:after{content:"0.16.21"}');
		expect(html).toContain("kitfly-katex-display");
		expect(html).not.toContain("const KATEX_JS_URL =");
	});

	it("injects slides-only plugins when mode=slides", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		await writeSiteYaml(siteDir, { mode: "slides" });
		await writeMd(
			siteDir,
			"docs/deck.md",
			`# Title

:::kpi
label: Uptime
value: 99.95%
trend: +0.3%
:::
`,
		);

		const js = "console.log('slides visuals');";
		const css = ".kitfly-visual{border:1px solid red;}";
		await mkdir(join(siteDir, "plugins-dist"), { recursive: true });
		await writeFile(join(siteDir, "plugins-dist", "slides-visuals.js"), js, "utf-8");
		await writeFile(join(siteDir, "plugins-dist", "slides-visuals.css"), css, "utf-8");

		await mkdir(join(siteDir, "registry"), { recursive: true });
		await writeFile(
			join(siteDir, "registry", "plugins.yaml"),
			`version: 1
updated: "2026-02-13"
baseUrl: ""
plugins:
  slides-visuals:
    name: "Slides Visuals"
    description: "Test visuals"
    version: "0.2.1"
    contract: "1"
    kitfly: ">=0.2.0 <1.0.0"
    license: MIT
    verified: true
    modes: ["slides"]
    assets:
      js: "plugins-dist/slides-visuals.js"
      css: "plugins-dist/slides-visuals.css"
      assetSha256:
        js: "sha256:${sha256Hex(js)}"
        css: "sha256:${sha256Hex(css)}"
`,
			"utf-8",
		);

		await writeFile(
			join(siteDir, "kitfly.plugins.yaml"),
			"plugins:\n  - slides-visuals@0.2.1\n",
			"utf-8",
		);

		await build({ folder: siteDir, out: outDir });

		const html = await readFile(join(siteDir, outDir, "index.html"), "utf-8");
		expect(html).toContain('data-kitfly-plugin="slides-visuals@0.2.1"');
		expect(html).toContain(css);
		expect(html).toContain(js);
	});

	it("ignores unknown slides-visuals block types while enforcing known contracts", async () => {
		const siteDir = await makeTempDir();
		const outDir = "out";
		await writeSiteYaml(siteDir, { mode: "slides" });
		await writeMd(
			siteDir,
			"docs/deck.md",
			`# Title

:::future-thing
note: this should pass through
:::

:::kpi
label: Uptime
value: 99.95%
:::
`,
		);

		const js = "console.log('slides visuals');";
		const css = ".kitfly-visual{border:1px solid red;}";
		await mkdir(join(siteDir, "plugins-dist"), { recursive: true });
		await writeFile(join(siteDir, "plugins-dist", "slides-visuals.js"), js, "utf-8");
		await writeFile(join(siteDir, "plugins-dist", "slides-visuals.css"), css, "utf-8");
		await mkdir(join(siteDir, "registry"), { recursive: true });
		await writeFile(
			join(siteDir, "registry", "plugins.yaml"),
			`version: 1
updated: "2026-02-15"
baseUrl: ""
plugins:
  slides-visuals:
    name: "Slides Visuals"
    description: "Test visuals"
    version: "0.2.1"
    contract: "1"
    kitfly: ">=0.2.0 <1.0.0"
    license: MIT
    verified: true
    modes: ["slides"]
    assets:
      js: "plugins-dist/slides-visuals.js"
      css: "plugins-dist/slides-visuals.css"
      assetSha256:
        js: "sha256:${sha256Hex(js)}"
        css: "sha256:${sha256Hex(css)}"
`,
			"utf-8",
		);
		await writeFile(
			join(siteDir, "kitfly.plugins.yaml"),
			"plugins:\n  - slides-visuals@0.2.1\n",
			"utf-8",
		);

		await expect(build({ folder: siteDir, out: outDir })).resolves.toBeUndefined();
		const html = await readFile(join(siteDir, outDir, "index.html"), "utf-8");
		expect(html).toContain('data-kitfly-plugin="slides-visuals@0.2.1"');
		expect(html).toContain("future-thing");
	});
});
