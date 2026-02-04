/**
 * Tests for engine.ts path constants and helper functions
 *
 * Tests the path constants (ENGINE_ROOT, ENGINE_SITE_DIR, ENGINE_ASSETS_DIR)
 * and the siteOverridePath helper function.
 */

import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
	ENGINE_ASSETS_DIR,
	ENGINE_ROOT,
	ENGINE_SITE_DIR,
	SITE_OVERRIDE_DIRNAME,
	siteOverridePath,
} from "../engine";

describe("engine.ts", () => {
	describe("ENGINE_ROOT constant", () => {
		it("should be an absolute path", () => {
			expect(ENGINE_ROOT).toBeTruthy();
			expect(ENGINE_ROOT).toBe(resolve(ENGINE_ROOT));
		});

		it("should end with 'kitfly' (the project root)", () => {
			expect(ENGINE_ROOT).toMatch(/kitfly$/);
		});

		it("should align with ENGINE_SITE_DIR", () => {
			// ENGINE_SITE_DIR is derived from ENGINE_ROOT
			expect(ENGINE_SITE_DIR).toBe(join(ENGINE_ROOT, "src/site"));
			expect(dirname(ENGINE_SITE_DIR)).toBe(join(ENGINE_ROOT, "src"));
		});
	});

	describe("ENGINE_SITE_DIR constant", () => {
		it("should be an absolute path", () => {
			expect(ENGINE_SITE_DIR).toBeTruthy();
			expect(ENGINE_SITE_DIR).toBe(resolve(ENGINE_SITE_DIR));
		});

		it("should be under ENGINE_ROOT", () => {
			expect(ENGINE_SITE_DIR).toContain(ENGINE_ROOT);
		});

		it("should end with 'src/site'", () => {
			expect(ENGINE_SITE_DIR).toMatch(/src[/\\]site$/);
		});

		it("should equal ENGINE_ROOT joined with 'src/site'", () => {
			expect(ENGINE_SITE_DIR).toBe(join(ENGINE_ROOT, "src/site"));
		});
	});

	describe("ENGINE_ASSETS_DIR constant", () => {
		it("should be an absolute path", () => {
			expect(ENGINE_ASSETS_DIR).toBeTruthy();
			expect(ENGINE_ASSETS_DIR).toBe(resolve(ENGINE_ASSETS_DIR));
		});

		it("should be under ENGINE_ROOT", () => {
			expect(ENGINE_ASSETS_DIR).toContain(ENGINE_ROOT);
		});

		it("should end with 'assets'", () => {
			expect(ENGINE_ASSETS_DIR).toMatch(/assets$/);
		});

		it("should equal ENGINE_ROOT joined with 'assets'", () => {
			expect(ENGINE_ASSETS_DIR).toBe(join(ENGINE_ROOT, "assets"));
		});
	});

	describe("SITE_OVERRIDE_DIRNAME constant", () => {
		it("should equal 'kitfly'", () => {
			expect(SITE_OVERRIDE_DIRNAME).toBe("kitfly");
		});
	});

	describe("siteOverridePath function", () => {
		it("should return a path combining siteRoot, SITE_OVERRIDE_DIRNAME, and relPathFromKitflyDir", () => {
			const siteRoot = "/home/user/my-site";
			const relPath = "config.yaml";

			const result = siteOverridePath(siteRoot, relPath);

			expect(result).toBe(join(siteRoot, "kitfly", "config.yaml"));
		});

		it("should work with nested relative paths", () => {
			const siteRoot = "/home/user/my-site";
			const relPath = "templates/layout.html";

			const result = siteOverridePath(siteRoot, relPath);

			expect(result).toBe(join(siteRoot, "kitfly", "templates", "layout.html"));
		});

		it("should handle absolute siteRoot paths", () => {
			const siteRoot = "/var/www/site";
			const relPath = "styles/main.css";

			const result = siteOverridePath(siteRoot, relPath);

			expect(result).toBe(join(siteRoot, "kitfly", "styles", "main.css"));
		});

		it("should handle relative siteRoot paths", () => {
			const siteRoot = "./my-site";
			const relPath = "theme.yaml";

			const result = siteOverridePath(siteRoot, relPath);

			// join() normalizes away a leading './'
			expect(result).toBe(join(siteRoot, "kitfly", relPath));
		});

		it("should handle trailing slashes in siteRoot", () => {
			const siteRoot = "/home/user/my-site/";
			const relPath = "config.yaml";

			const result = siteOverridePath(siteRoot, relPath);

			expect(result).toContain(join("kitfly", "config.yaml"));
		});

		it("should handle relative paths with nested directories", () => {
			const siteRoot = "~";
			const relPath = "subdir/nested/file.md";

			const result = siteOverridePath(siteRoot, relPath);

			expect(result).toBe(join("~", "kitfly", "subdir", "nested", "file.md"));
		});

		it("should handle empty relative path", () => {
			const siteRoot = "/home/user/my-site";
			const relPath = "";

			const result = siteOverridePath(siteRoot, relPath);

			expect(result).toBe(join(siteRoot, "kitfly"));
		});

		it("should use join() for path handling (respects OS path separators)", () => {
			const siteRoot = "/path/to/site";
			const relPath = "dir/file.txt";

			const result = siteOverridePath(siteRoot, relPath);

			// The result should use proper path separators for the OS
			expect(result).toContain("kitfly");
			expect(result).toContain("dir");
			expect(result).toContain("file.txt");
		});
	});
});
