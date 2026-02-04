/**
 * Tests for theme loading and CSS generation
 */

import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_THEME, generateThemeCSS, getPrismUrls, loadTheme, type Theme } from "../theme.ts";

// Mock fs/promises
vi.mock("node:fs/promises", () => ({
	readFile: vi.fn(),
}));

import { readFile } from "node:fs/promises";

const mockedReadFile = readFile as unknown as {
	mockRejectedValue: (err: unknown) => void;
	mockResolvedValue: (val: string) => void;
};

describe("DEFAULT_THEME", () => {
	it("has required structure", () => {
		expect(DEFAULT_THEME.name).toBe("Kitfly Default");
		expect(DEFAULT_THEME.colors).toBeDefined();
		expect(DEFAULT_THEME.colors.light).toBeDefined();
		expect(DEFAULT_THEME.colors.dark).toBeDefined();
		expect(DEFAULT_THEME.code).toBeDefined();
		expect(DEFAULT_THEME.typography).toBeDefined();
	});

	it("has complete light color palette", () => {
		const light = DEFAULT_THEME.colors.light;
		expect(light.background).toBe("#ffffff");
		expect(light.surface).toBe("#f5f7f8");
		expect(light.text).toBe("#374151");
		expect(light.textMuted).toBe("#6b7280");
		expect(light.heading).toBe("#152F46");
		expect(light.primary).toBe("#007182");
		expect(light.primaryHover).toBe("#0a6172");
		expect(light.accent).toBe("#D17059");
		expect(light.border).toBe("#e5e7eb");
	});

	it("has complete dark color palette", () => {
		const dark = DEFAULT_THEME.colors.dark;
		expect(dark.background).toBe("#0d1117");
		expect(dark.surface).toBe("#152F46");
		expect(dark.text).toBe("#e5e7eb");
		expect(dark.textMuted).toBe("#9ca3af");
		expect(dark.heading).toBe("#f9fafb");
		expect(dark.primary).toBe("#709EA6");
		expect(dark.primaryHover).toBe("#8fb5bc");
		expect(dark.accent).toBe("#e8947f");
		expect(dark.border).toBe("#374151");
	});

	it("has code theme defaults", () => {
		expect(DEFAULT_THEME.code?.light).toBe("default");
		expect(DEFAULT_THEME.code?.dark).toBe("okaidia");
	});

	it("has typography defaults", () => {
		const typo = DEFAULT_THEME.typography;
		expect(typo?.body).toBe("system");
		expect(typo?.headings).toBe("system");
		expect(typo?.code).toBe("mono");
		expect(typo?.baseSize).toBe("16px");
		expect(typo?.scale).toBe("1.25");
	});
});

describe("loadTheme", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns DEFAULT_THEME when no theme.yaml exists", async () => {
		mockedReadFile.mockRejectedValue(new Error("ENOENT"));

		const theme = await loadTheme("/some/path");

		expect(theme).toEqual(DEFAULT_THEME);
		expect(mockedReadFile).toHaveBeenCalledWith(join("/some/path", "theme.yaml"), "utf-8");
	});

	it("merges custom theme with defaults", async () => {
		const customTheme = `
name: Custom Theme
colors:
  light:
    background: "#f0f0f0"
    primary: "#ff0000"
`;
		mockedReadFile.mockResolvedValue(customTheme);

		const theme = await loadTheme("/project");

		expect(theme.name).toBe("Custom Theme");
		expect(theme.colors.light.background).toBe("#f0f0f0");
		expect(theme.colors.light.primary).toBe("#ff0000");
		// Should keep defaults for unspecified values
		expect(theme.colors.light.text).toBe("#374151");
		expect(theme.colors.dark.background).toBe("#0d1117");
	});

	it("parses quoted values correctly", async () => {
		const themeYaml = `
colors:
  light:
    background: "#ffffff"
    text: '#333333'
`;
		mockedReadFile.mockResolvedValue(themeYaml);

		const theme = await loadTheme("/project");

		expect(theme.colors.light.background).toBe("#ffffff");
		expect(theme.colors.light.text).toBe("#333333");
	});

	it("handles nested typography settings", async () => {
		const themeYaml = `
typography:
  body: serif
  baseSize: 18px
`;
		mockedReadFile.mockResolvedValue(themeYaml);

		const theme = await loadTheme("/project");

		expect(theme.typography?.body).toBe("serif");
		expect(theme.typography?.baseSize).toBe("18px");
		// Should keep other defaults
		expect(theme.typography?.headings).toBe("system");
	});

	it("handles code theme settings", async () => {
		const themeYaml = `
code:
  light: solarized-light
  dark: dracula
`;
		mockedReadFile.mockResolvedValue(themeYaml);

		const theme = await loadTheme("/project");

		expect(theme.code?.light).toBe("solarized-light");
		expect(theme.code?.dark).toBe("dracula");
	});

	it("ignores comments in YAML", async () => {
		const themeYaml = `
# This is a comment
name: Test Theme
# Another comment
colors:
  light:
    # Color comment
    background: "#fff"
`;
		mockedReadFile.mockResolvedValue(themeYaml);

		const theme = await loadTheme("/project");

		expect(theme.name).toBe("Test Theme");
		expect(theme.colors.light.background).toBe("#fff");
	});

	it("handles empty lines in YAML", async () => {
		const themeYaml = `
name: Test Theme

colors:

  light:
    background: "#fff"

`;
		mockedReadFile.mockResolvedValue(themeYaml);

		const theme = await loadTheme("/project");

		expect(theme.name).toBe("Test Theme");
		expect(theme.colors.light.background).toBe("#fff");
	});
});

describe("generateThemeCSS", () => {
	it("generates valid CSS with style tag", () => {
		const css = generateThemeCSS(DEFAULT_THEME);

		expect(css).toContain('<style id="kitfly-theme">');
		expect(css).toContain("</style>");
	});

	it("includes light theme CSS variables in :root", () => {
		const css = generateThemeCSS(DEFAULT_THEME);

		expect(css).toContain(":root {");
		expect(css).toContain("--color-bg: #ffffff");
		expect(css).toContain("--color-text: #374151");
		expect(css).toContain("--color-link: #007182");
	});

	it("includes dark theme in media query", () => {
		const css = generateThemeCSS(DEFAULT_THEME);

		expect(css).toContain("@media (prefers-color-scheme: dark)");
		expect(css).toContain("--color-bg: #0d1117");
	});

	it("includes data-theme selectors for manual toggle", () => {
		const css = generateThemeCSS(DEFAULT_THEME);

		expect(css).toContain('[data-theme="dark"]');
		expect(css).toContain('[data-theme="light"]');
	});

	it("includes font variables", () => {
		const css = generateThemeCSS(DEFAULT_THEME);

		expect(css).toContain("--font-sans:");
		expect(css).toContain("--font-headings:");
		expect(css).toContain("--font-mono:");
	});

	it("sets html font-size from baseSize", () => {
		const css = generateThemeCSS(DEFAULT_THEME);

		expect(css).toContain("html { font-size: 16px; }");
	});

	it("uses custom theme colors", () => {
		const customTheme: Theme = {
			colors: {
				light: {
					background: "#f0f0f0",
					surface: "#e0e0e0",
					text: "#111111",
					heading: "#000000",
					primary: "#0066cc",
					border: "#cccccc",
				},
				dark: {
					background: "#1a1a1a",
					surface: "#2a2a2a",
					text: "#eeeeee",
					heading: "#ffffff",
					primary: "#66aaff",
					border: "#444444",
				},
			},
		};

		const css = generateThemeCSS(customTheme);

		expect(css).toContain("--color-bg: #f0f0f0");
		expect(css).toContain("--color-text: #111111");
		expect(css).toContain("--color-bg: #1a1a1a");
	});

	it("falls back to text color when textMuted is not defined", () => {
		const themeWithoutMuted: Theme = {
			colors: {
				light: {
					background: "#ffffff",
					surface: "#f5f5f5",
					text: "#333333",
					heading: "#000000",
					primary: "#0066cc",
					border: "#cccccc",
				},
				dark: {
					background: "#1a1a1a",
					surface: "#2a2a2a",
					text: "#eeeeee",
					heading: "#ffffff",
					primary: "#66aaff",
					border: "#444444",
				},
			},
		};

		const css = generateThemeCSS(themeWithoutMuted);

		// textMuted should fall back to text color
		expect(css).toContain("--color-text-muted: #333333");
	});

	it("falls back to primary color when primaryHover is not defined", () => {
		const themeWithoutHover: Theme = {
			colors: {
				light: {
					background: "#ffffff",
					surface: "#f5f5f5",
					text: "#333333",
					heading: "#000000",
					primary: "#0066cc",
					border: "#cccccc",
				},
				dark: {
					background: "#1a1a1a",
					surface: "#2a2a2a",
					text: "#eeeeee",
					heading: "#ffffff",
					primary: "#66aaff",
					border: "#444444",
				},
			},
		};

		const css = generateThemeCSS(themeWithoutHover);

		// primaryHover should fall back to primary color
		expect(css).toContain("--color-link-hover: #0066cc");
	});

	it("uses custom typography settings", () => {
		const customTheme: Theme = {
			colors: DEFAULT_THEME.colors,
			typography: {
				body: "serif",
				headings: "readable",
				baseSize: "18px",
			},
		};

		const css = generateThemeCSS(customTheme);

		expect(css).toContain("html { font-size: 18px; }");
		// Should include serif font stack for body
		expect(css).toContain("Georgia");
		// Should include readable font stack for headings
		expect(css).toContain("Charter");
	});
});

describe("getPrismUrls", () => {
	it("returns default URLs for DEFAULT_THEME", () => {
		const urls = getPrismUrls(DEFAULT_THEME);

		expect(urls.light).toBe("https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism.min.css");
		expect(urls.dark).toBe("https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism-okaidia.min.css");
	});

	it("returns correct URLs for standard Prism themes", () => {
		const theme: Theme = {
			colors: DEFAULT_THEME.colors,
			code: {
				light: "coy",
				dark: "tomorrow",
			},
		};

		const urls = getPrismUrls(theme);

		expect(urls.light).toBe("https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism-coy.min.css");
		expect(urls.dark).toBe("https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism-tomorrow.min.css");
	});

	it("returns correct URLs for prism-themes package", () => {
		const theme: Theme = {
			colors: DEFAULT_THEME.colors,
			code: {
				light: "nord",
				dark: "dracula",
			},
		};

		const urls = getPrismUrls(theme);

		expect(urls.light).toBe(
			"https://cdn.jsdelivr.net/npm/prism-themes@1/themes/prism-nord.min.css",
		);
		expect(urls.dark).toBe(
			"https://cdn.jsdelivr.net/npm/prism-themes@1/themes/prism-dracula.min.css",
		);
	});

	it("falls back to defaults for unknown themes", () => {
		const theme: Theme = {
			colors: DEFAULT_THEME.colors,
			code: {
				light: "nonexistent-theme",
				dark: "also-nonexistent",
			},
		};

		const urls = getPrismUrls(theme);

		expect(urls.light).toBe("https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism.min.css");
		expect(urls.dark).toBe("https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism-okaidia.min.css");
	});

	it("falls back to defaults when code config is missing", () => {
		const theme: Theme = {
			colors: DEFAULT_THEME.colors,
		};

		const urls = getPrismUrls(theme);

		expect(urls.light).toBe("https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism.min.css");
		expect(urls.dark).toBe("https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism-okaidia.min.css");
	});

	it("handles partial code config", () => {
		const themeWithOnlyLight: Theme = {
			colors: DEFAULT_THEME.colors,
			code: {
				light: "solarized-light",
			},
		};

		const urls = getPrismUrls(themeWithOnlyLight);

		expect(urls.light).toBe(
			"https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism-solarizedlight.min.css",
		);
		expect(urls.dark).toBe("https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism-okaidia.min.css");
	});

	it("supports all documented Prism themes", () => {
		const supportedThemes = [
			"default",
			"coy",
			"solarized-light",
			"tomorrow",
			"okaidia",
			"tomorrow-night",
			"nord",
			"dracula",
			"one-dark",
			"synthwave84",
		];

		for (const themeName of supportedThemes) {
			const theme: Theme = {
				colors: DEFAULT_THEME.colors,
				code: { light: themeName, dark: themeName },
			};

			const urls = getPrismUrls(theme);

			expect(urls.light).toContain("cdn.jsdelivr.net");
			expect(urls.dark).toContain("cdn.jsdelivr.net");
		}
	});
});

describe("FONT_STACKS mapping", () => {
	it("system font stack is used by default", () => {
		const css = generateThemeCSS(DEFAULT_THEME);

		expect(css).toContain("-apple-system");
		expect(css).toContain("BlinkMacSystemFont");
		expect(css).toContain("Segoe UI");
	});

	it("serif font stack contains proper fonts", () => {
		const theme: Theme = {
			colors: DEFAULT_THEME.colors,
			typography: { body: "serif" },
		};

		const css = generateThemeCSS(theme);

		expect(css).toContain("Georgia");
		expect(css).toContain("Times New Roman");
	});

	it("readable font stack contains Charter", () => {
		const theme: Theme = {
			colors: DEFAULT_THEME.colors,
			typography: { body: "readable" },
		};

		const css = generateThemeCSS(theme);

		expect(css).toContain("Charter");
		expect(css).toContain("Bitstream Charter");
	});

	it("mono font stack is always included", () => {
		const css = generateThemeCSS(DEFAULT_THEME);

		expect(css).toContain("--font-mono:");
		expect(css).toContain("ui-monospace");
		expect(css).toContain("SFMono-Regular");
		expect(css).toContain("Menlo");
		expect(css).toContain("Consolas");
	});
});

describe("PRISM_THEMES mapping", () => {
	it("default theme uses prismjs package", () => {
		const urls = getPrismUrls({ colors: DEFAULT_THEME.colors, code: { light: "default" } });
		expect(urls.light).toContain("prismjs@1/themes/prism.min.css");
	});

	it("nord theme uses prism-themes package", () => {
		const urls = getPrismUrls({ colors: DEFAULT_THEME.colors, code: { dark: "nord" } });
		expect(urls.dark).toContain("prism-themes@1/themes/prism-nord.min.css");
	});

	it("dracula theme uses prism-themes package", () => {
		const urls = getPrismUrls({ colors: DEFAULT_THEME.colors, code: { dark: "dracula" } });
		expect(urls.dark).toContain("prism-themes@1/themes/prism-dracula.min.css");
	});

	it("one-dark theme uses prism-themes package", () => {
		const urls = getPrismUrls({ colors: DEFAULT_THEME.colors, code: { dark: "one-dark" } });
		expect(urls.dark).toContain("prism-themes@1/themes/prism-one-dark.min.css");
	});

	it("synthwave84 theme uses prism-themes package", () => {
		const urls = getPrismUrls({ colors: DEFAULT_THEME.colors, code: { dark: "synthwave84" } });
		expect(urls.dark).toContain("prism-themes@1/themes/prism-synthwave84.min.css");
	});
});
