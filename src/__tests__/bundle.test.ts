import { describe, expect, it } from "vitest";
import { buildBundleNav, buildBundleSidebarHeader } from "../../scripts/bundle.ts";
import type { ContentFile, SiteConfig } from "../shared.ts";

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
});

describe("buildBundleSidebarHeader", () => {
	it("applies wordmark logo class and template-aligned tools/meta structure", () => {
		const config: SiteConfig = {
			docroot: ".",
			title: "Bundle Test",
			home: "index.md",
			brand: { name: "Engage3", url: "/", logoType: "wordmark" },
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
});
