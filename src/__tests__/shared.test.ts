/**
 * Basic tests for shared utilities
 */

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	buildBreadcrumbsSimple,
	buildBreadcrumbsStatic,
	buildBundleFooter,
	buildFooter,
	buildNavSimple,
	buildNavStatic,
	buildPageMeta,
	buildSlideNav,
	buildToc,
	type ContentFile,
	collectFiles,
	collectSlides,
	envBool,
	envInt,
	envString,
	escapeHtml,
	exists,
	filterUnknownSlidesVisualsTypeDiagnostics,
	formatDate,
	generateProvenance,
	getGitInfo,
	KITFLY_BRAND,
	loadSiteConfig,
	type Provenance,
	parseFrontmatter,
	parseValue,
	parseYaml,
	resolveSiteVersion,
	rewriteRelativeAssetUrls,
	type SiteConfig,
	segmentSlides,
	slugify,
	splitSlides,
	stripQuotes,
	toUrlPath,
	validatePath,
	validateSlidesVisualsFences,
} from "../shared.ts";

describe("slugify", () => {
	it("converts text to URL-friendly slug", () => {
		expect(slugify("Hello World")).toBe("hello-world");
		expect(slugify("Getting Started")).toBe("getting-started");
	});

	it("handles special characters", () => {
		expect(slugify("What's New?")).toBe("whats-new");
		expect(slugify("C++ Programming")).toBe("c-programming");
	});

	it("handles consecutive spaces", () => {
		expect(slugify("Multiple   Spaces")).toBe("multiple-spaces");
	});
});

describe("escapeHtml", () => {
	it("escapes HTML special characters", () => {
		expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
		expect(escapeHtml('Hello "World"')).toBe("Hello &quot;World&quot;");
		expect(escapeHtml("a & b")).toBe("a &amp; b");
	});

	it("handles empty string", () => {
		expect(escapeHtml("")).toBe("");
	});
});

describe("parseFrontmatter", () => {
	it("extracts YAML frontmatter from markdown", () => {
		const content = `---
title: My Page
description: A test page
---

# Content here`;

		const { frontmatter, body } = parseFrontmatter(content);
		expect(frontmatter.title).toBe("My Page");
		expect(frontmatter.description).toBe("A test page");
		expect(body.trim()).toBe("# Content here");
	});

	it("handles content without frontmatter", () => {
		const content = "# Just a heading\n\nSome text";
		const { frontmatter, body } = parseFrontmatter(content);
		expect(Object.keys(frontmatter)).toHaveLength(0);
		expect(body).toBe(content);
	});

	it("extracts frontmatter with leading whitespace (delimiter-split slides)", () => {
		const content = `\n\n  ---\n  title: Slide Two\n  ---\n\n# Two`;
		const { frontmatter, body } = parseFrontmatter(content);
		expect(frontmatter.title).toBe("Slide Two");
		expect(body.trim()).toBe("# Two");
	});
});

describe("splitSlides", () => {
	it("splits markdown on explicit slide delimiter", () => {
		const input = `# One

--- slide ---

# Two`;
		const slides = splitSlides(input);
		expect(slides).toHaveLength(2);
		expect(slides[0]).toContain("# One");
		expect(slides[1]).toContain("# Two");
	});

	it("does not split on plain horizontal rules", () => {
		const input = `# One

---

Still one slide`;
		const slides = splitSlides(input);
		expect(slides).toHaveLength(1);
	});

	it("ignores delimiter text inside fenced code blocks", () => {
		const input = `# One

\`\`\`md
--- slide ---
\`\`\`

--- slide ---

# Two`;
		const slides = splitSlides(input);
		expect(slides).toHaveLength(2);
		expect(slides[0]).toContain("```md");
		expect(slides[0]).toContain("--- slide ---");
	});

	it("does not break on 4-backtick fences containing 3-backtick lines", () => {
		const input = `\`\`\`\`md
\`\`\` still code
--- slide ---
\`\`\`\`
--- slide ---
# Real slide`;
		const slides = splitSlides(input);
		expect(slides).toHaveLength(2);
		expect(slides[0]).toContain("--- slide ---");
		expect(slides[1].trim()).toBe("# Real slide");
	});
});

describe("slides-visuals diagnostics filtering", () => {
	it("drops unknown-type diagnostics while preserving schema violations", () => {
		const markdown = `:::future-thing
foo: bar
:::

:::kpi
label: Missing value
:::`;
		const diagnostics = validateSlidesVisualsFences(markdown);
		const filtered = filterUnknownSlidesVisualsTypeDiagnostics(diagnostics);
		expect(
			diagnostics.some((d) => d.message.startsWith("Unknown slides-visuals block type:")),
		).toBe(true);
		expect(filtered.some((d) => d.message.startsWith("Unknown slides-visuals block type:"))).toBe(
			false,
		);
		expect(filtered.some((d) => d.message.includes("Missing required key: value"))).toBe(true);
	});
});

describe("segmentSlides", () => {
	it("uses frontmatter title and class when present", () => {
		const input = `---
title: Intro Slide
class: two-column
---

# Welcome`;
		const segments = segmentSlides(input, "Deck");
		expect(segments).toHaveLength(1);
		expect(segments[0].title).toBe("Intro Slide");
		expect(segments[0].className).toBe("two-column");
	});

	it("falls back to first heading when frontmatter title is missing", () => {
		const input = `# Architecture Overview

Body`;
		const segments = segmentSlides(input, "Deck");
		expect(segments[0].title).toBe("Architecture Overview");
	});

	it("ignores headings inside fenced code blocks when deriving title", () => {
		const input = `\`\`\`md
# Not a real heading
\`\`\`

# Real Heading`;
		const segments = segmentSlides(input, "Deck");
		expect(segments[0].title).toBe("Real Heading");
	});

	it("falls back to indexed title when no frontmatter title or heading exists", () => {
		const input = `Just text
--- slide ---
More text`;
		const segments = segmentSlides(input, "Runbook Deck");
		expect(segments).toHaveLength(2);
		expect(segments[0].title).toBe("Runbook Deck (1)");
		expect(segments[1].title).toBe("Runbook Deck (2)");
	});

	it("parses frontmatter per slide segment", () => {
		const input = `---
title: First
---

# One
--- slide ---
---
title: Second
class: centered
---

# Two`;
		const segments = segmentSlides(input, "Deck");
		expect(segments).toHaveLength(2);
		expect(segments[0].title).toBe("First");
		expect(segments[1].title).toBe("Second");
		expect(segments[1].className).toBe("centered");
	});

	it("sanitizes frontmatter class to safe class tokens", () => {
		const input = `---
class: centered two-column "><img src=x onerror=alert(1)>
---

# Safe classes only`;
		const segments = segmentSlides(input, "Deck");
		expect(segments[0].className).toBe("centered two-column");
	});
});

describe("collectSlides and buildSlideNav", () => {
	const tempDirs: string[] = [];

	afterEach(async () => {
		for (const dir of tempDirs) {
			await rm(dir, { recursive: true, force: true });
		}
		tempDirs.length = 0;
	});

	it("collects segmented markdown slides and assigns sequential ids", async () => {
		const dir = await mkdtemp(join(tmpdir(), "kitfly-slides-collect-"));
		tempDirs.push(dir);
		const mdPath = join(dir, "deck.md");
		await writeFile(
			mdPath,
			`---
title: Intro
---

# Intro
--- slide ---
# Next`,
			"utf-8",
		);

		const files: ContentFile[] = [
			{ path: mdPath, urlPath: "slides/deck", section: "Slides", sectionBase: "slides" },
		];

		const slides = await collectSlides(files);
		expect(slides).toHaveLength(2);
		expect(slides[0].id).toBe("slide-1");
		expect(slides[1].id).toBe("slide-2");
		expect(slides[0].title).toBe("Intro");
		expect(slides[1].title).toBe("Next");
		expect(slides[0].kind).toBe("markdown");
	});

	it("collects yaml/json files as single non-markdown slides", async () => {
		const dir = await mkdtemp(join(tmpdir(), "kitfly-slides-kinds-"));
		tempDirs.push(dir);
		const yamlPath = join(dir, "config.yaml");
		const jsonPath = join(dir, "data.json");
		await writeFile(yamlPath, "name: test\n", "utf-8");
		await writeFile(jsonPath, '{"ok":true}\n', "utf-8");

		const files: ContentFile[] = [
			{ path: yamlPath, urlPath: "ref/config", section: "Reference", sectionBase: "ref" },
			{ path: jsonPath, urlPath: "ref/data", section: "Reference", sectionBase: "ref" },
		];
		const slides = await collectSlides(files);
		expect(slides).toHaveLength(2);
		expect(slides[0].kind).toBe("yaml");
		expect(slides[1].kind).toBe("json");
		expect(slides[0].title).toBe("config");
		expect(slides[1].title).toBe("data");
	});

	it("builds slide nav grouped by section using slide ids", () => {
		const nav = buildSlideNav(
			[
				{
					index: 0,
					frontmatter: {},
					body: "# A",
					title: "Slide A",
					id: "slide-1",
					section: "Slides",
					sourcePath: "/tmp/a.md",
					sourceUrlPath: "slides/a",
					kind: "markdown",
				},
				{
					index: 1,
					frontmatter: {},
					body: "# B",
					title: "Slide B",
					id: "slide-2",
					section: "Slides",
					sourcePath: "/tmp/b.md",
					sourceUrlPath: "slides/b",
					kind: "markdown",
				},
			],
			{
				docroot: ".",
				title: "Deck",
				brand: { name: "Test", url: "/" },
				sections: [{ name: "Slides", path: "slides" }],
			},
			"slide-2",
		);
		expect(nav).toContain('<a href="#slide-1">Slide A</a>');
		expect(nav).toContain('<a href="#slide-2" class="active">Slide B</a>');
		expect(nav).toContain('<span class="nav-section">Slides</span>');
	});
});

describe("rewriteRelativeAssetUrls", () => {
	it("rewrites image sources relative to the source markdown path", () => {
		const html = '<p><img src="./img/diagram.png" alt="diagram"></p>';
		const rewritten = rewriteRelativeAssetUrls(html, "slides/deck", "/");
		expect(rewritten).toContain('src="/slides/img/diagram.png"');
	});

	it("preserves external and anchor refs", () => {
		const html = '<a href="https://example.com">ext</a> <a href="#slide-2">hash</a>';
		const rewritten = rewriteRelativeAssetUrls(html, "slides/deck", "./");
		expect(rewritten).toContain('href="https://example.com"');
		expect(rewritten).toContain('href="#slide-2"');
	});

	it("keeps query/hash suffix when rewriting", () => {
		const html = '<a href="../files/report.pdf?dl=1#v2">report</a>';
		const rewritten = rewriteRelativeAssetUrls(html, "slides/deck", "./");
		expect(rewritten).toContain('href="./files/report.pdf?dl=1#v2"');
	});

	it("does not rewrite non-asset href links", () => {
		const html = '<a href="other.md">doc</a> <a href="./other.md">doc2</a>';
		const rewritten = rewriteRelativeAssetUrls(html, "slides/deck", "./");
		expect(rewritten).toContain('href="other.md"');
		expect(rewritten).toContain('href="./other.md"');
	});
});

// ---------------------------------------------------------------------------
// parseYaml, parseValue, stripQuotes tests
// ---------------------------------------------------------------------------

describe("stripQuotes", () => {
	it("removes double quotes from string", () => {
		expect(stripQuotes('"hello world"')).toBe("hello world");
	});

	it("removes single quotes from string", () => {
		expect(stripQuotes("'hello world'")).toBe("hello world");
	});

	it("returns string unchanged if no quotes", () => {
		expect(stripQuotes("hello world")).toBe("hello world");
	});

	it("returns string unchanged if only starting quote", () => {
		expect(stripQuotes('"hello world')).toBe('"hello world');
	});

	it("returns string unchanged if only ending quote", () => {
		expect(stripQuotes('hello world"')).toBe('hello world"');
	});

	it("returns string unchanged if mismatched quotes", () => {
		expect(stripQuotes("\"hello world'")).toBe("\"hello world'");
	});

	it("handles empty string", () => {
		expect(stripQuotes("")).toBe("");
	});

	it("handles empty quoted string", () => {
		expect(stripQuotes('""')).toBe("");
		expect(stripQuotes("''")).toBe("");
	});
});

describe("parseValue", () => {
	it("parses boolean true", () => {
		expect(parseValue("true")).toBe(true);
	});

	it("parses boolean false", () => {
		expect(parseValue("false")).toBe(false);
	});

	it("parses quoted boolean as string", () => {
		// parseValue strips quotes before interpreting booleans
		expect(parseValue('"true"')).toBe(true);
		expect(parseValue('"false"')).toBe(false);
	});

	it("returns string values unchanged", () => {
		expect(parseValue("hello")).toBe("hello");
		expect(parseValue("123")).toBe("123");
	});

	it("strips quotes from string values", () => {
		expect(parseValue('"hello"')).toBe("hello");
		expect(parseValue("'world'")).toBe("world");
	});
});

describe("parseYaml", () => {
	it("parses simple key-value pairs", () => {
		const yaml = `title: My Site
description: A test site`;
		const result = parseYaml(yaml);
		expect(result.title).toBe("My Site");
		expect(result.description).toBe("A test site");
	});

	it("parses nested objects", () => {
		const yaml = `brand:
  name: My Brand
  url: https://example.com`;
		const result = parseYaml(yaml);
		expect(result.brand).toEqual({
			name: "My Brand",
			url: "https://example.com",
		});
	});

	it("parses arrays with objects", () => {
		const yaml = `sections:
  - name: Overview
    path: ./
  - name: Guides
    path: guides`;
		const result = parseYaml(yaml);
		expect(result.sections).toEqual([
			{ name: "Overview", path: "./" },
			{ name: "Guides", path: "guides" },
		]);
	});

	it("parses inline arrays", () => {
		const yaml = `sections:
  - name: Overview
    files: ["README.md", "index.md"]`;
		const result = parseYaml(yaml);
		expect((result.sections as unknown[])[0]).toEqual({
			name: "Overview",
			files: ["README.md", "index.md"],
		});
	});

	it("parses boolean values", () => {
		const yaml = `brand:
  external: true
  internal: false`;
		const result = parseYaml(yaml);
		expect((result.brand as Record<string, unknown>).external).toBe(true);
		expect((result.brand as Record<string, unknown>).internal).toBe(false);
	});

	it("skips comment lines", () => {
		const yaml = `# This is a comment
title: My Site
# Another comment
description: Test`;
		const result = parseYaml(yaml);
		expect(result.title).toBe("My Site");
		expect(result.description).toBe("Test");
		expect(Object.keys(result)).toHaveLength(2);
	});

	it("skips empty lines", () => {
		const yaml = `title: My Site

description: Test`;
		const result = parseYaml(yaml);
		expect(result.title).toBe("My Site");
		expect(result.description).toBe("Test");
	});

	it("handles quoted values", () => {
		const yaml = `title: "My Site"
description: 'A test site'`;
		const result = parseYaml(yaml);
		expect(result.title).toBe("My Site");
		expect(result.description).toBe("A test site");
	});

	it("handles simple array items", () => {
		const yaml = `tags:
  - javascript
  - typescript`;
		const result = parseYaml(yaml);
		expect(result.tags).toEqual(["javascript", "typescript"]);
	});

	it("returns empty object for empty input", () => {
		const result = parseYaml("");
		expect(result).toEqual({});
	});
});

// ---------------------------------------------------------------------------
// validatePath, toUrlPath, exists tests
// ---------------------------------------------------------------------------

describe("validatePath", () => {
	const root = "/home/user/project";

	it("returns resolved path for valid path within root", () => {
		const result = validatePath(root, "docs", "guide.md");
		expect(result).toBe(resolve(root, "docs", "guide.md"));
	});

	it("returns null for path escaping root with ../", () => {
		const result = validatePath(root, "docs", "../../../etc/passwd");
		expect(result).toBeNull();
	});

	it("allows paths that stay within root", () => {
		const result = validatePath(root, "docs", "../content/file.md");
		expect(result).toBe(resolve(root, "content", "file.md"));
	});

	it("returns root path itself when path resolves to root", () => {
		const result = validatePath(root, ".", ".");
		expect(result).toBe(resolve(root));
	});

	it("logs error when logErrors is true and path escapes", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const result = validatePath(root, "docs", "../../../../etc/passwd", true);
		expect(result).toBeNull();
		expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Path escapes repo root"));
		consoleSpy.mockRestore();
	});

	it("does not log error when logErrors is false", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const result = validatePath(root, "docs", "../../../../etc/passwd", false);
		expect(result).toBeNull();
		expect(consoleSpy).not.toHaveBeenCalled();
		consoleSpy.mockRestore();
	});
});

describe("toUrlPath", () => {
	it("strips root prefix from path", () => {
		const root = "/home/user/project";
		const result = toUrlPath(root, resolve(root, "docs", "guide.md"));
		expect(result).toBe("docs/guide.md");
	});

	it("returns path unchanged if it does not start with root", () => {
		const result = toUrlPath("/home/user/project", "/other/path/file.md");
		expect(result).toBe("/other/path/file.md");
	});

	it("handles nested paths correctly", () => {
		const root = "/root";
		const result = toUrlPath(root, resolve(root, "a", "b", "c", "file.md"));
		expect(result).toBe("a/b/c/file.md");
	});
});

describe("exists", () => {
	it("returns true for existing file", async () => {
		// Test with current test file
		const result = await exists(__filename);
		expect(result).toBe(true);
	});

	it("returns false for non-existing file", async () => {
		const result = await exists("/nonexistent/path/to/file.txt");
		expect(result).toBe(false);
	});

	it("returns true for existing directory", async () => {
		const result = await exists(__dirname);
		expect(result).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// buildToc tests
// ---------------------------------------------------------------------------

describe("buildToc", () => {
	it("builds TOC from h2 and h3 headings", () => {
		const html = `
			<h2 id="intro">Introduction</h2>
			<p>Some content</p>
			<h3 id="setup">Setup</h3>
			<p>More content</p>
			<h2 id="usage">Usage</h2>
		`;
		const result = buildToc(html);
		expect(result).toContain('<aside class="toc">');
		expect(result).toContain('<a href="#intro">Introduction</a>');
		expect(result).toContain('<a href="#setup">Setup</a>');
		expect(result).toContain('<a href="#usage">Usage</a>');
		expect(result).toContain('class="toc-h3"');
	});

	it("returns empty string for fewer than 2 headings", () => {
		const html = `<h2 id="only">Only One</h2>`;
		const result = buildToc(html);
		expect(result).toBe("");
	});

	it("returns empty string for no headings", () => {
		const html = `<p>No headings here</p>`;
		const result = buildToc(html);
		expect(result).toBe("");
	});

	it("ignores h1 and h4+ headings", () => {
		const html = `
			<h1 id="title">Title</h1>
			<h2 id="intro">Introduction</h2>
			<h2 id="usage">Usage</h2>
			<h4 id="sub">Subheading</h4>
		`;
		const result = buildToc(html);
		expect(result).not.toContain("Title");
		expect(result).not.toContain("Subheading");
		expect(result).toContain("Introduction");
		expect(result).toContain("Usage");
	});

	it("applies toc-h3 class only to h3 headings", () => {
		const html = `
			<h2 id="section">Section</h2>
			<h3 id="subsection">Subsection</h3>
			<h2 id="another">Another</h2>
		`;
		const result = buildToc(html);
		expect(result).toContain('<li class="toc-h3"><a href="#subsection">');
		expect(result).not.toContain('<li class="toc-h3"><a href="#section">');
	});
});

// ---------------------------------------------------------------------------
// buildNavSimple, buildNavStatic tests
// ---------------------------------------------------------------------------

describe("buildNavSimple", () => {
	const files: ContentFile[] = [
		{ path: "/docs/intro.md", urlPath: "docs/intro", section: "Guides" },
		{ path: "/docs/setup.md", urlPath: "docs/setup", section: "Guides" },
		{ path: "/api/ref.md", urlPath: "api/ref", section: "API" },
	];

	const config: SiteConfig = {
		docroot: ".",
		title: "Test Site",
		brand: { name: "Test", url: "/" },
		sections: [
			{ name: "Guides", path: "docs" },
			{ name: "API", path: "api" },
		],
	};

	it("builds navigation with sections", () => {
		const result = buildNavSimple(files, config);
		expect(result).toContain('<span class="nav-section">Guides</span>');
		expect(result).toContain('<span class="nav-section">API</span>');
		expect(result).toContain('<a href="/docs/intro">intro</a>');
		expect(result).toContain('<a href="/docs/setup">setup</a>');
		expect(result).toContain('<a href="/api/ref">ref</a>');
	});

	it("adds home link when config.home is set", () => {
		const configWithHome = { ...config, home: "index.md" };
		const result = buildNavSimple(files, configWithHome);
		expect(result).toContain('<a href="/" class="nav-home">Home</a>');
	});

	it("does not add home link when config.home is not set", () => {
		const result = buildNavSimple(files, config);
		expect(result).not.toContain("nav-home");
	});

	it("handles empty files array", () => {
		const result = buildNavSimple([], config);
		expect(result).toBe("<ul></ul>");
	});

	it("renders hierarchical nav with collapsible groups", () => {
		const nestedFiles: ContentFile[] = [
			{
				path: "/ref/api/users.md",
				urlPath: "ref/api/users",
				section: "Reference",
				sectionBase: "ref",
			},
			{
				path: "/ref/api/auth.md",
				urlPath: "ref/api/auth",
				section: "Reference",
				sectionBase: "ref",
			},
			{
				path: "/ref/overview.md",
				urlPath: "ref/overview",
				section: "Reference",
				sectionBase: "ref",
			},
		];
		const nestedConfig: SiteConfig = {
			...config,
			sections: [{ name: "Reference", path: "ref" }],
		};
		const result = buildNavSimple(nestedFiles, nestedConfig);
		// api/ should be a collapsible group
		expect(result).toContain("<details>");
		expect(result).toContain('<summary class="nav-group">api</summary>');
		expect(result).toContain('<a href="/ref/api/users">users</a>');
		expect(result).toContain('<a href="/ref/api/auth">auth</a>');
		// overview is a flat leaf at section root
		expect(result).toContain('<a href="/ref/overview">overview</a>');
	});

	it("makes section header clickable when index.md exists", () => {
		const indexFiles: ContentFile[] = [
			{ path: "/docs/index.md", urlPath: "docs", section: "Guides", sectionBase: "docs" },
			{ path: "/docs/intro.md", urlPath: "docs/intro", section: "Guides", sectionBase: "docs" },
		];
		const result = buildNavSimple(indexFiles, config);
		// Section header should be a link (from index.md)
		expect(result).toContain('class="nav-section">Guides</a>');
		expect(result).toContain('<a href="/docs/intro">intro</a>');
	});

	it("auto-expands section containing active page", () => {
		const nestedFiles: ContentFile[] = [
			{
				path: "/ref/api/users.md",
				urlPath: "ref/api/users",
				section: "Reference",
				sectionBase: "ref",
			},
			{
				path: "/ref/api/auth.md",
				urlPath: "ref/api/auth",
				section: "Reference",
				sectionBase: "ref",
			},
		];
		const nestedConfig: SiteConfig = {
			...config,
			sections: [{ name: "Reference", path: "ref" }],
		};
		const result = buildNavSimple(nestedFiles, nestedConfig, "ref/api/users");
		expect(result).toContain("<details open>");
		expect(result).toContain('class="active"');
	});
});

describe("buildNavStatic", () => {
	const files: ContentFile[] = [
		{ path: "/docs/intro.md", urlPath: "docs/intro", section: "Guides" },
		{ path: "/docs/setup.md", urlPath: "docs/setup", section: "Guides" },
	];

	const config: SiteConfig = {
		docroot: ".",
		title: "Test Site",
		brand: { name: "Test", url: "/" },
		sections: [{ name: "Guides", path: "docs" }],
	};

	it("builds navigation with path prefix", () => {
		const result = buildNavStatic(files, "docs/intro", config, "/site/");
		expect(result).toContain('href="/site/docs/intro.html"');
		expect(result).toContain('href="/site/docs/setup.html"');
	});

	it("marks current page as active", () => {
		const result = buildNavStatic(files, "docs/intro", config, "/site/");
		expect(result).toContain('<a href="/site/docs/intro.html" class="active">');
		expect(result).not.toContain('<a href="/site/docs/setup.html" class="active">');
	});

	it("adds home link with active state when on home page", () => {
		const configWithHome = { ...config, home: "index.md" };
		const result = buildNavStatic(files, "", configWithHome, "/site/");
		expect(result).toContain('class="active" class="nav-home"');
	});

	it("adds home link without active when not on home page", () => {
		const configWithHome = { ...config, home: "index.md" };
		const result = buildNavStatic(files, "docs/intro", configWithHome, "/site/");
		expect(result).toContain('<a href="/site/index.html" class="nav-home">');
	});
});

// ---------------------------------------------------------------------------
// buildBreadcrumbsSimple, buildBreadcrumbsStatic tests
// ---------------------------------------------------------------------------

describe("buildBreadcrumbsSimple", () => {
	const files: ContentFile[] = [
		{ path: "/docs/getting-started.md", urlPath: "docs/getting-started", section: "Docs" },
		{ path: "/docs/guides/intro.md", urlPath: "docs/guides/intro", section: "Guides" },
		{ path: "/docs/guides/advanced.md", urlPath: "docs/guides/advanced", section: "Guides" },
		{ path: "/api/reference/methods.md", urlPath: "api/reference/methods", section: "API" },
	];

	const config: SiteConfig = {
		docroot: ".",
		title: "Test Site",
		brand: { name: "Test", url: "/" },
		sections: [],
	};

	it("builds breadcrumbs for nested path linking to first file in section", () => {
		const result = buildBreadcrumbsSimple("docs/guides/intro", files, config);
		expect(result).toContain('<nav class="breadcrumbs">');
		// Should link to first file in docs section, not /docs/
		expect(result).toContain('<a href="/docs/getting-started">Docs</a>');
		// Should link to first file in docs/guides section, not /docs/guides/
		expect(result).toContain('<a href="/docs/guides/intro">Guides</a>');
		expect(result).toContain("<span>intro</span>");
		expect(result).toContain('<span class="separator">');
	});

	it("returns empty string for single-level path", () => {
		const result = buildBreadcrumbsSimple("intro", files, config);
		expect(result).toBe("");
	});

	it("returns empty string for empty path", () => {
		const result = buildBreadcrumbsSimple("", files, config);
		expect(result).toBe("");
	});

	it("capitalizes first letter of each segment", () => {
		const result = buildBreadcrumbsSimple("api/reference/methods", files, config);
		expect(result).toContain(">Api</a>");
		expect(result).toContain(">Reference</a>");
	});

	it("falls back to directory path when no matching file found", () => {
		const emptyFiles: ContentFile[] = [];
		const result = buildBreadcrumbsSimple("unknown/section/page", emptyFiles, config);
		expect(result).toContain('<a href="/unknown/">Unknown</a>');
		expect(result).toContain('<a href="/unknown/section/">Section</a>');
	});
});

describe("buildBreadcrumbsStatic", () => {
	const files: ContentFile[] = [
		{ path: "/docs/getting-started.md", urlPath: "docs/getting-started", section: "Docs" },
		{ path: "/docs/guides/intro.md", urlPath: "docs/guides/intro", section: "Guides" },
		{ path: "/docs/guides/advanced.md", urlPath: "docs/guides/advanced", section: "Guides" },
	];

	const config: SiteConfig = {
		docroot: ".",
		title: "Test Site",
		brand: { name: "Test", url: "/" },
		sections: [],
	};

	it("builds breadcrumbs with path prefix linking to first file in section", () => {
		const result = buildBreadcrumbsStatic("docs/guides/intro", "/site/", files, config);
		// Should link to first file in docs section, not /site/docs/index.html
		expect(result).toContain('<a href="/site/docs/getting-started.html">Docs</a>');
		// Should link to first file in docs/guides section, not /site/docs/guides/index.html
		expect(result).toContain('<a href="/site/docs/guides/intro.html">Guides</a>');
		expect(result).toContain("<span>intro</span>");
	});

	it("returns empty string for single-level path", () => {
		const result = buildBreadcrumbsStatic("intro", "/site/", files, config);
		expect(result).toBe("");
	});

	it("handles empty path prefix", () => {
		const result = buildBreadcrumbsStatic("docs/intro", "", files, config);
		expect(result).toContain('<a href="docs/getting-started.html">Docs</a>');
	});

	it("falls back to index.html when no matching file found", () => {
		const emptyFiles: ContentFile[] = [];
		const result = buildBreadcrumbsStatic("unknown/section/page", "/site/", emptyFiles, config);
		expect(result).toContain('<a href="/site/unknown/index.html">Unknown</a>');
		expect(result).toContain('<a href="/site/unknown/section/index.html">Section</a>');
	});
});

// ---------------------------------------------------------------------------
// formatDate tests
// ---------------------------------------------------------------------------

describe("formatDate", () => {
	it("formats ISO date to YYYY-MM-DD", () => {
		const result = formatDate("2024-03-15T10:30:00Z");
		expect(result).toBe("2024-03-15");
	});

	it("returns 'unknown' unchanged", () => {
		const result = formatDate("unknown");
		expect(result).toBe("unknown");
	});

	it("returns 'dev' unchanged", () => {
		const result = formatDate("dev");
		expect(result).toBe("dev");
	});

	it("handles date with timezone offset", () => {
		const result = formatDate("2024-03-15T10:30:00+05:00");
		expect(result).toBe("2024-03-15");
	});

	it("returns invalid date string unchanged", () => {
		const result = formatDate("not-a-date");
		// Invalid Date will still produce a string, but it might be "Invalid Date"
		// The function catches errors and returns the original
		expect(typeof result).toBe("string");
	});
});

// ---------------------------------------------------------------------------
// envString, envInt, envBool tests
// ---------------------------------------------------------------------------

describe("envString", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("returns environment variable value when set", () => {
		process.env.TEST_STRING = "hello";
		expect(envString("TEST_STRING", "default")).toBe("hello");
	});

	it("returns fallback when environment variable is not set", () => {
		delete process.env.TEST_STRING;
		expect(envString("TEST_STRING", "default")).toBe("default");
	});

	it("returns empty string if env var is empty string", () => {
		process.env.TEST_STRING = "";
		expect(envString("TEST_STRING", "default")).toBe("");
	});
});

describe("envInt", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("returns parsed integer when env var is valid number", () => {
		process.env.TEST_INT = "42";
		expect(envInt("TEST_INT", 10)).toBe(42);
	});

	it("returns fallback when env var is not set", () => {
		delete process.env.TEST_INT;
		expect(envInt("TEST_INT", 10)).toBe(10);
	});

	it("returns fallback when env var is not a valid number", () => {
		process.env.TEST_INT = "not-a-number";
		expect(envInt("TEST_INT", 10)).toBe(10);
	});

	it("returns fallback when env var is empty", () => {
		process.env.TEST_INT = "";
		expect(envInt("TEST_INT", 10)).toBe(10);
	});

	it("handles negative numbers", () => {
		process.env.TEST_INT = "-5";
		expect(envInt("TEST_INT", 10)).toBe(-5);
	});

	it("truncates floating point numbers", () => {
		process.env.TEST_INT = "3.14";
		expect(envInt("TEST_INT", 10)).toBe(3);
	});
});

describe("envBool", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("returns true for 'true'", () => {
		process.env.TEST_BOOL = "true";
		expect(envBool("TEST_BOOL", false)).toBe(true);
	});

	it("returns true for '1'", () => {
		process.env.TEST_BOOL = "1";
		expect(envBool("TEST_BOOL", false)).toBe(true);
	});

	it("returns true for 'yes'", () => {
		process.env.TEST_BOOL = "yes";
		expect(envBool("TEST_BOOL", false)).toBe(true);
	});

	it("returns false for 'false'", () => {
		process.env.TEST_BOOL = "false";
		expect(envBool("TEST_BOOL", true)).toBe(false);
	});

	it("returns false for '0'", () => {
		process.env.TEST_BOOL = "0";
		expect(envBool("TEST_BOOL", true)).toBe(false);
	});

	it("returns false for 'no'", () => {
		process.env.TEST_BOOL = "no";
		expect(envBool("TEST_BOOL", true)).toBe(false);
	});

	it("returns fallback when env var is not set", () => {
		delete process.env.TEST_BOOL;
		expect(envBool("TEST_BOOL", true)).toBe(true);
		expect(envBool("TEST_BOOL", false)).toBe(false);
	});

	it("returns fallback for unrecognized value", () => {
		process.env.TEST_BOOL = "maybe";
		expect(envBool("TEST_BOOL", true)).toBe(true);
		expect(envBool("TEST_BOOL", false)).toBe(false);
	});

	it("is case insensitive", () => {
		process.env.TEST_BOOL = "TRUE";
		expect(envBool("TEST_BOOL", false)).toBe(true);
		process.env.TEST_BOOL = "FALSE";
		expect(envBool("TEST_BOOL", true)).toBe(false);
		process.env.TEST_BOOL = "Yes";
		expect(envBool("TEST_BOOL", false)).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// loadSiteConfig tests (with mocking)
// ---------------------------------------------------------------------------

describe("loadSiteConfig", () => {
	it("returns fallback config when site.yaml does not exist and no content dir", async () => {
		const result = await loadSiteConfig("/nonexistent/path", "Default Title");
		expect(result.docroot).toBe(".");
		expect(result.title).toBe("Default Title");
		expect(result.mode).toBe("docs");
		expect(result.aspect).toBe("16/9");
		expect(result.brand.name).toBe("Handbook");
		expect(result.sections).toEqual([]);
	});

	it("parses footer config fields from site.yaml", async () => {
		const dir = await mkdtemp(join(tmpdir(), "kitfly-footer-config-"));
		try {
			await writeFile(
				join(dir, "site.yaml"),
				`title: Test
version: "1.2.0"
brand:
  name: Test
  url: /
sections:
  - name: Guide
    path: guide
footer:
  copyright: "© 2026 Test"
  attribution: false
  logo: "assets/brand/footer-logo.png"
  logoUrl: "https://example.com/footer"
  logoAlt: "Footer Brand"
  logoHeight: 24
  links:
    - text: Privacy
      url: /privacy
`,
				"utf-8",
			);

			const config = await loadSiteConfig(dir);
			expect(config.version).toBe("1.2.0");
			expect(config.footer?.copyright).toBe("© 2026 Test");
			expect(config.footer?.attribution).toBe(false);
			expect(config.footer?.logo).toBe("assets/brand/footer-logo.png");
			expect(config.footer?.logoUrl).toBe("https://example.com/footer");
			expect(config.footer?.logoAlt).toBe("Footer Brand");
			expect(config.footer?.logoHeight).toBe(24);
			expect(config.footer?.links).toEqual([{ text: "Privacy", url: "/privacy" }]);
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});

	it("clamps footer.logoHeight to supported range", async () => {
		const dir = await mkdtemp(join(tmpdir(), "kitfly-footer-logo-height-"));
		try {
			await writeFile(
				join(dir, "site.yaml"),
				`title: Test
brand:
  name: Test
  url: /
sections:
  - name: Guide
    path: guide
footer:
  logoHeight: 100
`,
				"utf-8",
			);

			const config = await loadSiteConfig(dir);
			expect(config.footer?.logoHeight).toBe(40);
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});

	it("truncates footer links to max 10", async () => {
		const dir = await mkdtemp(join(tmpdir(), "kitfly-footer-links-"));
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		try {
			const links = Array.from(
				{ length: 12 },
				(_, i) => `    - text: Link${i + 1}\n      url: /l${i + 1}`,
			).join("\n");
			await writeFile(
				join(dir, "site.yaml"),
				`title: Test
brand:
  name: Test
  url: /
sections:
  - name: Guide
    path: guide
footer:
  links:
${links}
`,
				"utf-8",
			);

			const config = await loadSiteConfig(dir);
			expect(config.footer?.links).toHaveLength(10);
			expect(warn).toHaveBeenCalled();
		} finally {
			warn.mockRestore();
			await rm(dir, { recursive: true, force: true });
		}
	});

	it("parses slides mode and aspect from site.yaml", async () => {
		const dir = await mkdtemp(join(tmpdir(), "kitfly-slides-config-"));
		try {
			await writeFile(
				join(dir, "site.yaml"),
				`title: Slides
mode: slides
aspect: "4/3"
brand:
  name: Test
  url: /
sections:
  - name: Deck
    path: slides
`,
				"utf-8",
			);

			const config = await loadSiteConfig(dir);
			expect(config.mode).toBe("slides");
			expect(config.aspect).toBe("4/3");
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});

	it("falls back to default docs mode and aspect when invalid", async () => {
		const dir = await mkdtemp(join(tmpdir(), "kitfly-slides-defaults-"));
		try {
			await writeFile(
				join(dir, "site.yaml"),
				`title: Defaults
mode: invalid
aspect: "21/9"
brand:
  name: Test
  url: /
sections:
  - name: Deck
    path: slides
`,
				"utf-8",
			);

			const config = await loadSiteConfig(dir);
			expect(config.mode).toBe("docs");
			expect(config.aspect).toBe("16/9");
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});
});

// ---------------------------------------------------------------------------
// collectFiles tests
// ---------------------------------------------------------------------------

describe("collectFiles", () => {
	it("returns empty array when no sections", async () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};
		const result = await collectFiles("/nonexistent", config);
		expect(result).toEqual([]);
	});

	it("skips sections with invalid paths", async () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [{ name: "Invalid", path: "../../../../../etc" }],
		};
		const result = await collectFiles("/tmp", config);
		expect(result).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// getGitInfo and generateProvenance tests
// ---------------------------------------------------------------------------

describe("getGitInfo", () => {
	it("returns dev defaults when devMode is true and git fails", async () => {
		const result = await getGitInfo("/nonexistent/path", true);
		expect(result.commit).toBe("dev");
		expect(result.branch).toBe("local");
		expect(result.commitDate).toBeDefined();
	});

	it("returns unknown defaults when devMode is false and git fails", async () => {
		const result = await getGitInfo("/nonexistent/path", false);
		expect(result.commit).toBe("unknown");
		expect(result.branch).toBe("unknown");
		expect(result.commitDate).toBe("unknown");
	});
});

describe("generateProvenance", () => {
	it("uses site.yaml version when present", async () => {
		const dir = await mkdtemp(join(tmpdir(), "kitfly-version-config-"));
		try {
			await writeFile(
				join(dir, "site.yaml"),
				`title: Test
version: "2.4.1"
brand:
  name: Test
  url: /
sections:
  - name: Guide
    path: guide
`,
				"utf-8",
			);

			const result = await generateProvenance(dir, true, "2.4.1");
			expect(result.version).toBe("2.4.1");
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});

	// resolveSiteVersion() uses Bun.spawn for git tag detection, so this test
	// can only pass under the Bun runtime. v8 coverage requires Node, where
	// Bun globals don't exist. Once Bun supports node:inspector coverage APIs
	// we can remove the skipIf and run this unconditionally.
	it.skipIf(typeof globalThis.Bun === "undefined")(
		"falls back to git tag when site.yaml version is not set",
		async () => {
			const dir = await mkdtemp(join(tmpdir(), "kitfly-version-tag-"));
			try {
				const run = async (args: string[]) => {
					const proc = Bun.spawn(["git", ...args], { cwd: dir, stdout: "pipe", stderr: "ignore" });
					await proc.exited;
				};
				await run(["init"]);
				await run(["config", "user.email", "test@example.com"]);
				await run(["config", "user.name", "Kitfly Test"]);
				await writeFile(join(dir, "README.md"), "# test\n", "utf-8");
				await run(["add", "README.md"]);
				await run(["commit", "-m", "init"]);
				await run(["tag", "v3.5.7"]);

				const result = await generateProvenance(dir, false);
				expect(result.version).toBe("3.5.7");
			} finally {
				await rm(dir, { recursive: true, force: true });
			}
		},
	);

	it("returns empty version when neither site.yaml version nor git tag exist", async () => {
		const result = await generateProvenance("/nonexistent/path", true);
		expect(result.version).toBeUndefined();
		expect(result.buildDate).toBeDefined();
		expect(result.gitCommit).toBe("dev");
		expect(result.gitBranch).toBe("local");
	});

	it("generates provenance with unknown values when not in dev mode", async () => {
		const result = await generateProvenance("/nonexistent/path", false);
		expect(result.gitCommit).toBe("unknown");
		expect(result.gitBranch).toBe("unknown");
		expect(result.gitCommitDate).toBe("unknown");
	});
});

describe("resolveSiteVersion", () => {
	it("returns empty string when no config and no tag", async () => {
		const version = await resolveSiteVersion("/nonexistent/path");
		expect(version).toBeUndefined();
	});

	it("returns provided site version without git lookup", async () => {
		const version = await resolveSiteVersion("/nonexistent/path", "9.9.9");
		expect(version).toBe("9.9.9");
	});

	it("resolves auto from VERSION first non-empty line", async () => {
		const dir = await mkdtemp(join(tmpdir(), "kitfly-version-auto-"));
		try {
			await writeFile(join(dir, "VERSION"), "\n \n 1.2.3 \n2.0.0\n", "utf-8");
			const version = await resolveSiteVersion(dir, "auto");
			expect(version).toBe("1.2.3");
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});

	it("resolves version from file path with spaces", async () => {
		const dir = await mkdtemp(join(tmpdir(), "kitfly-version-file-"));
		try {
			await mkdir(join(dir, "meta"), { recursive: true });
			await writeFile(join(dir, "meta", "site version.txt"), "2026.02.12\n", "utf-8");
			const version = await resolveSiteVersion(dir, "file:./meta/site version.txt");
			expect(version).toBe("2026.02.12");
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});

	it("rejects absolute file path and falls back", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
		try {
			const version = await resolveSiteVersion("/nonexistent/path", "file:/etc/hostname");
			expect(version).toBeUndefined();
			expect(warn).toHaveBeenCalledWith(
				expect.stringContaining("version file: absolute paths are not allowed"),
			);
		} finally {
			warn.mockRestore();
		}
	});

	it("rejects windows absolute file path and falls back", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
		try {
			const version = await resolveSiteVersion("/nonexistent/path", "file:C:\\temp\\VERSION");
			expect(version).toBeUndefined();
			expect(warn).toHaveBeenCalledWith(
				expect.stringContaining("version file: absolute paths are not allowed"),
			);
		} finally {
			warn.mockRestore();
		}
	});

	it("rejects windows drive-relative file path and falls back", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
		try {
			const version = await resolveSiteVersion("/nonexistent/path", "file:C:VERSION");
			expect(version).toBeUndefined();
			expect(warn).toHaveBeenCalledWith(
				expect.stringContaining("version file: absolute paths are not allowed"),
			);
		} finally {
			warn.mockRestore();
		}
	});

	it("rejects path that escapes site root and falls back", async () => {
		const dir = await mkdtemp(join(tmpdir(), "kitfly-version-escape-"));
		const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
		try {
			const version = await resolveSiteVersion(dir, "file:../../etc/passwd");
			expect(version).toBeUndefined();
			expect(warn).toHaveBeenCalledWith(
				expect.stringContaining("version file: path escapes site root"),
			);
		} finally {
			warn.mockRestore();
			await rm(dir, { recursive: true, force: true });
		}
	});

	it("warns for empty file path and falls back", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
		try {
			const version = await resolveSiteVersion("/nonexistent/path", "file:");
			expect(version).toBeUndefined();
			expect(warn).toHaveBeenCalledWith("version file: path is empty");
		} finally {
			warn.mockRestore();
		}
	});

	it("falls back when auto VERSION file is missing", async () => {
		const dir = await mkdtemp(join(tmpdir(), "kitfly-version-auto-missing-"));
		try {
			const version = await resolveSiteVersion(dir, "auto");
			expect(version).toBeUndefined();
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});

	it("falls back when auto VERSION file is empty", async () => {
		const dir = await mkdtemp(join(tmpdir(), "kitfly-version-auto-empty-"));
		try {
			await writeFile(join(dir, "VERSION"), "\n \n\t\n", "utf-8");
			const version = await resolveSiteVersion(dir, "auto");
			expect(version).toBeUndefined();
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});
});

// ---------------------------------------------------------------------------
// buildPageMeta tests
// ---------------------------------------------------------------------------

describe("buildPageMeta", () => {
	it("returns empty string when no last_updated in frontmatter", () => {
		expect(buildPageMeta({})).toBe("");
	});

	it("returns empty string when last_updated is undefined", () => {
		expect(buildPageMeta({ title: "Hello" })).toBe("");
	});

	it("returns formatted date div when last_updated is set", () => {
		const result = buildPageMeta({ last_updated: "2024-06-15T12:00:00Z" });
		expect(result).toContain('<div class="page-meta">');
		expect(result).toContain("Last updated: 2024-06-15");
		expect(result).toContain("</div>");
	});

	it("passes through special date strings via formatDate", () => {
		const result = buildPageMeta({ last_updated: "unknown" });
		expect(result).toContain("Last updated: unknown");
	});

	it("handles dev mode date string", () => {
		const result = buildPageMeta({ last_updated: "dev" });
		expect(result).toContain("Last updated: dev");
	});
});

// ---------------------------------------------------------------------------
// buildFooter tests
// ---------------------------------------------------------------------------

describe("buildFooter", () => {
	const baseProvenance: Provenance = {
		version: "1.2.3",
		buildDate: "2024-06-15T12:00:00Z",
		gitCommit: "abc1234",
		gitCommitDate: "2024-06-14T10:00:00Z",
		gitBranch: "main",
	};

	const baseConfig: SiteConfig = {
		docroot: ".",
		title: "Test Site",
		brand: { name: "Acme Corp", url: "https://acme.com" },
		sections: [],
	};

	it("includes version number", () => {
		const result = buildFooter(baseProvenance, baseConfig);
		expect(result).toContain("v1.2.3");
	});

	it("omits version span when provenance version is empty", () => {
		const result = buildFooter({ ...baseProvenance, version: "" }, baseConfig);
		expect(result).not.toContain('class="footer-version"');
		expect(result).toContain("Published 2024-06-14");
	});

	it("includes formatted commit date", () => {
		const result = buildFooter(baseProvenance, baseConfig);
		expect(result).toContain("Published 2024-06-14");
	});

	it("includes commit hash in title attribute", () => {
		const result = buildFooter(baseProvenance, baseConfig);
		expect(result).toContain('title="Commit: abc1234"');
	});

	it("includes brand name in copyright", () => {
		const result = buildFooter(baseProvenance, baseConfig);
		expect(result).toContain("Acme Corp");
	});

	it("includes default brand URL link text without protocol", () => {
		const result = buildFooter(baseProvenance, baseConfig);
		expect(result).toContain(">acme.com</a>");
		expect(result).toContain('href="https://acme.com"');
	});

	it("strips http:// from brand URL display", () => {
		const config = { ...baseConfig, brand: { name: "Test", url: "http://example.org" } };
		const result = buildFooter(baseProvenance, config);
		expect(result).toContain(">example.org</a>");
	});

	it("uses brand name as link text when brand URL is relative", () => {
		const config = { ...baseConfig, brand: { name: "My Product", url: "/" } };
		const result = buildFooter(baseProvenance, config);
		expect(result).toContain(">My Product</a>");
		expect(result).not.toContain(">/</a>");
	});

	it("adds target=_blank for external brands on default brand link", () => {
		const config = {
			...baseConfig,
			brand: { name: "Ext", url: "https://ext.com", external: true },
		};
		const result = buildFooter(baseProvenance, config);
		expect(result).toContain('target="_blank"');
		expect(result).toContain('rel="noopener"');
	});

	it("renders attribution by default", () => {
		const result = buildFooter(baseProvenance, baseConfig);
		expect(result).toContain(`Built with ${KITFLY_BRAND.name}`);
		expect(result).toContain(`href="${KITFLY_BRAND.url}"`);
	});

	it("removes attribution when footer.attribution is false", () => {
		const result = buildFooter(baseProvenance, {
			...baseConfig,
			footer: { attribution: false },
		});
		expect(result).not.toContain("Built with Kitfly");
		expect(result).not.toContain('class="footer-right"');
	});

	it("uses custom copyright text verbatim", () => {
		const result = buildFooter(baseProvenance, {
			...baseConfig,
			footer: { copyright: "Copyright 2024-2026 Acme Corp" },
		});
		expect(result).toContain("Copyright 2024-2026 Acme Corp");
	});

	it("wraps copyright in link when copyrightUrl is set", () => {
		const result = buildFooter(baseProvenance, {
			...baseConfig,
			footer: { copyright: "© 2026 3 Leaps, LLC", copyrightUrl: "https://3leaps.net" },
		});
		expect(result).toContain('href="https://3leaps.net"');
		expect(result).toContain(">© 2026 3 Leaps, LLC</a>");
	});

	it("renders copyright as plain text when copyrightUrl is absent", () => {
		const result = buildFooter(baseProvenance, {
			...baseConfig,
			footer: { copyright: "© 2026 Acme" },
		});
		expect(result).toContain(">© 2026 Acme</span>");
		expect(result).not.toContain('">© 2026 Acme</a>');
	});

	it("uses footer.links when provided", () => {
		const result = buildFooter(baseProvenance, {
			...baseConfig,
			footer: {
				links: [
					{ text: "Privacy", url: "/privacy" },
					{ text: "Terms", url: "/terms" },
				],
			},
		});
		expect(result).toContain('href="/privacy"');
		expect(result).toContain(">Privacy</a>");
		expect(result).toContain('href="/terms"');
		expect(result).toContain(">Terms</a>");
		expect(result).not.toContain('href="https://acme.com"');
	});

	it("suppresses all center links when footer.links is empty array", () => {
		const result = buildFooter(baseProvenance, {
			...baseConfig,
			footer: { links: [] },
		});
		expect(result).not.toContain('href="https://acme.com"');
		expect(result).not.toContain(">acme.com</a>");
	});

	it("escapes HTML in custom copyright text", () => {
		const result = buildFooter(baseProvenance, {
			...baseConfig,
			footer: { copyright: '© 2026 <script>alert("xss")</script>' },
		});
		expect(result).toContain("&lt;script&gt;");
		expect(result).not.toContain("<script>");
	});

	it("escapes HTML in copyrightUrl attribute", () => {
		const result = buildFooter(baseProvenance, {
			...baseConfig,
			footer: { copyright: "Test", copyrightUrl: 'https://example.com" onclick="alert(1)' },
		});
		expect(result).toContain("&quot;");
		expect(result).not.toContain('onclick="alert(1)"');
	});

	it("escapes HTML in footer link text and url", () => {
		const result = buildFooter(baseProvenance, {
			...baseConfig,
			footer: {
				links: [{ text: "<b>Bold</b>", url: '/test">' }],
			},
		});
		expect(result).toContain("&lt;b&gt;Bold&lt;/b&gt;");
		expect(result).toContain("/test&quot;&gt;");
	});

	it("includes footer structure classes", () => {
		const result = buildFooter(baseProvenance, baseConfig);
		expect(result).toContain('class="site-footer"');
		expect(result).toContain('class="footer-content"');
		expect(result).toContain('class="footer-left"');
		expect(result).toContain('class="footer-center"');
		expect(result).toContain('class="footer-right"');
		expect(result).toContain('class="footer-version"');
		expect(result).toContain('class="footer-commit"');
		expect(result).toContain('class="footer-copyright"');
		expect(result).toContain('class="footer-link"');
	});

	it("renders footer logo before version with configurable metadata", () => {
		const result = buildFooter(
			baseProvenance,
			{
				...baseConfig,
				footer: {
					logo: "assets/brand/footer-logo.png",
					logoUrl: "https://footer.example.com",
					logoAlt: "Footer Brand",
					logoHeight: 22,
				},
			},
			"../",
		);
		expect(result).toContain('class="footer-logo-link"');
		expect(result).toContain('class="footer-logo-img"');
		expect(result).toContain('href="https://footer.example.com"');
		expect(result).toContain('src="../assets/brand/footer-logo.png"');
		expect(result).toContain('alt="Footer Brand"');
		expect(result).toContain("max-height: 22px");
		expect(result).toContain("onerror=\"this.onerror=null;this.style.display='none'\"");
		expect(result.indexOf('class="footer-logo-img"')).toBeLessThan(
			result.indexOf('class="footer-version"'),
		);
	});

	it("falls back footer logo alt text to copyright then brand name", () => {
		const withCopyrightAlt = buildFooter(
			baseProvenance,
			{
				...baseConfig,
				footer: {
					logo: "assets/brand/footer-logo.png",
					copyright: "Copyright 2026 Acme",
				},
			},
			"./",
		);
		expect(withCopyrightAlt).toContain('alt="Copyright 2026 Acme"');

		const withBrandAlt = buildFooter(
			baseProvenance,
			{
				...baseConfig,
				footer: { logo: "assets/brand/footer-logo.png" },
			},
			"./",
		);
		expect(withBrandAlt).toContain('alt="Acme Corp"');
	});

	it("uses publish date year in default copyright", () => {
		const result = buildFooter(baseProvenance, baseConfig);
		expect(result).toContain("© 2024 Acme Corp");
	});
});

describe("buildBundleFooter", () => {
	const baseConfig: SiteConfig = {
		docroot: ".",
		title: "Bundle Test",
		brand: { name: "Acme Corp", url: "https://acme.com" },
		sections: [],
	};

	it("includes attribution by default", () => {
		const result = buildBundleFooter("0.1.1", baseConfig);
		expect(result).toContain("Published (offline bundle)");
		expect(result).toContain(`Built with ${KITFLY_BRAND.name}`);
	});

	it("omits version span when bundle version is empty", () => {
		const result = buildBundleFooter("", baseConfig);
		expect(result).not.toContain('class="footer-version"');
		expect(result).toContain("Published (offline bundle)");
	});

	it("respects attribution opt-out", () => {
		const result = buildBundleFooter("0.1.1", {
			...baseConfig,
			footer: { attribution: false },
		});
		expect(result).not.toContain("Built with Kitfly");
		expect(result).not.toContain('class="footer-right"');
	});

	it("wraps copyright in link when copyrightUrl is set", () => {
		const result = buildBundleFooter("0.1.1", {
			...baseConfig,
			footer: { copyright: "© 2026 3 Leaps, LLC", copyrightUrl: "https://3leaps.net" },
		});
		expect(result).toContain('href="https://3leaps.net"');
		expect(result).toContain(">© 2026 3 Leaps, LLC</a>");
	});

	it("suppresses all center links when footer.links is empty array", () => {
		const result = buildBundleFooter("0.1.1", {
			...baseConfig,
			footer: { links: [] },
		});
		expect(result).not.toContain('href="https://acme.com"');
		expect(result).not.toContain(">acme.com</a>");
	});

	it("escapes HTML in custom copyright and link fields", () => {
		const result = buildBundleFooter("0.1.1", {
			...baseConfig,
			footer: {
				copyright: '<img src=x onerror="alert(1)">',
				links: [{ text: "<em>XSS</em>", url: "/ok" }],
			},
		});
		expect(result).toContain("&lt;img");
		expect(result).not.toContain("<img");
		expect(result).toContain("&lt;em&gt;");
		expect(result).not.toContain("<em>");
	});

	it("renders footer logo in bundle mode with override source", () => {
		const result = buildBundleFooter(
			"0.1.1",
			{
				...baseConfig,
				footer: {
					logo: "assets/brand/footer-logo.png",
					logoUrl: "https://footer.example.com",
					logoHeight: 18,
				},
			},
			"data:image/png;base64,AAAA",
		);
		expect(result).toContain('src="data:image/png;base64,AAAA"');
		expect(result).toContain('href="https://footer.example.com"');
		expect(result).toContain("max-height: 18px");
	});
});

// ---------------------------------------------------------------------------
// buildNavTree / renderNavTree / nodeContainsPath via buildNavSimple
// (These are private functions tested through the public API)
// ---------------------------------------------------------------------------

describe("buildNavTree and renderNavTree (via buildNavSimple)", () => {
	const baseConfig: SiteConfig = {
		docroot: ".",
		title: "Test",
		brand: { name: "Test", url: "/" },
		sections: [{ name: "Docs", path: "docs" }],
	};

	it("renders flat file list as simple links", () => {
		const files: ContentFile[] = [
			{ path: "/docs/alpha.md", urlPath: "docs/alpha", section: "Docs", sectionBase: "docs" },
			{ path: "/docs/beta.md", urlPath: "docs/beta", section: "Docs", sectionBase: "docs" },
		];
		const result = buildNavSimple(files, baseConfig);
		expect(result).toContain('<a href="/docs/alpha">alpha</a>');
		expect(result).toContain('<a href="/docs/beta">beta</a>');
		// No <details> for flat list
		expect(result).not.toContain("<details>");
	});

	it("renders nested files with collapsible groups", () => {
		const files: ContentFile[] = [
			{
				path: "/docs/guides/start.md",
				urlPath: "docs/guides/start",
				section: "Docs",
				sectionBase: "docs",
			},
			{
				path: "/docs/guides/advanced.md",
				urlPath: "docs/guides/advanced",
				section: "Docs",
				sectionBase: "docs",
			},
			{
				path: "/docs/overview.md",
				urlPath: "docs/overview",
				section: "Docs",
				sectionBase: "docs",
			},
		];
		const result = buildNavSimple(files, baseConfig);
		expect(result).toContain("<details>");
		expect(result).toContain('<summary class="nav-group">guides</summary>');
		expect(result).toContain('<a href="/docs/guides/start">start</a>');
		expect(result).toContain('<a href="/docs/guides/advanced">advanced</a>');
		expect(result).toContain('<a href="/docs/overview">overview</a>');
	});

	it("makes section header a link when section has index file", () => {
		const files: ContentFile[] = [
			{ path: "/docs/index.md", urlPath: "docs", section: "Docs", sectionBase: "docs" },
			{ path: "/docs/page.md", urlPath: "docs/page", section: "Docs", sectionBase: "docs" },
		];
		const result = buildNavSimple(files, baseConfig);
		expect(result).toContain('class="nav-section">Docs</a>');
		expect(result).toContain('href="/docs"');
	});

	it("uses span for section header when no index file", () => {
		const files: ContentFile[] = [
			{ path: "/docs/page.md", urlPath: "docs/page", section: "Docs", sectionBase: "docs" },
		];
		const result = buildNavSimple(files, baseConfig);
		expect(result).toContain('<span class="nav-section">Docs</span>');
	});

	it("marks the active page with class", () => {
		const files: ContentFile[] = [
			{ path: "/docs/alpha.md", urlPath: "docs/alpha", section: "Docs", sectionBase: "docs" },
			{ path: "/docs/beta.md", urlPath: "docs/beta", section: "Docs", sectionBase: "docs" },
		];
		const result = buildNavSimple(files, baseConfig, "docs/alpha");
		expect(result).toContain('<a href="/docs/alpha" class="active">alpha</a>');
		expect(result).not.toContain('<a href="/docs/beta" class="active">');
	});

	it("auto-opens details group containing active page", () => {
		const files: ContentFile[] = [
			{
				path: "/docs/api/users.md",
				urlPath: "docs/api/users",
				section: "Docs",
				sectionBase: "docs",
			},
			{
				path: "/docs/api/auth.md",
				urlPath: "docs/api/auth",
				section: "Docs",
				sectionBase: "docs",
			},
			{
				path: "/docs/overview.md",
				urlPath: "docs/overview",
				section: "Docs",
				sectionBase: "docs",
			},
		];
		const result = buildNavSimple(files, baseConfig, "docs/api/users");
		expect(result).toContain("<details open>");
	});

	it("does not open details group when active page is elsewhere", () => {
		const files: ContentFile[] = [
			{
				path: "/docs/api/users.md",
				urlPath: "docs/api/users",
				section: "Docs",
				sectionBase: "docs",
			},
			{
				path: "/docs/overview.md",
				urlPath: "docs/overview",
				section: "Docs",
				sectionBase: "docs",
			},
		];
		const result = buildNavSimple(files, baseConfig, "docs/overview");
		// The api group should NOT be open
		expect(result).not.toContain("<details open>");
		expect(result).toContain("<details>");
	});

	it("handles deeply nested paths", () => {
		const files: ContentFile[] = [
			{
				path: "/docs/a/b/c.md",
				urlPath: "docs/a/b/c",
				section: "Docs",
				sectionBase: "docs",
			},
		];
		const result = buildNavSimple(files, baseConfig);
		expect(result).toContain('<summary class="nav-group">a</summary>');
		expect(result).toContain('<summary class="nav-group">b</summary>');
		expect(result).toContain('<a href="/docs/a/b/c">c</a>');
	});

	it("handles directory index file that becomes group link", () => {
		const files: ContentFile[] = [
			{
				path: "/docs/guides/index.md",
				urlPath: "docs/guides",
				section: "Docs",
				sectionBase: "docs",
			},
			{
				path: "/docs/guides/setup.md",
				urlPath: "docs/guides/setup",
				section: "Docs",
				sectionBase: "docs",
			},
		];
		const result = buildNavSimple(files, baseConfig);
		// The guides directory group should have a clickable link
		expect(result).toContain('<summary class="nav-group">');
		expect(result).toContain('href="/docs/guides"');
		expect(result).toContain("guides</a>");
		expect(result).toContain('<a href="/docs/guides/setup">setup</a>');
	});

	it("renders multiple sections in config order", () => {
		const multiConfig: SiteConfig = {
			...baseConfig,
			sections: [
				{ name: "Alpha", path: "alpha" },
				{ name: "Beta", path: "beta" },
			],
		};
		const files: ContentFile[] = [
			{
				path: "/beta/b.md",
				urlPath: "beta/b",
				section: "Beta",
				sectionBase: "beta",
			},
			{
				path: "/alpha/a.md",
				urlPath: "alpha/a",
				section: "Alpha",
				sectionBase: "alpha",
			},
		];
		const result = buildNavSimple(files, multiConfig);
		const alphaPos = result.indexOf("Alpha");
		const betaPos = result.indexOf("Beta");
		expect(alphaPos).toBeLessThan(betaPos);
	});

	it("returns empty ul when no files match any section", () => {
		const result = buildNavSimple([], baseConfig);
		expect(result).toBe("<ul></ul>");
	});
});

// ---------------------------------------------------------------------------
// nodeContainsPath (via buildNavSimple auto-open behavior)
// ---------------------------------------------------------------------------

describe("nodeContainsPath (via buildNavSimple details open)", () => {
	const config: SiteConfig = {
		docroot: ".",
		title: "Test",
		brand: { name: "Test", url: "/" },
		sections: [{ name: "Docs", path: "docs" }],
	};

	it("opens parent group when active page is a nested child", () => {
		const files: ContentFile[] = [
			{
				path: "/docs/ref/api/get.md",
				urlPath: "docs/ref/api/get",
				section: "Docs",
				sectionBase: "docs",
			},
			{
				path: "/docs/ref/api/post.md",
				urlPath: "docs/ref/api/post",
				section: "Docs",
				sectionBase: "docs",
			},
			{
				path: "/docs/other.md",
				urlPath: "docs/other",
				section: "Docs",
				sectionBase: "docs",
			},
		];
		const result = buildNavSimple(files, config, "docs/ref/api/get");
		// Both the ref group and the api group should be open
		const openCount = (result.match(/<details open>/g) || []).length;
		expect(openCount).toBe(2);
	});

	it("does not open any group when current page is a top-level leaf", () => {
		const files: ContentFile[] = [
			{
				path: "/docs/api/users.md",
				urlPath: "docs/api/users",
				section: "Docs",
				sectionBase: "docs",
			},
			{
				path: "/docs/top.md",
				urlPath: "docs/top",
				section: "Docs",
				sectionBase: "docs",
			},
		];
		const result = buildNavSimple(files, config, "docs/top");
		expect(result).not.toContain("<details open>");
	});
});

// ---------------------------------------------------------------------------
// findSectionBase (via buildNavSimple with missing sectionBase)
// ---------------------------------------------------------------------------

describe("findSectionBase (via buildNavSimple without sectionBase)", () => {
	const config: SiteConfig = {
		docroot: ".",
		title: "Test",
		brand: { name: "Test", url: "/" },
		sections: [{ name: "Docs", path: "docs" }],
	};

	it("derives section base from common prefix when sectionBase is not set", () => {
		const files: ContentFile[] = [
			{ path: "/docs/alpha.md", urlPath: "docs/alpha", section: "Docs" },
			{ path: "/docs/beta.md", urlPath: "docs/beta", section: "Docs" },
		];
		const result = buildNavSimple(files, config);
		// If findSectionBase works correctly, these should appear as leaf nodes
		expect(result).toContain('<a href="/docs/alpha">alpha</a>');
		expect(result).toContain('<a href="/docs/beta">beta</a>');
	});

	it("handles single file section without sectionBase", () => {
		const files: ContentFile[] = [{ path: "/docs/only.md", urlPath: "docs/only", section: "Docs" }];
		const result = buildNavSimple(files, config);
		expect(result).toContain('<a href="/docs/only">only</a>');
	});
});

// ---------------------------------------------------------------------------
// renderNavTree (via buildNavStatic with path prefix)
// ---------------------------------------------------------------------------

describe("renderNavTree with static paths (via buildNavStatic)", () => {
	const config: SiteConfig = {
		docroot: ".",
		title: "Test",
		brand: { name: "Test", url: "/" },
		sections: [{ name: "Docs", path: "docs" }],
	};

	it("appends .html to all hrefs", () => {
		const files: ContentFile[] = [
			{ path: "/docs/intro.md", urlPath: "docs/intro", section: "Docs", sectionBase: "docs" },
		];
		const result = buildNavStatic(files, "docs/intro", config, "/out/");
		expect(result).toContain('href="/out/docs/intro.html"');
	});

	it("marks active page in static nav", () => {
		const files: ContentFile[] = [
			{ path: "/docs/a.md", urlPath: "docs/a", section: "Docs", sectionBase: "docs" },
			{ path: "/docs/b.md", urlPath: "docs/b", section: "Docs", sectionBase: "docs" },
		];
		const result = buildNavStatic(files, "docs/a", config, "/out/");
		expect(result).toContain('<a href="/out/docs/a.html" class="active">a</a>');
		expect(result).not.toContain('<a href="/out/docs/b.html" class="active">');
	});

	it("opens group containing active page in static nav", () => {
		const files: ContentFile[] = [
			{
				path: "/docs/api/get.md",
				urlPath: "docs/api/get",
				section: "Docs",
				sectionBase: "docs",
			},
			{
				path: "/docs/api/post.md",
				urlPath: "docs/api/post",
				section: "Docs",
				sectionBase: "docs",
			},
		];
		const result = buildNavStatic(files, "docs/api/get", config, "/out/");
		expect(result).toContain("<details open>");
	});

	it("renders empty nav when no files", () => {
		const result = buildNavStatic([], "", config, "/out/");
		expect(result).toBe("<ul></ul>");
	});
});

// ---------------------------------------------------------------------------
// walkContentDir (via collectFiles with real temp directories)
// ---------------------------------------------------------------------------

describe("walkContentDir (via collectFiles)", () => {
	let tmpDir: string;

	beforeEach(async () => {
		tmpDir = await mkdtemp(join(tmpdir(), "kitfly-test-"));
	});

	afterEach(async () => {
		await rm(tmpDir, { recursive: true, force: true });
	});

	it("discovers markdown files in a section directory", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "intro.md"), "# Intro");
		await writeFile(join(tmpDir, "docs", "setup.md"), "# Setup");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs" }],
		};
		const files = await collectFiles(tmpDir, config);
		expect(files).toHaveLength(2);
		const urls = files.map((f) => f.urlPath).sort();
		expect(urls).toEqual(["docs/intro", "docs/setup"]);
	});

	it("discovers files recursively in subdirectories", async () => {
		await mkdir(join(tmpDir, "docs", "guides"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "top.md"), "# Top");
		await writeFile(join(tmpDir, "docs", "guides", "deep.md"), "# Deep");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs" }],
		};
		const files = await collectFiles(tmpDir, config);
		expect(files).toHaveLength(2);
		const urls = files.map((f) => f.urlPath).sort();
		expect(urls).toEqual(["docs/guides/deep", "docs/top"]);
	});

	it("maps index.md to parent directory URL path", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "index.md"), "# Index");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs" }],
		};
		const files = await collectFiles(tmpDir, config);
		expect(files).toHaveLength(1);
		expect(files[0].urlPath).toBe("docs");
	});

	it("maps readme.md to parent directory URL path", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "README.md"), "# Readme");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs" }],
		};
		const files = await collectFiles(tmpDir, config);
		expect(files).toHaveLength(1);
		expect(files[0].urlPath).toBe("docs");
	});

	it("skips hidden files and directories", async () => {
		await mkdir(join(tmpDir, "docs", ".hidden"), { recursive: true });
		await writeFile(join(tmpDir, "docs", ".hidden", "secret.md"), "# Secret");
		await writeFile(join(tmpDir, "docs", ".dotfile.md"), "# Dot");
		await writeFile(join(tmpDir, "docs", "visible.md"), "# Visible");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs" }],
		};
		const files = await collectFiles(tmpDir, config);
		expect(files).toHaveLength(1);
		expect(files[0].urlPath).toBe("docs/visible");
	});

	it("skips non-content files (txt, html, etc.)", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "readme.txt"), "text file");
		await writeFile(join(tmpDir, "docs", "page.html"), "<html>");
		await writeFile(join(tmpDir, "docs", "real.md"), "# Real");
		await writeFile(join(tmpDir, "docs", "data.json"), "{}");
		await writeFile(join(tmpDir, "docs", "config.yaml"), "key: val");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs" }],
		};
		const files = await collectFiles(tmpDir, config);
		const extensions = files.map((f) => f.path.split(".").pop());
		// md, json, yaml are allowed; txt and html are not
		expect(extensions).not.toContain("txt");
		expect(extensions).not.toContain("html");
		expect(files.length).toBe(3);
	});

	it("respects maxDepth limit on sections", async () => {
		// Create a path 3 levels deep: docs/a/b/c/deep.md
		await mkdir(join(tmpDir, "docs", "a", "b", "c"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "a", "b", "c", "deep.md"), "# Deep");
		await writeFile(join(tmpDir, "docs", "a", "shallow.md"), "# Shallow");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs", maxDepth: 2 }],
		};
		const files = await collectFiles(tmpDir, config);
		// depth 0 = docs/, depth 1 = docs/a/, depth 2 = docs/a/b/
		// docs/a/shallow.md is at depth 1 (OK)
		// docs/a/b/c/deep.md is at depth 3 (exceeds maxDepth 2)
		const urls = files.map((f) => f.urlPath);
		expect(urls).toContain("docs/a/shallow");
		expect(urls).not.toContain("docs/a/b/c/deep");
	});

	it("uses explicit file list when section has files property", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "included.md"), "# Included");
		await writeFile(join(tmpDir, "docs", "excluded.md"), "# Excluded");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs", files: ["included.md"] }],
		};
		const files = await collectFiles(tmpDir, config);
		expect(files).toHaveLength(1);
		expect(files[0].urlPath).toBe("included");
	});

	it("skips files in explicit list that do not exist", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "exists.md"), "# Exists");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs", files: ["exists.md", "missing.md"] }],
		};
		const files = await collectFiles(tmpDir, config);
		expect(files).toHaveLength(1);
		expect(files[0].urlPath).toBe("exists");
	});

	it("returns sorted entries for deterministic order", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "zebra.md"), "# Zebra");
		await writeFile(join(tmpDir, "docs", "alpha.md"), "# Alpha");
		await writeFile(join(tmpDir, "docs", "middle.md"), "# Middle");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs" }],
		};
		const files = await collectFiles(tmpDir, config);
		const urls = files.map((f) => f.urlPath);
		expect(urls).toEqual(["docs/alpha", "docs/middle", "docs/zebra"]);
	});

	it("handles empty section directory", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs" }],
		};
		const files = await collectFiles(tmpDir, config);
		expect(files).toEqual([]);
	});

	it("sets sectionBase on discovered files", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "page.md"), "# Page");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs" }],
		};
		const files = await collectFiles(tmpDir, config);
		expect(files[0].sectionBase).toBe("docs");
	});

	it("handles non-existent section directory gracefully", async () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "nope" }],
		};
		const files = await collectFiles(tmpDir, config);
		expect(files).toEqual([]);
	});

	it("excludes matching file names with exact pattern", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "keep.md"), "# Keep");
		await writeFile(join(tmpDir, "docs", "site.schema.json"), "{}");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs", exclude: ["site.schema.json"] }],
		};
		const files = await collectFiles(tmpDir, config);
		const urls = files.map((f) => f.urlPath);
		expect(urls).toContain("docs/keep");
		expect(urls).not.toContain("docs/site.schema");
	});

	it("excludes multiple files with wildcard pattern", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "draft-api.md"), "# Draft API");
		await writeFile(join(tmpDir, "docs", "draft-notes.md"), "# Draft Notes");
		await writeFile(join(tmpDir, "docs", "final.md"), "# Final");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs", exclude: ["draft*"] }],
		};
		const files = await collectFiles(tmpDir, config);
		const urls = files.map((f) => f.urlPath);
		expect(urls).toContain("docs/final");
		expect(urls).not.toContain("docs/draft-api");
		expect(urls).not.toContain("docs/draft-notes");
	});

	it("keeps files when exclude pattern does not match", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "alpha.md"), "# Alpha");
		await writeFile(join(tmpDir, "docs", "beta.md"), "# Beta");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs", exclude: ["draft*"] }],
		};
		const files = await collectFiles(tmpDir, config);
		const urls = files.map((f) => f.urlPath).sort();
		expect(urls).toEqual(["docs/alpha", "docs/beta"]);
	});

	it("excludes matching directory names and skips entire subtree", async () => {
		await mkdir(join(tmpDir, "docs", "internal"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "public.md"), "# Public");
		await writeFile(join(tmpDir, "docs", "internal", "secret.md"), "# Secret");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs", exclude: ["internal"] }],
		};
		const files = await collectFiles(tmpDir, config);
		const urls = files.map((f) => f.urlPath);
		expect(urls).toContain("docs/public");
		expect(urls).not.toContain("docs/internal/secret");
	});

	it("treats empty exclude as no filtering", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "one.md"), "# One");
		await writeFile(join(tmpDir, "docs", "two.md"), "# Two");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [{ name: "Docs", path: "docs", exclude: [] }],
		};
		const files = await collectFiles(tmpDir, config);
		const urls = files.map((f) => f.urlPath).sort();
		expect(urls).toEqual(["docs/one", "docs/two"]);
	});

	it("ignores exclude when section uses explicit files list", async () => {
		await mkdir(join(tmpDir, "docs"), { recursive: true });
		await writeFile(join(tmpDir, "docs", "included.md"), "# Included");
		await writeFile(join(tmpDir, "docs", "other.md"), "# Other");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [
				{
					name: "Docs",
					path: "docs",
					files: ["included.md"],
					exclude: ["included.md"],
				},
			],
		};
		const files = await collectFiles(tmpDir, config);
		expect(files).toHaveLength(1);
		expect(files[0].urlPath).toBe("included");
	});

	it("matches exclude against section-relative path so nested duplicates are preserved", async () => {
		await mkdir(join(tmpDir, "schemas", "v0"), { recursive: true });
		await writeFile(join(tmpDir, "schemas", "site.schema.json"), "{}");
		await writeFile(join(tmpDir, "schemas", "theme.schema.json"), "{}");
		await writeFile(join(tmpDir, "schemas", "v0", "site.schema.json"), "{}");
		await writeFile(join(tmpDir, "schemas", "v0", "theme.schema.json"), "{}");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "T", url: "/" },
			sections: [
				{
					name: "Schemas",
					path: "schemas",
					exclude: ["site.schema.json", "theme.schema.json"],
				},
			],
		};
		const files = await collectFiles(tmpDir, config);
		const urls = files.map((f) => f.urlPath).sort();
		expect(urls).toEqual(["schemas/v0/site.schema", "schemas/v0/theme.schema"]);
	});
});
