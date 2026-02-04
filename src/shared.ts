/**
 * Shared utilities for Kitfly scripts (dev, build, bundle)
 *
 * This module contains common functions used across multiple scripts
 * to reduce duplication and ensure consistency.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { ENGINE_ROOT, ENGINE_SITE_DIR, siteOverridePath } from "./engine.ts";

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface SiteSection {
	name: string;
	path: string;
	files?: string[];
	maxDepth?: number; // Max directory depth for auto-discovery (default: 4, max: 10)
	exclude?: string[]; // Glob patterns to exclude from auto-discovery
}

export interface SiteBrand {
	name: string;
	url: string;
	external?: boolean;
	logo?: string; // Path to logo image (default: assets/brand/logo.png)
	favicon?: string; // Path to favicon (default: assets/brand/favicon.png)
	logoType?: "icon" | "wordmark"; // icon = square, wordmark = wide
}

export interface SiteServer {
	port?: number; // Default dev server port
	host?: string; // Default dev server host
}

export interface SiteConfig {
	docroot: string;
	title: string;
	home?: string;
	brand: SiteBrand;
	sections: SiteSection[];
	server?: SiteServer;
}

export interface Provenance {
	version: string;
	buildDate: string;
	gitCommit: string;
	gitCommitDate: string;
	gitBranch: string;
}

export interface ContentFile {
	path: string;
	urlPath: string;
	section: string;
	sectionBase?: string;
}

// ---------------------------------------------------------------------------
// Environment and CLI helpers
// ---------------------------------------------------------------------------

export function envString(name: string, fallback: string): string {
	return process.env[name] ?? fallback;
}

export function envInt(name: string, fallback: number): number {
	const val = process.env[name];
	if (!val) return fallback;
	const parsed = parseInt(val, 10);
	return Number.isNaN(parsed) ? fallback : parsed;
}

export function envBool(name: string, fallback: boolean): boolean {
	const val = process.env[name]?.toLowerCase();
	if (!val) return fallback;
	if (["true", "1", "yes"].includes(val)) return true;
	if (["false", "0", "no"].includes(val)) return false;
	return fallback;
}

// ---------------------------------------------------------------------------
// Network utilities
// ---------------------------------------------------------------------------

/**
 * Check if a port is available by attempting to connect to it.
 * Returns true if port is free, false if in use.
 */
export async function isPortAvailable(port: number, host = "localhost"): Promise<boolean> {
	return new Promise((resolve) => {
		const net = require("node:net");
		const socket = new net.Socket();

		socket.setTimeout(1000);

		socket.on("connect", () => {
			socket.destroy();
			resolve(false); // Port is in use (connection succeeded)
		});

		socket.on("timeout", () => {
			socket.destroy();
			resolve(true); // Timeout = likely no one listening
		});

		socket.on("error", (err: NodeJS.ErrnoException) => {
			socket.destroy();
			if (err.code === "ECONNREFUSED") {
				resolve(true); // Connection refused = port is free
			} else {
				resolve(true); // Other errors = assume free
			}
		});

		socket.connect(port, host);
	});
}

/**
 * Check port and exit with error if in use.
 * Call this before starting a server.
 */
export async function checkPortOrExit(port: number, host = "localhost"): Promise<void> {
	const available = await isPortAvailable(port, host);
	if (!available) {
		console.error(`\x1b[31mError: Port ${port} is already in use\x1b[0m\n`);
		console.error(`Another process is listening on ${host}:${port}.`);
		console.error(`\nOptions:`);
		console.error(`  • Use a different port: --port ${port + 1}`);
		console.error(`  • Stop the other process first`);
		process.exit(1);
	}
}

// ---------------------------------------------------------------------------
// YAML/Config parsing
// ---------------------------------------------------------------------------

export function parseYaml(content: string): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	const lines = content.split("\n");

	function stripInlineComment(raw: string): string {
		let inSingle = false;
		let inDouble = false;
		let escaped = false;
		for (let i = 0; i < raw.length; i++) {
			const ch = raw[i];
			if (escaped) {
				escaped = false;
				continue;
			}
			if (ch === "\\") {
				escaped = true;
				continue;
			}
			if (!inDouble && ch === "'") {
				inSingle = !inSingle;
				continue;
			}
			if (!inSingle && ch === '"') {
				inDouble = !inDouble;
				continue;
			}
			if (!inSingle && !inDouble && ch === "#") {
				// YAML inline comment (outside quotes)
				return raw.slice(0, i).trimEnd();
			}
		}
		return raw.trimEnd();
	}

	// Stack tracks current object context with its base indentation
	const stack: { obj: Record<string, unknown>; indent: number }[] = [{ obj: result, indent: -2 }];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		// Skip comments and empty lines
		if (line.trim().startsWith("#") || line.trim() === "") continue;

		const indent = line.search(/\S/);
		const trimmed = line.trim();

		// Pop stack when we dedent
		while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
			stack.pop();
		}

		// Array item (starts with "- ")
		if (trimmed.startsWith("- ")) {
			const afterDash = trimmed.slice(2);
			const colonIndex = afterDash.indexOf(":");

			if (colonIndex > 0) {
				// Object in array: "- name: value"
				const key = afterDash.slice(0, colonIndex).trim();
				const val = stripInlineComment(afterDash.slice(colonIndex + 1).trim());

				// Create new object for this array item
				const obj: Record<string, unknown> = {};

				// Handle inline array value like files: ["a", "b"]
				if (val.startsWith("[") && val.endsWith("]")) {
					const arrContent = val.slice(1, -1);
					obj[key] = arrContent.split(",").map((s) => stripQuotes(s.trim()));
				} else if (val === "") {
					// Nested structure will follow
					obj[key] = null; // Placeholder
				} else {
					obj[key] = parseValue(val);
				}

				// Find the array in parent
				const parent = stack[stack.length - 1].obj;
				const arrays = Object.entries(parent).filter(([, v]) => Array.isArray(v));
				if (arrays.length > 0) {
					const [, arr] = arrays[arrays.length - 1];
					(arr as unknown[]).push(obj);
				}

				// Push this object onto stack for subsequent properties
				stack.push({ obj, indent });
			} else {
				// Simple array item: "- value"
				const parent = stack[stack.length - 1].obj;
				const arrays = Object.entries(parent).filter(([, v]) => Array.isArray(v));
				if (arrays.length > 0) {
					const [, arr] = arrays[arrays.length - 1];
					(arr as unknown[]).push(stripQuotes(stripInlineComment(afterDash.trim())));
				}
			}
			continue;
		}

		// Key: value pair
		const colonIndex = trimmed.indexOf(":");
		if (colonIndex > 0) {
			const key = trimmed.slice(0, colonIndex).trim();
			const value = stripInlineComment(trimmed.slice(colonIndex + 1).trim());
			const parent = stack[stack.length - 1].obj;

			if (value === "") {
				// Check if next non-empty line is an array or object
				let nextIdx = i + 1;
				while (nextIdx < lines.length && lines[nextIdx].trim() === "") nextIdx++;

				if (nextIdx < lines.length && lines[nextIdx].trim().startsWith("- ")) {
					// It's an array
					parent[key] = [];
				} else {
					// It's a nested object
					const nested: Record<string, unknown> = {};
					parent[key] = nested;
					stack.push({ obj: nested, indent });
				}
			} else if (value.startsWith("[") && value.endsWith("]")) {
				// Inline array
				const arrContent = value.slice(1, -1);
				parent[key] = arrContent.split(",").map((s) => stripQuotes(s.trim()));
			} else {
				parent[key] = parseValue(value);
			}
		}
	}

	return result;
}

export function parseValue(value: string): unknown {
	const stripped = stripQuotes(value);
	if (stripped === "true") return true;
	if (stripped === "false") return false;
	return stripped;
}

export function stripQuotes(value: string): string {
	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		return value.slice(1, -1);
	}
	return value;
}

// ---------------------------------------------------------------------------
// File utilities
// ---------------------------------------------------------------------------

export async function exists(path: string): Promise<boolean> {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validate path doesn't escape repo root
 * @param root - The root directory
 * @param docroot - The document root relative to ROOT
 * @param requestedPath - The requested path
 * @param logErrors - Whether to log errors (default: false)
 * @returns The resolved path or null if invalid
 */
export function validatePath(
	root: string,
	docroot: string,
	requestedPath: string,
	logErrors = false,
): string | null {
	const resolved = resolve(root, docroot, requestedPath);
	const normalizedRoot = resolve(root);
	if (!resolved.startsWith(`${normalizedRoot}${sep}`) && resolved !== normalizedRoot) {
		if (logErrors) {
			console.error(`Path escapes repo root: ${requestedPath}`);
		}
		return null;
	}
	return resolved;
}

/**
 * Normalize a resolved path to a URL-safe path relative to ROOT
 * Handles ../docs/decisions -> docs/decisions
 */
export function toUrlPath(root: string, resolvedPath: string): string {
	const normalizedRoot = resolve(root);
	if (resolvedPath.startsWith(`${normalizedRoot}${sep}`)) {
		return resolvedPath.slice(normalizedRoot.length + 1).replaceAll("\\", "/");
	}
	return resolvedPath;
}

export async function resolveTemplatePath(siteRoot: string): Promise<string> {
	const override = siteOverridePath(siteRoot, "template.html");
	if (await exists(override)) return override;
	return join(ENGINE_SITE_DIR, "template.html");
}

export async function resolveStylesPath(siteRoot: string): Promise<string> {
	const override = siteOverridePath(siteRoot, "styles.css");
	if (await exists(override)) return override;
	return join(ENGINE_SITE_DIR, "styles.css");
}

// ---------------------------------------------------------------------------
// Markdown utilities
// ---------------------------------------------------------------------------

export function parseFrontmatter(content: string): {
	frontmatter: Record<string, unknown>;
	body: string;
} {
	const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) {
		return { frontmatter: {}, body: content };
	}

	const frontmatter: Record<string, unknown> = {};
	const lines = match[1].split("\n");
	for (const line of lines) {
		const colonIndex = line.indexOf(":");
		if (colonIndex > 0) {
			const key = line.slice(0, colonIndex).trim();
			let value = line.slice(colonIndex + 1).trim();
			// Remove quotes if present
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
			}
			frontmatter[key] = value;
		}
	}

	return { frontmatter, body: match[2] };
}

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

// ---------------------------------------------------------------------------
// Navigation/template building
// ---------------------------------------------------------------------------

/** Hard ceiling — guards against symlink loops or pathological trees */
const MAX_DISCOVERY_DEPTH = 10;

/** Default depth for auto-discovered sections (keeps nav manageable) */
const DEFAULT_DISCOVERY_DEPTH = 4;

/**
 * Recursively collect content files from a directory.
 */
async function walkContentDir(
	dir: string,
	urlBase: string,
	section: string,
	sectionBase: string,
	relBase: string,
	depth: number,
	maxDepth: number,
	exclude: string[],
	files: ContentFile[],
): Promise<void> {
	if (depth > maxDepth) return;

	let entries: import("node:fs").Dirent[];
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch {
		return;
	}

	// Sort for consistent cross-platform ordering
	entries.sort((a, b) => a.name.localeCompare(b.name));

	for (const entry of entries) {
		if (entry.name.startsWith(".")) continue;
		const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
		if (matchesExclude(relPath, exclude)) continue;

		if (entry.isDirectory()) {
			await walkContentDir(
				join(dir, entry.name),
				`${urlBase}/${entry.name}`,
				section,
				sectionBase,
				relPath,
				depth + 1,
				maxDepth,
				exclude,
				files,
			);
		} else if (entry.isFile()) {
			const name = entry.name;
			if (!name.endsWith(".md") && !name.endsWith(".yaml") && !name.endsWith(".json")) continue;

			const stem = name.replace(/\.(md|yaml|json)$/, "");
			let urlPath: string;
			if (stem.toLowerCase() === "index" || stem.toLowerCase() === "readme") {
				// Use directory path as URL — parent dir name becomes display name
				urlPath = urlBase;
			} else {
				urlPath = `${urlBase}/${stem}`;
			}

			files.push({
				path: join(dir, name),
				urlPath,
				section,
				sectionBase,
			});
		}
	}
}

function matchesExclude(name: string, patterns: string[]): boolean {
	if (patterns.length === 0) return false;
	return patterns.some((pattern) => globMatch(pattern, name));
}

function globMatch(pattern: string, str: string): boolean {
	const escapeRegex = (s: string) => s.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
	let regexPattern = "";
	for (const ch of pattern) {
		if (ch === "*") regexPattern += "[^/]*";
		else if (ch === "?") regexPattern += "[^/]";
		else regexPattern += escapeRegex(ch);
	}
	const regex = `^${regexPattern}$`;
	return new RegExp(regex).test(str);
}

/**
 * Collect all content files based on config
 */
export async function collectFiles(root: string, config: SiteConfig): Promise<ContentFile[]> {
	const files: ContentFile[] = [];

	for (const section of config.sections) {
		const sectionPath = validatePath(root, config.docroot, section.path);
		if (!sectionPath) continue;

		// Compute URL base from resolved path (handles ../docs/decisions -> docs/decisions)
		const urlBase = toUrlPath(root, sectionPath);

		if (section.files) {
			// Explicit file list (for root-level sections like Overview)
			for (const file of section.files) {
				const filePath = join(sectionPath, file);
				try {
					await stat(filePath);
					const name = file.replace(/\.(md|yaml|json)$/, "");
					files.push({
						path: filePath,
						urlPath: name.toLowerCase(),
						section: section.name,
						sectionBase: urlBase,
					});
				} catch {
					// Skip if doesn't exist
				}
			}
		} else {
			// Auto-discover from directory (recursive)
			const maxDepth = Math.min(
				typeof section.maxDepth === "number" ? section.maxDepth : DEFAULT_DISCOVERY_DEPTH,
				MAX_DISCOVERY_DEPTH,
			);
			await walkContentDir(
				sectionPath,
				urlBase,
				section.name,
				urlBase,
				"",
				0,
				maxDepth,
				section.exclude ?? [],
				files,
			);
		}
	}

	return files;
}

// ---------------------------------------------------------------------------
// Hierarchical navigation tree
// ---------------------------------------------------------------------------

interface NavNode {
	name: string;
	urlPath: string | null; // null for dirs without index.md
	children: NavNode[];
}

/**
 * Derive section URL base from a group of files (fallback when sectionBase not set)
 */
function findSectionBase(urlPaths: string[]): string {
	if (urlPaths.length === 0) return "";
	if (urlPaths.length === 1) {
		const parts = urlPaths[0].split("/");
		return parts.length > 1 ? parts.slice(0, -1).join("/") : "";
	}
	const split = urlPaths.map((p) => p.split("/"));
	let commonLen = 0;
	for (let i = 0; i < Math.min(...split.map((s) => s.length)); i++) {
		if (split.every((s) => s[i] === split[0][i])) commonLen = i + 1;
		else break;
	}
	return split[0].slice(0, commonLen).join("/");
}

/**
 * Build a NavNode tree from a flat file list for one section.
 * Returns the tree and the section root index urlPath (if any).
 */
function buildNavTree(
	files: ContentFile[],
	sectionBase: string,
): { tree: NavNode[]; indexUrlPath: string | null } {
	const root: NavNode = { name: "", urlPath: null, children: [] };
	let indexUrlPath: string | null = null;

	for (const file of files) {
		const rel =
			file.urlPath.length > sectionBase.length ? file.urlPath.slice(sectionBase.length + 1) : "";

		if (rel === "") {
			// Section root index — becomes section header link
			indexUrlPath = file.urlPath;
			continue;
		}

		const segments = rel.split("/");
		let node = root;

		for (let i = 0; i < segments.length; i++) {
			const seg = segments[i];
			const isLeaf = i === segments.length - 1;

			if (isLeaf) {
				const existing = node.children.find((c) => c.name === seg);
				if (existing && existing.children.length > 0 && !existing.urlPath) {
					// Directory node exists without a link — this is its index file
					existing.urlPath = file.urlPath;
				} else {
					node.children.push({ name: seg, urlPath: file.urlPath, children: [] });
				}
			} else {
				let child = node.children.find((c) => c.name === seg);
				if (!child) {
					child = { name: seg, urlPath: null, children: [] };
					node.children.push(child);
				}
				node = child;
			}
		}
	}

	return { tree: root.children, indexUrlPath };
}

function nodeContainsPath(node: NavNode, urlPath: string): boolean {
	if (node.urlPath === urlPath) return true;
	return node.children.some((c) => nodeContainsPath(c, urlPath));
}

/**
 * Render a NavNode tree to HTML with collapsible groups.
 */
function renderNavTree(
	nodes: NavNode[],
	currentUrlPath: string | null,
	makeHref: (urlPath: string) => string,
): string {
	if (nodes.length === 0) return "";

	let html = "<ul>";
	for (const node of nodes) {
		if (node.children.length > 0) {
			// Directory with children — collapsible group
			const isOpen = currentUrlPath ? nodeContainsPath(node, currentUrlPath) : false;
			const open = isOpen ? " open" : "";
			html += `<li><details${open}><summary class="nav-group">`;
			if (node.urlPath) {
				const active = currentUrlPath === node.urlPath ? ' class="active"' : "";
				html += `<a href="${makeHref(node.urlPath)}"${active}>${node.name}</a>`;
			} else {
				html += node.name;
			}
			html += `</summary>`;
			html += renderNavTree(node.children, currentUrlPath, makeHref);
			html += `</details></li>`;
		} else {
			// Leaf file
			const active = currentUrlPath === node.urlPath ? ' class="active"' : "";
			html += `<li><a href="${makeHref(node.urlPath ?? "")}"${active}>${node.name}</a></li>`;
		}
	}
	html += "</ul>";
	return html;
}

/**
 * Build section nav HTML using tree renderer.
 * Shared logic for buildNavSimple and buildNavStatic.
 */
export function buildSectionNav(
	sectionFiles: Map<string, ContentFile[]>,
	config: SiteConfig,
	currentUrlPath: string | null,
	makeHref: (urlPath: string) => string,
): string {
	let html = "";

	// Render sections in config order
	for (const section of config.sections) {
		const items = sectionFiles.get(section.name);
		if (!items || items.length === 0) continue;

		const sBase = items[0]?.sectionBase ?? findSectionBase(items.map((f) => f.urlPath));
		const { tree, indexUrlPath } = buildNavTree(items, sBase);

		// Section header — clickable if section has root index
		if (indexUrlPath) {
			const active = currentUrlPath === indexUrlPath ? ' class="active"' : "";
			html += `<li><a href="${makeHref(indexUrlPath)}"${active} class="nav-section">${section.name}</a>`;
		} else {
			html += `<li><span class="nav-section">${section.name}</span>`;
		}

		html += renderNavTree(tree, currentUrlPath, makeHref);
		html += `</li>`;
	}

	return html;
}

/**
 * Build navigation HTML for dev server (simple, no path prefix)
 */
export function buildNavSimple(
	files: ContentFile[],
	config: SiteConfig,
	currentUrlPath?: string,
): string {
	// Group files by section
	const sectionFiles = new Map<string, ContentFile[]>();
	for (const file of files) {
		if (!sectionFiles.has(file.section)) {
			sectionFiles.set(file.section, []);
		}
		sectionFiles.get(file.section)?.push(file);
	}

	const makeHref = (urlPath: string) => `/${urlPath}`;
	let html = "<ul>";

	if (config.home) {
		html += `<li><a href="/" class="nav-home">Home</a></li>`;
	}

	html += buildSectionNav(sectionFiles, config, currentUrlPath ?? null, makeHref);
	html += "</ul>";

	return html;
}

/**
 * Build navigation HTML for static build (with path prefix and active state)
 */
export function buildNavStatic(
	files: ContentFile[],
	currentKey: string,
	config: SiteConfig,
	pathPrefix: string,
): string {
	// Group files by section
	const sectionFiles = new Map<string, ContentFile[]>();
	for (const file of files) {
		if (!sectionFiles.has(file.section)) {
			sectionFiles.set(file.section, []);
		}
		sectionFiles.get(file.section)?.push(file);
	}

	const makeHref = (urlPath: string) => `${pathPrefix}${urlPath}.html`;
	let html = "<ul>";

	if (config.home) {
		const homeActive = currentKey === "" ? ' class="active"' : "";
		html += `<li><a href="${pathPrefix}index.html"${homeActive} class="nav-home">Home</a></li>`;
	}

	html += buildSectionNav(sectionFiles, config, currentKey || null, makeHref);
	html += "</ul>";

	return html;
}

/**
 * Extract TOC from rendered HTML
 */
export function buildToc(html: string): string {
	const headings: { level: number; id: string; text: string }[] = [];
	const regex = /<h([23])\s+id="([^"]+)"[^>]*>([^<]+)<\/h[23]>/gi;
	let match: RegExpExecArray | null = null;
	while (true) {
		match = regex.exec(html);
		if (match === null) break;
		headings.push({
			level: parseInt(match[1], 10),
			id: match[2],
			text: match[3].trim(),
		});
	}

	if (headings.length < 2) return "";

	let tocHtml = '<aside class="toc"><span class="toc-title">On this page</span><ul>';
	for (const h of headings) {
		const levelClass = h.level === 3 ? ' class="toc-h3"' : "";
		tocHtml += `<li${levelClass}><a href="#${h.id}">${h.text}</a></li>`;
	}
	tocHtml += "</ul></aside>";
	return tocHtml;
}

/**
 * Find the first file in a section that matches the given path prefix
 */
function findFirstFileInSection(files: ContentFile[], pathPrefix: string): ContentFile | undefined {
	return files.find((file) => file.urlPath.startsWith(`${pathPrefix}/`));
}

/**
 * Build breadcrumbs for dev server (simple, no path prefix)
 * Links to first file in each section instead of non-existent index pages
 */
export function buildBreadcrumbsSimple(
	urlPath: string,
	files: ContentFile[],
	_config: SiteConfig,
): string {
	const parts = urlPath.split("/").filter(Boolean);
	if (parts.length <= 1) return "";

	let html = '<nav class="breadcrumbs">';
	let path = "";
	for (let i = 0; i < parts.length - 1; i++) {
		path += (path ? "/" : "") + parts[i];
		const name = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);

		// Find first file in this section to link to
		const firstFile = findFirstFileInSection(files, path);
		const href = firstFile ? `/${firstFile.urlPath}` : `/${path}/`;

		html += `<a href="${href}">${name}</a><span class="separator">›</span>`;
	}
	html += `<span>${parts[parts.length - 1]}</span>`;
	html += "</nav>";
	return html;
}

/**
 * Build breadcrumbs for static build (with path prefix)
 * Links to first file in each section instead of non-existent index pages
 */
export function buildBreadcrumbsStatic(
	urlKey: string,
	pathPrefix: string,
	files: ContentFile[],
	_config: SiteConfig,
): string {
	const parts = urlKey.split("/").filter(Boolean);
	if (parts.length <= 1) return "";

	let html = '<nav class="breadcrumbs">';
	let path = "";
	for (let i = 0; i < parts.length - 1; i++) {
		path += (path ? "/" : "") + parts[i];
		const name = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);

		// Find first file in this section to link to
		const firstFile = findFirstFileInSection(files, path);
		const href = firstFile
			? `${pathPrefix}${firstFile.urlPath}.html`
			: `${pathPrefix}${path}/index.html`;

		html += `<a href="${href}">${name}</a><span class="separator">›</span>`;
	}
	html += `<span>${parts[parts.length - 1]}</span>`;
	html += "</nav>";
	return html;
}

/**
 * Build page meta (last updated date)
 */
export function buildPageMeta(frontmatter: Record<string, unknown>): string {
	const lastUpdated = frontmatter.last_updated as string | undefined;
	if (!lastUpdated) return "";
	const formatted = formatDate(lastUpdated);
	return `<div class="page-meta">Last updated: ${formatted}</div>`;
}

/**
 * Build footer HTML from provenance
 */
export function buildFooter(provenance: Provenance, config: SiteConfig): string {
	const commitDate = formatDate(provenance.gitCommitDate);
	const year = new Date().getFullYear();
	return `
    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-left">
          <span class="footer-version">v${provenance.version}</span>
          <span class="footer-separator">·</span>
          <span class="footer-commit" title="Commit: ${provenance.gitCommit}">${commitDate}</span>
        </div>
        <div class="footer-right">
          <span class="footer-copyright">© ${year} ${config.brand.name}</span>
          <span class="footer-separator">·</span>
          <a href="${config.brand.url}" class="footer-link"${config.brand.external ? ' target="_blank" rel="noopener"' : ""}>${config.brand.url.replace(/^https?:\/\//, "")}</a>
        </div>
      </div>
    </footer>`;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Format date for display (YYYY-MM-DD for consistency)
 */
export function formatDate(isoDate: string): string {
	if (isoDate === "unknown" || isoDate === "dev") return isoDate;
	try {
		const date = new Date(isoDate);
		return date.toISOString().split("T")[0];
	} catch {
		return isoDate;
	}
}

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

/**
 * Get git information
 * @param root - The root directory for git commands
 * @param devMode - If true, use "dev"/"local" defaults; if false, use "unknown" defaults
 */
export async function getGitInfo(
	root: string,
	devMode = false,
): Promise<{
	commit: string;
	commitDate: string;
	branch: string;
}> {
	const defaultInfo = devMode
		? {
				commit: "dev",
				commitDate: new Date().toISOString(),
				branch: "local",
			}
		: {
				commit: "unknown",
				commitDate: "unknown",
				branch: "unknown",
			};

	try {
		async function runGit(args: string[]): Promise<string> {
			const proc = Bun.spawn(["git", ...args], {
				cwd: root,
				stdout: "pipe",
				stderr: "ignore",
			});
			const out = (await new Response(proc.stdout).text()).trim();
			const code = await proc.exited;
			return code === 0 ? out : "";
		}

		const commit = await runGit(["rev-parse", "--short", "HEAD"]);
		const commitDate = await runGit(["log", "-1", "--format=%cI"]);
		const branch = await runGit(["rev-parse", "--abbrev-ref", "HEAD"]);

		return {
			commit: commit || defaultInfo.commit,
			commitDate: commitDate || defaultInfo.commitDate,
			branch: branch || defaultInfo.branch,
		};
	} catch {
		return defaultInfo;
	}
}

/**
 * Generate provenance information
 * @param root - The root directory
 * @param devMode - If true, use dev-friendly defaults
 */
export async function generateProvenance(root: string, devMode = false): Promise<Provenance> {
	let version = "0.0.0";
	try {
		version = (await readFile(join(ENGINE_ROOT, "VERSION"), "utf-8")).trim();
	} catch {
		// Use default
	}
	const gitInfo = await getGitInfo(root, devMode);

	return {
		version,
		buildDate: new Date().toISOString(),
		gitCommit: gitInfo.commit,
		gitCommitDate: gitInfo.commitDate,
		gitBranch: gitInfo.branch,
	};
}

// ---------------------------------------------------------------------------
// Site configuration
// ---------------------------------------------------------------------------

/**
 * Load site configuration with fallback chain
 * @param root - The root directory
 * @param defaultTitle - Default title if no config found (default: "Getting Started")
 */
export async function loadSiteConfig(
	root: string,
	defaultTitle = "Getting Started",
): Promise<SiteConfig> {
	// Try site.yaml first
	try {
		const configPath = join(root, "site.yaml");
		const content = await readFile(configPath, "utf-8");
		const parsed = parseYaml(content) as unknown as SiteConfig;

		// Validate required fields
		if (!parsed.title || !parsed.brand || !parsed.sections) {
			throw new Error("site.yaml missing required fields: title, brand, sections");
		}

		return {
			docroot: parsed.docroot || ".",
			title: parsed.title,
			home: parsed.home as string | undefined,
			brand: {
				...parsed.brand,
				logo: parsed.brand.logo || "assets/brand/logo.png",
				favicon: parsed.brand.favicon || "assets/brand/favicon.png",
				logoType: parsed.brand.logoType || "icon",
			},
			sections: parsed.sections,
			server: parsed.server,
		};
	} catch (e) {
		if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
			throw e;
		}
	}

	// Fallback: check for content/ directory
	try {
		const contentDir = join(root, "content");
		await stat(contentDir);

		// Auto-discover sections from subdirectories
		const entries = await readdir(contentDir, { withFileTypes: true });
		const sections: SiteSection[] = [];

		for (const entry of entries) {
			if (entry.isDirectory()) {
				sections.push({
					name: entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
					path: entry.name,
				});
			}
		}

		if (sections.length > 0) {
			return {
				docroot: "content",
				title: "Documentation",
				brand: { name: "Docs", url: "/" },
				sections,
			};
		}
	} catch {
		// content/ doesn't exist
	}

	// Final fallback
	return {
		docroot: ".",
		title: defaultTitle,
		brand: { name: "Handbook", url: "/" },
		sections: [],
	};
}
