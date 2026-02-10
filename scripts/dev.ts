/**
 * Kitfly - Development server with hot reload
 *
 * Usage: bun run dev [folder] [options]
 *
 * Options:
 *   -p, --port <number>   Port to serve on [env: KITFLY_DEV_PORT] [default: 3333]
 *   -H, --host <string>   Host to bind to [env: KITFLY_DEV_HOST] [default: localhost]
 *   -o, --open            Open browser on start [env: KITFLY_DEV_OPEN] [default: true]
 *   --no-open             Don't open browser
 *   --help                Show help message
 *
 * Opens browser and watches for file changes, automatically reloading.
 */

import { watch } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { marked, Renderer } from "marked";
import { ENGINE_ASSETS_DIR, ENGINE_SITE_DIR } from "../src/engine.ts";
import {
	buildBreadcrumbsSimple,
	buildFooter,
	buildNavSimple,
	buildPageMeta,
	buildToc,
	// Network utilities
	checkPortOrExit,
	// Navigation/template building
	collectFiles,
	envBool,
	envInt,
	// Config helpers
	envString,
	// Formatting
	escapeHtml,
	// Provenance
	generateProvenance,
	// YAML/Config parsing
	loadSiteConfig,
	type Provenance,
	// Markdown utilities
	parseFrontmatter,
	resolveStylesPath,
	resolveTemplatePath,
	// Types
	type SiteConfig,
	slugify,
	toUrlPath,
	validatePath,
} from "../src/shared.ts";
import { generateThemeCSS, getPrismUrls, loadTheme, type Theme } from "../src/theme.ts";

// Defaults
const DEFAULT_PORT = 3333;
const DEFAULT_HOST = "localhost";

let PORT = DEFAULT_PORT;
let HOST = DEFAULT_HOST;
let ROOT = process.cwd();
let OPEN_BROWSER = true;
let LOG_FORMAT = ""; // "structured" when invoked by CLI daemon

// Structured logger for daemon mode — set during main() init.
// When null, all output goes through console.log (standalone mode).
let daemonLog: {
	info: (msg: string) => void;
	warn: (msg: string) => void;
	error: (msg: string) => void;
} | null = null;

/** Log info — uses structured logger in daemon mode, console.log otherwise */
function logInfo(msg: string): void {
	if (daemonLog) daemonLog.info(msg);
	else console.log(msg);
}

/** Log warning — uses structured logger in daemon mode, console.warn otherwise */
function logWarn(msg: string): void {
	if (daemonLog) daemonLog.warn(msg);
	else console.warn(msg);
}

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

interface ParsedArgs {
	port?: number;
	host?: string;
	open?: boolean;
	folder?: string;
	logFormat?: string;
}

function parseArgs(argv: string[]): ParsedArgs {
	const result: ParsedArgs = {};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		const next = argv[i + 1];

		if ((arg === "--port" || arg === "-p") && next) {
			result.port = parseInt(next, 10);
			i++;
		} else if ((arg === "--host" || arg === "-H") && next && !next.startsWith("-")) {
			result.host = next;
			i++;
		} else if (arg === "--log-format") {
			result.logFormat = next;
			i++;
		} else if (arg === "--open" || arg === "-o") {
			result.open = true;
		} else if (arg === "--no-open") {
			result.open = false;
		} else if (!arg.startsWith("-") && !result.folder) {
			result.folder = arg;
		}
	}
	return result;
}

function getConfig(): {
	port: number;
	host: string;
	open: boolean;
	folder?: string;
	logFormat?: string;
} {
	const args = parseArgs(process.argv.slice(2));
	return {
		port: args.port ?? envInt("KITFLY_DEV_PORT", DEFAULT_PORT),
		host: args.host ?? envString("KITFLY_DEV_HOST", DEFAULT_HOST),
		open: args.open ?? envBool("KITFLY_DEV_OPEN", true),
		folder: args.folder,
		logFormat: args.logFormat,
	};
}

function getContentType(filePath: string): string {
	const ext = extname(filePath).toLowerCase();
	switch (ext) {
		case ".css":
			return "text/css";
		case ".js":
			return "text/javascript";
		case ".json":
			return "application/json";
		case ".svg":
			return "image/svg+xml";
		case ".png":
			return "image/png";
		case ".jpg":
		case ".jpeg":
			return "image/jpeg";
		case ".gif":
			return "image/gif";
		case ".webp":
			return "image/webp";
		case ".ico":
			return "image/x-icon";
		case ".pdf":
			return "application/pdf";
		default:
			return "application/octet-stream";
	}
}

// Configure marked with custom renderer for mermaid support and heading IDs
const renderer = new Renderer();
const originalCode = renderer.code.bind(renderer);
renderer.code = (code: { type: "code"; raw: string; text: string; lang?: string }) => {
	if (code.lang === "mermaid") {
		// Store source in data attribute for theme toggle re-rendering
		const escaped = code.text.replace(/"/g, "&quot;");
		return `<pre class="mermaid" data-mermaid-source="${escaped}">${code.text}</pre>`;
	}
	return originalCode(code);
};
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
	const plain = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
	const id = slugify(plain);
	const inner = marked.parseInline(text) as string;
	return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
};
marked.use({ renderer });

// Track connected clients for hot reload
const clients: Set<ReadableStreamDefaultController> = new Set();

// Convert markdown to HTML with template
async function renderPage(
	filePath: string,
	urlPath: string,
	provenance: Provenance,
	config: SiteConfig,
	theme: Theme,
): Promise<string> {
	const uiVersion = provenance.version ? `v${provenance.version}` : "unversioned";
	const content = await readFile(filePath, "utf-8");
	const template = await readFile(await resolveTemplatePath(ROOT), "utf-8");

	let title = basename(filePath, extname(filePath));
	let htmlContent: string;
	let pageMeta = "";

	if (filePath.endsWith(".yaml")) {
		// Render YAML as code block
		htmlContent = `<h1>${title}</h1>\n<pre><code class="language-yaml">${escapeHtml(content)}</code></pre>`;
	} else if (filePath.endsWith(".json")) {
		// Render JSON as code block (pretty-printed)
		let prettyJson = content;
		try {
			prettyJson = JSON.stringify(JSON.parse(content), null, 2);
		} catch {
			// Use original if not valid JSON
		}
		htmlContent = `<h1>${title}</h1>\n<pre><code class="language-json">${escapeHtml(prettyJson)}</code></pre>`;
	} else {
		const { frontmatter, body } = parseFrontmatter(content);
		if (frontmatter.title) {
			title = frontmatter.title as string;
		}
		pageMeta = buildPageMeta(frontmatter);
		htmlContent = marked.parse(body) as string;
	}

	const files = await collectFiles(ROOT, config);
	const currentUrlPath = urlPath.slice(1).replace(/\.html$/, "");
	const nav = buildNavSimple(files, config, currentUrlPath);
	const footer = buildFooter(provenance, config);
	const breadcrumbs = buildBreadcrumbsSimple(urlPath, files, config);
	const toc = buildToc(htmlContent);
	const brandTarget = config.brand.external ? ' target="_blank" rel="noopener"' : "";
	const themeCSS = generateThemeCSS(theme);
	const prismUrls = getPrismUrls(theme);
	const pathPrefix = "/";

	const hotReloadScript = `
<script>
  const es = new EventSource('/__reload');
  es.onmessage = () => location.reload();
  es.onerror = () => setTimeout(() => location.reload(), 1000);
</script>`;

	const logoClass = config.brand.logoType === "wordmark" ? "logo-wordmark" : "logo-icon";

	return template
		.replace(/\{\{PATH_PREFIX\}\}/g, pathPrefix)
		.replace(/\{\{BRAND_URL\}\}/g, config.brand.url)
		.replace(/\{\{BRAND_TARGET\}\}/g, brandTarget)
		.replace(/\{\{BRAND_NAME\}\}/g, config.brand.name)
		.replace(/\{\{BRAND_LOGO\}\}/g, config.brand.logo || "assets/brand/logo.png")
		.replace(/\{\{BRAND_FAVICON\}\}/g, config.brand.favicon || "assets/brand/favicon.png")
		.replace(/\{\{BRAND_LOGO_CLASS\}\}/g, logoClass)
		.replace(/\{\{SITE_TITLE\}\}/g, config.title)
		.replace("{{TITLE}}", title)
		.replace("{{VERSION}}", uiVersion)
		.replace("{{BRANCH}}", provenance.gitBranch)
		.replace("{{BREADCRUMBS}}", breadcrumbs)
		.replace("{{PAGE_META}}", pageMeta)
		.replace("{{NAV}}", nav)
		.replace("{{CONTENT}}", htmlContent)
		.replace("{{TOC}}", toc)
		.replace("{{FOOTER}}", footer)
		.replace("{{THEME_CSS}}", themeCSS)
		.replace("{{PRISM_LIGHT_URL}}", prismUrls.light)
		.replace("{{PRISM_DARK_URL}}", prismUrls.dark)
		.replace("{{HOT_RELOAD_SCRIPT}}", hotReloadScript);
}

// Render Getting Started page when no config
async function renderGettingStarted(
	provenance: Provenance,
	config: SiteConfig,
	theme: Theme,
): Promise<string> {
	const uiVersion = provenance.version ? `v${provenance.version}` : "unversioned";
	const template = await readFile(await resolveTemplatePath(ROOT), "utf-8");
	const htmlContent = `
    <h1>Getting Started</h1>
    <p>Welcome! To configure your kitfly site, create a <code>site.yaml</code> file in the repository root:</p>
    <pre><code class="language-yaml"># yaml-language-server: $schema=./schemas/v0/site.schema.json
schemaVersion: "0.1.0"
docroot: "."
title: "My Docs"

brand:
  name: "My Brand"
  url: "https://example.com"
  external: true

sections:
  - name: "Overview"
    path: "."
    files: ["README.md"]
  - name: "Guides"
    path: "guides"
</code></pre>
    <p>Or create a <code>content/</code> directory with subdirectories for auto-discovery.</p>
  `;

	const brandTarget = config.brand.external ? ' target="_blank" rel="noopener"' : "";
	const themeCSS = generateThemeCSS(theme);
	const prismUrls = getPrismUrls(theme);
	const pathPrefix = "/";

	const hotReloadScript = `
<script>
  const es = new EventSource('/__reload');
  es.onmessage = () => location.reload();
  es.onerror = () => setTimeout(() => location.reload(), 1000);
</script>`;

	const logoClass = config.brand.logoType === "wordmark" ? "logo-wordmark" : "logo-icon";

	return template
		.replace(/\{\{PATH_PREFIX\}\}/g, pathPrefix)
		.replace(/\{\{BRAND_URL\}\}/g, config.brand.url)
		.replace(/\{\{BRAND_TARGET\}\}/g, brandTarget)
		.replace(/\{\{BRAND_NAME\}\}/g, config.brand.name)
		.replace(/\{\{BRAND_LOGO\}\}/g, config.brand.logo || "assets/brand/logo.png")
		.replace(/\{\{BRAND_FAVICON\}\}/g, config.brand.favicon || "assets/brand/favicon.png")
		.replace(/\{\{BRAND_LOGO_CLASS\}\}/g, logoClass)
		.replace(/\{\{SITE_TITLE\}\}/g, config.title)
		.replace("{{TITLE}}", "Getting Started")
		.replace("{{VERSION}}", uiVersion)
		.replace("{{BRANCH}}", provenance.gitBranch)
		.replace("{{BREADCRUMBS}}", "")
		.replace("{{PAGE_META}}", "")
		.replace("{{NAV}}", "<ul></ul>")
		.replace("{{CONTENT}}", htmlContent)
		.replace("{{TOC}}", "")
		.replace("{{FOOTER}}", buildFooter(provenance, config))
		.replace("{{THEME_CSS}}", themeCSS)
		.replace("{{PRISM_LIGHT_URL}}", prismUrls.light)
		.replace("{{PRISM_DARK_URL}}", prismUrls.dark)
		.replace("{{HOT_RELOAD_SCRIPT}}", hotReloadScript);
}

async function tryServeFile(filePath: string): Promise<Response | null> {
	try {
		const file = Bun.file(filePath);
		if (!(await file.exists())) return null;
		return new Response(file, {
			headers: {
				"Content-Type": getContentType(filePath),
				"Cache-Control": "no-cache",
			},
		});
	} catch {
		return null;
	}
}

async function tryServeContentAsset(
	urlPathname: string,
	config: SiteConfig,
): Promise<Response | null> {
	// Serve common binary assets from docroot (images, PDFs, etc.)
	if (!/\.[a-z0-9]+$/i.test(urlPathname)) return null;
	if (urlPathname.endsWith(".html")) return null;
	if (urlPathname === "/styles.css" || urlPathname.startsWith("/assets/")) return null;

	const rel = decodeURIComponent(urlPathname).replace(/^\//, "");
	if (!rel) return null;
	const fsPath = validatePath(ROOT, config.docroot, rel, true);
	if (!fsPath) return null;
	return tryServeFile(fsPath);
}

// Find file for a URL path
async function findFile(urlPath: string, config: SiteConfig): Promise<string | null> {
	const { stat } = await import("node:fs/promises");

	// Remove leading slash and .html extension (for compatibility with built links)
	const path = urlPath.slice(1).replace(/\.html$/, "") || "";

	// If empty (home page), check for dedicated home or use first file
	if (!path) {
		if (config.home) {
			const homePath = validatePath(ROOT, config.docroot, config.home, true);
			if (homePath) {
				try {
					await stat(homePath);
					return homePath;
				} catch {
					// Home file not found, fall through
				}
			}
		}
		// Fallback to first file
		const files = await collectFiles(ROOT, config);
		return files.length > 0 ? files[0].path : null;
	}

	// Check configured sections
	for (const section of config.sections) {
		const sectionPath = validatePath(ROOT, config.docroot, section.path, true);
		if (!sectionPath) continue;

		if (section.files) {
			// Check explicit files
			for (const file of section.files) {
				const name = file.replace(/\.(md|yaml|json)$/, "").toLowerCase();
				if (name === path) {
					const filePath = join(sectionPath, file);
					try {
						await stat(filePath);
						return filePath;
					} catch {
						// Continue
					}
				}
			}
		} else {
			// Check directory for matching file (supports nested paths)
			const urlBase = toUrlPath(ROOT, sectionPath);
			if (path.startsWith(`${urlBase}/`) || path === urlBase) {
				const relPath = path === urlBase ? "" : path.slice(urlBase.length + 1);
				// Guard against path traversal
				if (relPath.includes("..")) continue;
				const extensions = [".md", ".yaml", ".json"];

				if (relPath === "") {
					// Section root URL — try index file
					for (const ext of extensions) {
						const filePath = join(sectionPath, `index${ext}`);
						try {
							await stat(filePath);
							return filePath;
						} catch {
							// Continue
						}
					}
				} else {
					// Try direct file match at nested path
					for (const ext of extensions) {
						const filePath = join(sectionPath, relPath + ext);
						try {
							await stat(filePath);
							return filePath;
						} catch {
							// Continue
						}
					}
					// Try as directory with index file
					for (const ext of extensions) {
						const filePath = join(sectionPath, relPath, `index${ext}`);
						try {
							await stat(filePath);
							return filePath;
						} catch {
							// Continue
						}
					}
				}
			}
		}
	}

	return null;
}

// Notify all clients to reload
function notifyReload() {
	for (const controller of clients) {
		try {
			controller.enqueue("data: reload\n\n");
		} catch {
			clients.delete(controller);
		}
	}
}

// Start file watcher
function startWatcher(config: SiteConfig) {
	const watchDirs = [ROOT, ENGINE_SITE_DIR];

	// Watch site overrides if present
	const overrideDir = join(ROOT, "kitfly");
	watchDirs.push(overrideDir);

	// Add section directories
	for (const section of config.sections) {
		if (section.path !== ".") {
			const sectionPath = validatePath(ROOT, config.docroot, section.path);
			if (sectionPath) {
				watchDirs.push(sectionPath);
			}
		}
	}

	for (const dir of watchDirs) {
		try {
			watch(dir, { recursive: true }, (_event, filename) => {
				if (
					filename &&
					(filename.endsWith(".md") ||
						filename.endsWith(".yaml") ||
						filename.endsWith(".json") ||
						filename.endsWith(".html") ||
						filename.endsWith(".css"))
				) {
					logInfo(`File changed: ${filename}`);
					notifyReload();
				}
			});
		} catch {
			// Directory doesn't exist, skip
		}
	}
}

// Main server startup
async function main() {
	// Initialize structured logger early so all daemon output is captured.
	// Dynamic import so standalone sites without tsfulmen don't break.
	if (LOG_FORMAT === "structured") {
		try {
			const { createStructuredLogger } = await import("@fulmenhq/tsfulmen/logging");
			daemonLog = createStructuredLogger("kitfly");
		} catch {
			// tsfulmen not available — fall back to console
		}
	}

	// Load configuration
	const config = await loadSiteConfig(ROOT);
	logInfo(`Loaded config: "${config.title}" (${config.sections.length} sections)`);

	// Apply server config from site.yaml if CLI didn't override
	if (config.server?.port && PORT === DEFAULT_PORT) {
		PORT = config.server.port;
	}
	if (config.server?.host && HOST === DEFAULT_HOST) {
		HOST = config.server.host;
	}

	// Load theme
	const theme = await loadTheme(ROOT);
	logInfo(`Loaded theme: "${theme.name || "default"}"`);

	// Generate provenance once at startup (dev mode)
	const provenance = await generateProvenance(ROOT, true, config.version);

	// Check port availability before starting server
	await checkPortOrExit(PORT, HOST);

	// Core request handler
	async function handleRequest(req: Request): Promise<Response> {
		const url = new URL(req.url);

		// SSE endpoint for hot reload
		if (url.pathname === "/__reload") {
			const stream = new ReadableStream({
				start(controller) {
					clients.add(controller);
				},
				cancel(controller) {
					clients.delete(controller);
				},
			});

			return new Response(stream, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				},
			});
		}

		// Serve provenance.json
		if (url.pathname === "/provenance.json") {
			return new Response(JSON.stringify(provenance, null, 2), {
				headers: { "Content-Type": "application/json" },
			});
		}

		// Serve CSS
		if (url.pathname === "/styles.css") {
			const css = await readFile(await resolveStylesPath(ROOT), "utf-8");
			return new Response(css, {
				headers: { "Content-Type": "text/css" },
			});
		}

		// Serve built-in or site-provided assets
		if (url.pathname.startsWith("/assets/")) {
			const rel = decodeURIComponent(url.pathname).replace(/^\/assets\//, "");
			const sitePath = join(ROOT, "assets", rel);
			const siteResp = await tryServeFile(sitePath);
			if (siteResp) return siteResp;

			const enginePath = join(ENGINE_ASSETS_DIR, rel);
			return (await tryServeFile(enginePath)) || new Response("Asset not found", { status: 404 });
		}

		// Serve content-linked assets (images, PDFs, etc.)
		const assetResponse = await tryServeContentAsset(url.pathname, config);
		if (assetResponse) return assetResponse;

		// Check for content
		const files = await collectFiles(ROOT, config);
		if (files.length === 0) {
			// No content - render Getting Started page
			const html = await renderGettingStarted(provenance, config, theme);
			return new Response(html, {
				headers: { "Content-Type": "text/html" },
			});
		}

		// Find and render markdown/yaml file
		const filePath = await findFile(url.pathname, config);
		if (filePath) {
			// If this is an index/readme file and the URL lacks a trailing slash,
			// redirect so relative links resolve correctly (BUG-003)
			const stem = basename(filePath, extname(filePath)).toLowerCase();
			if (
				(stem === "index" || stem === "readme") &&
				!url.pathname.endsWith("/") &&
				url.pathname !== "/"
			) {
				return new Response(null, {
					status: 301,
					headers: { Location: `${url.pathname}/` },
				});
			}
			const html = await renderPage(filePath, url.pathname, provenance, config, theme);
			return new Response(html, {
				headers: { "Content-Type": "text/html" },
			});
		}

		// Check if this is a section path - redirect to first file
		const cleanPath = url.pathname.replace(/\/$/, "").slice(1); // Remove leading/trailing slashes
		for (const file of files) {
			const parts = file.urlPath.split("/");
			if (parts.length > 1) {
				const sectionPath = parts.slice(0, -1).join("/");
				if (sectionPath === cleanPath) {
					// Redirect to first file in this section
					return new Response(null, {
						status: 302,
						headers: { Location: `/${file.urlPath}` },
					});
				}
			}
		}

		// 404
		return new Response("Not found", { status: 404 });
	}

	// Wrap with request logging middleware when in structured log mode
	const fetch = daemonLog
		? async (req: Request) => {
				const start = performance.now();
				const response = await handleRequest(req);
				const duration = (performance.now() - start).toFixed(0);
				const url = new URL(req.url);
				if (url.pathname !== "/__reload") {
					daemonLog?.info(`${req.method} ${url.pathname} ${response.status} ${duration}ms`);
				}
				return response;
			}
		: handleRequest;

	// Create server
	Bun.serve({
		port: PORT,
		hostname: HOST,
		fetch,
	});

	// Start watcher
	startWatcher(config);

	const displayHost = HOST === "0.0.0.0" ? "localhost" : HOST;
	const serverUrl = `http://${displayHost}:${PORT}`;

	if (daemonLog) {
		// Daemon mode — structured log lines, no ANSI
		logInfo(`Server started on ${serverUrl}`);
		logInfo(`Content root: ${ROOT}`);
		logInfo(`Version: ${provenance.version ? `v${provenance.version}` : "unversioned"}`);
		if (HOST === "0.0.0.0") {
			logWarn("Binding to all interfaces (0.0.0.0)");
		}
	} else {
		// Foreground mode — pretty banner
		console.log(`
\x1b[32m┌─────────────────────────────────────────┐
│                                         │
│   ${config.title.padEnd(35)}│
│                                         │
│   Local:   ${serverUrl.padEnd(28)}│
│   Version: ${(provenance.version ? `v${provenance.version}` : "unversioned").padEnd(29)}│
│                                         │
│   Hot reload enabled - edit any .md     │
│   or .yaml file to see changes          │
│                                         │
└─────────────────────────────────────────┘\x1b[0m
`);

		if (HOST === "0.0.0.0") {
			console.log("\x1b[33m⚠ Binding to all interfaces (0.0.0.0)\x1b[0m\n");
		}
	}

	// Open browser (macOS)
	if (OPEN_BROWSER) {
		Bun.spawn(["open", serverUrl]);
	}
}

// Export for CLI usage
export interface DevOptions {
	folder?: string;
	port?: number;
	host?: string;
	open?: boolean;
	logFormat?: string;
}

export async function dev(options: DevOptions = {}) {
	if (options.folder) {
		ROOT = resolve(process.cwd(), options.folder);
	}
	if (options.port) {
		PORT = options.port;
	}
	if (options.host) {
		HOST = options.host;
	}
	if (options.open === false) {
		OPEN_BROWSER = false;
	}
	if (options.logFormat) {
		LOG_FORMAT = options.logFormat;
	}
	await main();
}

// Run directly if executed as script
if (import.meta.main) {
	// Check for help flag
	if (process.argv.includes("--help")) {
		console.log(`
Usage: bun run dev [folder] [options]

Options:
  -p, --port <number>   Port to serve on [env: KITFLY_DEV_PORT] [default: ${DEFAULT_PORT}]
  -H, --host <string>   Host to bind to [env: KITFLY_DEV_HOST] [default: ${DEFAULT_HOST}]
  -o, --open            Open browser on start [env: KITFLY_DEV_OPEN] [default: true]
  --no-open             Don't open browser
  --help                Show this help message

Examples:
  bun run dev
  bun run dev ./docs
  bun run dev --port 8080
  bun run dev ./docs -p 8080 --no-open
  KITFLY_DEV_PORT=8080 bun run dev
`);
		process.exit(0);
	}

	const cfg = getConfig();
	dev({
		folder: cfg.folder,
		port: cfg.port,
		host: cfg.host,
		open: cfg.open,
		logFormat: cfg.logFormat,
	}).catch(console.error);
}
