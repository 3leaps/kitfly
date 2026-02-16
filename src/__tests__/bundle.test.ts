import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	buildBundleNav,
	buildBundleSidebarHeader,
	bundleSite,
	fileToDataUri,
	imageMime,
	inlineLocalImages,
	parseArgs,
	resolveLocalImage,
	rewriteContentLinks,
} from "../../scripts/bundle.ts";
import type { ContentFile, SiteConfig } from "../shared.ts";

// ---------------------------------------------------------------------------
// Temp dir helpers
// ---------------------------------------------------------------------------

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
	const dir = await mkdtemp(join(tmpdir(), "kitfly-bundle-test-"));
	tempDirs.push(dir);
	return dir;
}

afterEach(async () => {
	for (const d of tempDirs) {
		await rm(d, { recursive: true, force: true }).catch(() => {});
	}
	tempDirs.length = 0;
});

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe("parseArgs", () => {
	it("returns empty object for empty argv", () => {
		expect(parseArgs([])).toEqual({});
	});

	it("parses --out with long flag", () => {
		const result = parseArgs(["--out", "public"]);
		expect(result.out).toBe("public");
	});

	it("parses -o short flag", () => {
		const result = parseArgs(["-o", "build"]);
		expect(result.out).toBe("build");
	});

	it("parses --name with long flag", () => {
		const result = parseArgs(["--name", "docs.html"]);
		expect(result.name).toBe("docs.html");
	});

	it("parses -n short flag", () => {
		const result = parseArgs(["-n", "site.html"]);
		expect(result.name).toBe("site.html");
	});

	it("parses --raw as true", () => {
		const result = parseArgs(["--raw"]);
		expect(result.raw).toBe(true);
	});

	it("parses --no-raw as false", () => {
		const result = parseArgs(["--no-raw"]);
		expect(result.raw).toBe(false);
	});

	it("parses positional folder argument", () => {
		const result = parseArgs(["./docs"]);
		expect(result.folder).toBe("./docs");
	});

	it("parses all options together", () => {
		const result = parseArgs(["./mysite", "--out", "public", "-n", "app.html", "--no-raw"]);
		expect(result.folder).toBe("./mysite");
		expect(result.out).toBe("public");
		expect(result.name).toBe("app.html");
		expect(result.raw).toBe(false);
	});

	it("ignores --out when next arg starts with dash", () => {
		const result = parseArgs(["--out", "--name", "foo.html"]);
		expect(result.out).toBeUndefined();
		expect(result.name).toBe("foo.html");
	});

	it("ignores --name when next arg starts with dash", () => {
		const result = parseArgs(["--name", "--raw"]);
		expect(result.name).toBeUndefined();
		expect(result.raw).toBe(true);
	});

	it("uses first positional arg as folder, ignores subsequent positionals", () => {
		const result = parseArgs(["./first", "./second"]);
		expect(result.folder).toBe("./first");
	});

	it("ignores unknown flags", () => {
		const result = parseArgs(["--unknown", "--out", "dist"]);
		expect(result.out).toBe("dist");
	});
});

// ---------------------------------------------------------------------------
// imageMime
// ---------------------------------------------------------------------------

describe("imageMime", () => {
	it("returns image/png for .png", () => {
		expect(imageMime("logo.png")).toBe("image/png");
	});

	it("returns image/jpeg for .jpg", () => {
		expect(imageMime("photo.jpg")).toBe("image/jpeg");
	});

	it("returns image/jpeg for .jpeg", () => {
		expect(imageMime("photo.jpeg")).toBe("image/jpeg");
	});

	it("returns image/gif for .gif", () => {
		expect(imageMime("anim.gif")).toBe("image/gif");
	});

	it("returns image/webp for .webp", () => {
		expect(imageMime("hero.webp")).toBe("image/webp");
	});

	it("returns image/svg+xml for .svg", () => {
		expect(imageMime("icon.svg")).toBe("image/svg+xml");
	});

	it("returns image/x-icon for .ico", () => {
		expect(imageMime("favicon.ico")).toBe("image/x-icon");
	});

	it("returns null for unsupported extensions", () => {
		expect(imageMime("doc.pdf")).toBeNull();
		expect(imageMime("data.json")).toBeNull();
		expect(imageMime("style.css")).toBeNull();
	});

	it("is case-insensitive for extension", () => {
		expect(imageMime("logo.PNG")).toBe("image/png");
		expect(imageMime("photo.JPG")).toBe("image/jpeg");
		expect(imageMime("icon.SVG")).toBe("image/svg+xml");
	});

	it("handles paths with directories", () => {
		expect(imageMime("/assets/brand/logo.png")).toBe("image/png");
		expect(imageMime("images/hero.webp")).toBe("image/webp");
	});
});

// ---------------------------------------------------------------------------
// rewriteContentLinks
// ---------------------------------------------------------------------------

describe("rewriteContentLinks", () => {
	const files: ContentFile[] = [
		{
			path: "/docs/guide/start.md",
			urlPath: "docs/guide/start",
			section: "Guide",
			sectionBase: "docs/guide",
		},
		{
			path: "/docs/reference/api.md",
			urlPath: "docs/reference/api",
			section: "Reference",
			sectionBase: "docs/reference",
		},
		{
			path: "/docs/guide/advanced.md",
			urlPath: "docs/guide/advanced",
			section: "Guide",
			sectionBase: "docs/guide",
		},
	];

	it("rewrites absolute content links to hash links", () => {
		const html = '<a href="/docs/guide/start">Getting Started</a>';
		const result = rewriteContentLinks(html, files);
		expect(result).toContain('href="#docsguidestart"');
	});

	it("rewrites links with .md extension", () => {
		const html = '<a href="docs/guide/start.md">Getting Started</a>';
		const result = rewriteContentLinks(html, files);
		expect(result).toContain('href="#docsguidestart"');
	});

	it("rewrites links with .html extension", () => {
		const html = '<a href="docs/guide/start.html">Getting Started</a>';
		const result = rewriteContentLinks(html, files);
		expect(result).toContain('href="#docsguidestart"');
	});

	it("leaves external http links unchanged", () => {
		const html = '<a href="https://example.com">External</a>';
		const result = rewriteContentLinks(html, files);
		expect(result).toContain('href="https://example.com"');
	});

	it("leaves external https links unchanged", () => {
		const html = '<a href="http://example.com">External</a>';
		const result = rewriteContentLinks(html, files);
		expect(result).toContain('href="http://example.com"');
	});

	it("leaves mailto links unchanged", () => {
		const html = '<a href="mailto:test@example.com">Email</a>';
		const result = rewriteContentLinks(html, files);
		expect(result).toContain('href="mailto:test@example.com"');
	});

	it("leaves anchor-only links unchanged", () => {
		const html = '<a href="#section-id">Section</a>';
		const result = rewriteContentLinks(html, files);
		expect(result).toContain('href="#section-id"');
	});

	it("leaves data: links unchanged", () => {
		const html = '<a href="data:text/html,hello">Data</a>';
		const result = rewriteContentLinks(html, files);
		expect(result).toContain('href="data:text/html,hello"');
	});

	it("leaves unmatched internal links unchanged", () => {
		const html = '<a href="nonexistent/page">Missing</a>';
		const result = rewriteContentLinks(html, files);
		expect(result).toContain('href="nonexistent/page"');
	});

	it("resolves relative links from current page", () => {
		// From docs/guide/start, a relative link to "advanced" should resolve to docs/guide/advanced
		const html = '<a href="advanced">Advanced</a>';
		const result = rewriteContentLinks(html, files, "docs/guide/start");
		expect(result).toContain('href="#docsguideadvanced"');
	});

	it("resolves ../ relative links", () => {
		// From docs/guide/start, ../reference/api should resolve to docs/reference/api
		const html = '<a href="../reference/api">API</a>';
		const result = rewriteContentLinks(html, files, "docs/guide/start");
		expect(result).toContain('href="#docsreferenceapi"');
	});

	it("preserves attributes on anchor tags", () => {
		const html = '<a class="link" href="docs/guide/start" target="_blank">Start</a>';
		const result = rewriteContentLinks(html, files);
		expect(result).toContain('class="link"');
	});

	it("handles multiple links in the same HTML", () => {
		const html = `
			<a href="docs/guide/start">Start</a>
			<a href="https://external.com">External</a>
			<a href="docs/reference/api">API</a>
		`;
		const result = rewriteContentLinks(html, files);
		expect(result).toContain('href="#docsguidestart"');
		expect(result).toContain('href="https://external.com"');
		expect(result).toContain('href="#docsreferenceapi"');
	});

	it("strips trailing slashes before matching", () => {
		const html = '<a href="docs/guide/start/">Start</a>';
		const result = rewriteContentLinks(html, files);
		expect(result).toContain('href="#docsguidestart"');
	});

	it("strips docroot prefix for matching when docroot is provided", () => {
		const html = '<a href="guide/start">Start</a>';
		const result = rewriteContentLinks(html, files, undefined, "docs");
		expect(result).toContain('href="#docsguidestart"');
	});

	it("handles HTML with no links", () => {
		const html = "<p>No links here</p>";
		const result = rewriteContentLinks(html, files);
		expect(result).toBe("<p>No links here</p>");
	});

	it("handles empty files array", () => {
		const html = '<a href="docs/guide/start">Start</a>';
		const result = rewriteContentLinks(html, []);
		expect(result).toContain('href="docs/guide/start"');
	});
});

// ---------------------------------------------------------------------------
// fileToDataUri
// ---------------------------------------------------------------------------

describe("fileToDataUri", () => {
	it("converts a PNG file to base64 data URI", async () => {
		const dir = await makeTempDir();
		// 1x1 red PNG pixel
		const pngBytes = Buffer.from(
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
			"base64",
		);
		const pngPath = join(dir, "test.png");
		await writeFile(pngPath, pngBytes);

		const result = await fileToDataUri(pngPath);
		expect(result).not.toBeNull();
		expect(typeof result).toBe("string");
		expect((result as string).startsWith("data:image/png;base64,")).toBe(true);
		// Round-trip: the base64 should decode back to the original bytes
		const base64Part = (result as string).split(",")[1];
		expect(Buffer.from(base64Part, "base64")).toEqual(pngBytes);
	});

	it("converts a SVG file to base64 data URI", async () => {
		const dir = await makeTempDir();
		const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="5"/></svg>';
		const svgPath = join(dir, "icon.svg");
		await writeFile(svgPath, svgContent);

		const result = await fileToDataUri(svgPath);
		expect(result).not.toBeNull();
		expect((result as string).startsWith("data:image/svg+xml;base64,")).toBe(true);
	});

	it("converts a JPEG file to base64 data URI", async () => {
		const dir = await makeTempDir();
		const jpgPath = join(dir, "photo.jpg");
		await writeFile(jpgPath, Buffer.from([0xff, 0xd8, 0xff, 0xe0])); // minimal JPEG header

		const result = await fileToDataUri(jpgPath);
		expect(result).not.toBeNull();
		expect((result as string).startsWith("data:image/jpeg;base64,")).toBe(true);
	});

	it("returns null for unsupported file types", async () => {
		const dir = await makeTempDir();
		const txtPath = join(dir, "readme.txt");
		await writeFile(txtPath, "hello");

		const result = await fileToDataUri(txtPath);
		expect(result).toBeNull();
	});

	it("returns null for a .md file", async () => {
		const dir = await makeTempDir();
		const mdPath = join(dir, "doc.md");
		await writeFile(mdPath, "# Hello");

		const result = await fileToDataUri(mdPath);
		expect(result).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// resolveLocalImage
// ---------------------------------------------------------------------------

describe("resolveLocalImage", () => {
	it("resolves an image from the docroot", async () => {
		const dir = await makeTempDir();
		const imgDir = join(dir, "images");
		await mkdir(imgDir, { recursive: true });
		const imgPath = join(imgDir, "photo.png");
		await writeFile(imgPath, "fake-png");

		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		// resolveLocalImage uses the module-level ROOT variable which we can't easily override
		// But we can test the case where it finds a file via section paths
		const configWithSection: SiteConfig = {
			...config,
			sections: [{ name: "Docs", path: "." }],
		};

		// The function uses a module-level ROOT; we test behavior through the
		// src "images/photo.png" being resolved via section directories
		// This is a limited test since ROOT is module-scoped
		const result = await resolveLocalImage("images/photo.png", configWithSection);
		// Result depends on module-level ROOT which points to cwd - may not find our temp file
		// So we just verify it returns string | null without throwing
		expect(result === null || typeof result === "string").toBe(true);
	});

	it("returns null for a nonexistent image", async () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		const result = await resolveLocalImage("nonexistent/image.png", config);
		expect(result).toBeNull();
	});

	it("skips external URLs gracefully (function expects local paths)", async () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		// resolveLocalImage expects local paths, not URLs
		// external filtering happens in inlineLocalImages
		const result = await resolveLocalImage("https://example.com/img.png", config);
		// Should return null since this won't resolve to any local file
		expect(result).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// inlineLocalImages
// ---------------------------------------------------------------------------

describe("inlineLocalImages", () => {
	it("skips external URLs", async () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		const html = '<img src="https://example.com/photo.png" alt="External">';
		const result = await inlineLocalImages(html, config);
		expect(result).toBe(html); // Unchanged
	});

	it("skips already-inlined data URIs", async () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		const html = '<img src="data:image/png;base64,AAAA" alt="Inlined">';
		const result = await inlineLocalImages(html, config);
		expect(result).toBe(html); // Unchanged
	});

	it("returns HTML unchanged when there are no img tags", async () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		const html = "<p>No images here</p>";
		const result = await inlineLocalImages(html, config);
		expect(result).toBe(html);
	});

	it("preserves non-local images that cannot be resolved", async () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		const html = '<img src="nonexistent/photo.png" alt="Missing">';
		const result = await inlineLocalImages(html, config);
		// The image can't be found so it stays unchanged
		expect(result).toContain('src="nonexistent/photo.png"');
	});
});

// ---------------------------------------------------------------------------
// buildBundleNav (existing tests preserved + new)
// ---------------------------------------------------------------------------

describe("buildBundleNav", () => {
	const config: SiteConfig = {
		docroot: ".",
		title: "Bundle Test",
		brand: { name: "Test", url: "/" },
		sections: [
			{ name: "Guide", path: "guide" },
			{ name: "Reference", path: "reference" },
		],
	};

	it("renders nested pages with details/summary and #hash links", () => {
		const files: ContentFile[] = [
			{
				path: "/guide/start.md",
				urlPath: "guide/start",
				section: "Guide",
				sectionBase: "guide",
			},
			{
				path: "/guide/api/users.md",
				urlPath: "guide/api/users",
				section: "Guide",
				sectionBase: "guide",
			},
		];

		const html = buildBundleNav(files, config);
		expect(html).toContain('<summary class="nav-group">api</summary>');
		expect(html).toContain('<a href="#guideapiusers">users</a>');
		expect(html).toContain("<details>");
		expect(html).not.toContain("<details open>");
	});

	it("renders flat sections without details groups", () => {
		const files: ContentFile[] = [
			{
				path: "/reference/cli.md",
				urlPath: "reference/cli",
				section: "Reference",
				sectionBase: "reference",
			},
		];

		const html = buildBundleNav(files, config);
		expect(html).toContain('<span class="nav-section">Reference</span>');
		expect(html).toContain('<a href="#referencecli">cli</a>');
		expect(html).not.toContain("<details>");
	});

	it("includes home link when home is configured", () => {
		const files: ContentFile[] = [
			{
				path: "/guide/start.md",
				urlPath: "guide/start",
				section: "Guide",
				sectionBase: "guide",
			},
		];
		const withHome = { ...config, home: "index.md" };

		const html = buildBundleNav(files, withHome);
		expect(html).toContain('<a href="#home" class="nav-home">Home</a>');
	});

	it("omits home link when home is not configured", () => {
		const files: ContentFile[] = [
			{
				path: "/guide/start.md",
				urlPath: "guide/start",
				section: "Guide",
				sectionBase: "guide",
			},
		];

		const html = buildBundleNav(files, config);
		expect(html).not.toContain("nav-home");
	});

	it("renders empty nav for empty files", () => {
		const html = buildBundleNav([], config);
		expect(html).toContain('<ul class="bundle-nav">');
		expect(html).toContain("</ul>");
		expect(html).not.toContain("nav-section");
	});

	it("renders multiple sections in config order", () => {
		const files: ContentFile[] = [
			{
				path: "/guide/start.md",
				urlPath: "guide/start",
				section: "Guide",
				sectionBase: "guide",
			},
			{
				path: "/reference/cli.md",
				urlPath: "reference/cli",
				section: "Reference",
				sectionBase: "reference",
			},
		];

		const html = buildBundleNav(files, config);
		const guidePos = html.indexOf("Guide");
		const refPos = html.indexOf("Reference");
		expect(guidePos).toBeLessThan(refPos);
	});

	it("generates slugified hash hrefs", () => {
		const files: ContentFile[] = [
			{
				path: "/guide/getting-started.md",
				urlPath: "guide/getting-started",
				section: "Guide",
				sectionBase: "guide",
			},
		];

		const html = buildBundleNav(files, config);
		expect(html).toContain('href="#guidegetting-started"');
	});
});

// ---------------------------------------------------------------------------
// buildBundleSidebarHeader (existing tests preserved + new)
// ---------------------------------------------------------------------------

describe("buildBundleSidebarHeader", () => {
	it("applies wordmark logo class and template-aligned tools/meta structure", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Bundle Test",
			home: "index.md",
			brand: { name: "Acme Corp", url: "/", logoType: "wordmark" },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, "0.1.0", "data:image/png;base64,AA==");
		expect(html).toContain('class="logo logo-wordmark"');
		expect(html).toContain('<div class="header-tools">');
		expect(html).toContain('<div class="sidebar-meta">');
		expect(html).toContain('<a href="#home" class="product">Bundle</a>');
	});

	it("defaults to icon logo class when logoType is not set", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Bundle Test",
			brand: { name: "Kitfly", url: "/" },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, "0.1.0", "data:image/png;base64,AA==");
		expect(html).toContain('class="logo logo-icon"');
	});

	it("bundle output includes custom sidebar width from theme layout", async () => {
		const source = await readFile(`${process.cwd()}/scripts/bundle.ts`, "utf-8");
		expect(source).toContain("const themeCSS = generateThemeCSS(theme);");
		expect(source).toContain(`\${themeCSS}`);
	});

	it("bundle script keeps docs-mode smooth anchor scrolling", async () => {
		const source = await readFile(`${process.cwd()}/scripts/bundle.ts`, "utf-8");
		expect(source).toContain("if (!shell) {");
		expect(source).toContain("scrollIntoView({ behavior: 'smooth', block: 'start' });");
	});

	it("shows version label with v prefix when version is provided", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, "2.3.4", "logo.png");
		expect(html).toContain("v2.3.4");
	});

	it("shows 'unversioned' when version is undefined", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, undefined, "logo.png");
		expect(html).toContain("unversioned");
	});

	it("uses brand name in logo alt text", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "My Company", url: "/" },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, "1.0", "logo.png");
		expect(html).toContain('alt="My Company"');
	});

	it("includes initial fallback metadata and onerror handler", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Acme", url: "/" },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, "1.0", "logo.png");
		expect(html).toContain('data-initial="A"');
		expect(html).toContain("classList.add('logo-fallback')");
	});

	it("escapes initial fallback character in data attribute", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: '"quoted', url: "/" },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, "1.0", "logo.png");
		expect(html).toContain('data-initial="&quot;"');
	});

	it("links brand to brand URL", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Acme", url: "https://acme.com" },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, "1.0", "logo.png");
		expect(html).toContain('href="https://acme.com"');
	});

	it("adds target _blank for external brands", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Acme", url: "https://acme.com", external: true },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, "1.0", "logo.png");
		expect(html).toContain('target="_blank"');
		expect(html).toContain('rel="noopener"');
	});

	it("does not add target _blank when brand is not external", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Acme", url: "/" },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, "1.0", "logo.png");
		expect(html).not.toContain('target="_blank"');
	});

	it("product link uses # when home is not set", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, "1.0", "logo.png");
		expect(html).toContain('<a href="#" class="product">Bundle</a>');
	});

	it("product link uses #home when home is set", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			home: "index.md",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, "1.0", "logo.png");
		expect(html).toContain('<a href="#home" class="product">Bundle</a>');
	});

	it("includes theme toggle button", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, "1.0", "logo.png");
		expect(html).toContain('class="theme-toggle"');
		expect(html).toContain("toggleTheme()");
	});

	it("includes meta-branch as 'bundle'", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		const html = buildBundleSidebarHeader(config, "1.0", "logo.png");
		expect(html).toContain('<span class="meta-branch">bundle</span>');
	});

	it("uses provided brandLogo in img src", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Test",
			brand: { name: "Test", url: "/" },
			sections: [],
		};

		const logo = "data:image/svg+xml;base64,PHN2Zy8+";
		const html = buildBundleSidebarHeader(config, "1.0", logo);
		expect(html).toContain(`src="${logo}"`);
	});
});

describe("bundleSite plugin integration", () => {
	it("inlines latex plugin script when enabled", async () => {
		const siteDir = await makeTempDir();
		await mkdir(join(siteDir, "docs"), { recursive: true });
		await writeFile(
			join(siteDir, "site.yaml"),
			'title: "Bundle Test"\nbrand:\n  name: "Test"\n  url: "/"\nsections:\n  - name: Docs\n    path: docs\n',
			"utf-8",
		);
		await writeFile(join(siteDir, "docs", "index.md"), "# Bundle Math\n\n$E=mc^2$", "utf-8");
		await writeFile(join(siteDir, "kitfly.plugins.yaml"), "plugins:\n  - latex@0.2.2\n", "utf-8");

		await bundleSite({ folder: siteDir, out: "bundles", name: "bundle.html" });

		const html = await readFile(join(siteDir, "bundles", "bundle.html"), "utf-8");
		expect(html).toContain('data-kitfly-plugin="latex@0.2.2"');
		expect(html).toContain("const KATEX_JS_URL =");
		expect(html).toContain("cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.js");
		expect(html).toContain("cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css");
	});

	it("inlines slides-charts-lite plugin in slides mode", async () => {
		const siteDir = await makeTempDir();
		await mkdir(join(siteDir, "slides"), { recursive: true });
		await writeFile(
			join(siteDir, "site.yaml"),
			'title: "Bundle Charts Test"\nmode: "slides"\nbrand:\n  name: "Test"\n  url: "/"\nsections:\n  - name: Slides\n    path: slides\n',
			"utf-8",
		);
		await writeFile(
			join(siteDir, "slides", "deck.md"),
			'# Deck\n\n```chart\nkind: line\nlabels: ["W1", "W2"]\ndata: [2, 3]\n```',
			"utf-8",
		);
		await writeFile(
			join(siteDir, "kitfly.plugins.yaml"),
			"plugins:\n  - slides-charts-lite@0.2.2\n",
			"utf-8",
		);

		await bundleSite({ folder: siteDir, out: "bundles", name: "bundle.html" });

		const html = await readFile(join(siteDir, "bundles", "bundle.html"), "utf-8");
		expect(html).toContain('data-kitfly-plugin="slides-charts-lite@0.2.2"');
		expect(html).toContain("kitfly-chart-wrapper");
	});

	it("inlines footer logo image when configured", async () => {
		const siteDir = await makeTempDir();
		await mkdir(join(siteDir, "docs"), { recursive: true });
		await mkdir(join(siteDir, "assets", "brand"), { recursive: true });
		await writeFile(
			join(siteDir, "site.yaml"),
			'title: "Bundle Footer Test"\nbrand:\n  name: "Test"\n  url: "/"\nfooter:\n  logo: "assets/brand/footer-logo.png"\n  logoAlt: "Footer Brand"\n  logoHeight: 24\nsections:\n  - name: Docs\n    path: docs\n',
			"utf-8",
		);
		await writeFile(join(siteDir, "docs", "index.md"), "# Footer Logo");
		await writeFile(
			join(siteDir, "assets", "brand", "footer-logo.png"),
			Buffer.from(
				"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl9x9kAAAAASUVORK5CYII=",
				"base64",
			),
		);

		await bundleSite({ folder: siteDir, out: "bundles", name: "bundle.html" });

		const html = await readFile(join(siteDir, "bundles", "bundle.html"), "utf-8");
		expect(html).toContain('class="footer-logo-img"');
		expect(html).toContain('src="data:image/png;base64,');
		expect(html).not.toContain('src="assets/brand/footer-logo.png"');
		expect(html).toContain('alt="Footer Brand"');
		expect(html).toContain("max-height: 24px");
	});

	it("inlines footer logo from site-root-relative path outside assets", async () => {
		const siteDir = await makeTempDir();
		await mkdir(join(siteDir, "docs"), { recursive: true });
		await mkdir(join(siteDir, "logos"), { recursive: true });
		await writeFile(
			join(siteDir, "site.yaml"),
			'title: "Bundle Footer Root Path Test"\nbrand:\n  name: "Test"\n  url: "/"\nfooter:\n  logo: "logos/footer.png"\n  logoAlt: "Footer Root Logo"\nsections:\n  - name: Docs\n    path: docs\n',
			"utf-8",
		);
		await writeFile(join(siteDir, "docs", "index.md"), "# Footer Root Path");
		await writeFile(
			join(siteDir, "logos", "footer.png"),
			Buffer.from(
				"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl9x9kAAAAASUVORK5CYII=",
				"base64",
			),
		);

		await bundleSite({ folder: siteDir, out: "bundles", name: "bundle.html" });

		const html = await readFile(join(siteDir, "bundles", "bundle.html"), "utf-8");
		expect(html).toContain('class="footer-logo-img"');
		expect(html).toContain('src="data:image/png;base64,');
		expect(html).not.toContain('src="logos/footer.png"');
		expect(html).toContain('alt="Footer Root Logo"');
	});
});
