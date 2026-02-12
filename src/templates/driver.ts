/**
 * Template Driver - Base Operations
 *
 * Provides common operations for template generation:
 * - Directory creation
 * - File writing with template expansion
 * - Git initialization
 * - Standalone mode (copy site code)
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { crucible } from "./crucible.ts";
import { deck } from "./deck.ts";
import { handbook } from "./handbook.ts";
import { minimal } from "./minimal.ts";
import { pipeline } from "./pipeline.ts";
import { productbook } from "./productbook.ts";
import { runbook } from "./runbook.ts";
import type {
	BrandingConfig,
	InitOptions,
	SiteManifest,
	StandaloneProvenance,
	TemplateContext,
	TemplateDef,
	TemplateFile,
	TemplateRegistry,
} from "./schema.ts";
import { servicebook } from "./servicebook.ts";

// Resolve kitfly root
const __dirname = dirname(fileURLToPath(import.meta.url));
const KITFLY_ROOT = join(__dirname, "../..");

// -----------------------------------------------------------------------------
// Template Registry
// -----------------------------------------------------------------------------

const templates: TemplateRegistry = new Map();

export function registerTemplate(template: TemplateDef): void {
	templates.set(template.id, template);
}

export function getTemplate(id: string): TemplateDef | undefined {
	return templates.get(id);
}

export function listTemplates(): TemplateDef[] {
	return Array.from(templates.values());
}

// Register built-in templates
registerTemplate(minimal);
registerTemplate(deck);
registerTemplate(handbook);
registerTemplate(pipeline);
registerTemplate(productbook);
registerTemplate(runbook);
registerTemplate(servicebook);
registerTemplate(crucible);

// -----------------------------------------------------------------------------
// File Operations
// -----------------------------------------------------------------------------

export async function ensureDir(path: string): Promise<void> {
	await mkdir(path, { recursive: true });
}

export async function writeTemplateFile(
	root: string,
	file: TemplateFile,
	ctx: TemplateContext,
): Promise<void> {
	const filePath = join(root, file.path);
	await ensureDir(dirname(filePath));

	const content = typeof file.content === "function" ? file.content(ctx) : file.content;

	await writeFile(filePath, content, "utf-8");
}

// -----------------------------------------------------------------------------
// Git Operations
// -----------------------------------------------------------------------------

export async function initGit(root: string): Promise<boolean> {
	try {
		const proc = Bun.spawn(["git", "init"], {
			cwd: root,
			stdout: "pipe",
			stderr: "pipe",
		});
		await proc.exited;
		return proc.exitCode === 0;
	} catch {
		return false;
	}
}

export async function gitCommit(root: string, message: string): Promise<boolean> {
	try {
		const add = Bun.spawn(["git", "add", "-A"], { cwd: root, stdout: "ignore", stderr: "ignore" });
		await add.exited;

		const commit = Bun.spawn(["git", "commit", "-m", message], {
			cwd: root,
			stdout: "ignore",
			stderr: "ignore",
		});
		await commit.exited;
		return commit.exitCode === 0;
	} catch {
		return false;
	}
}

// -----------------------------------------------------------------------------
// Branding Defaults
// -----------------------------------------------------------------------------

export function defaultBranding(name: string): BrandingConfig {
	const titleCase = name
		.split(/[-_]/)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");

	return {
		siteName: titleCase,
		brandName: titleCase,
		brandUrl: "/",
		primaryColor: "#2563eb",
		footerText: `© ${new Date().getFullYear()} ${titleCase}`,
	};
}

// -----------------------------------------------------------------------------
// Standalone Mode - Files to Copy
// -----------------------------------------------------------------------------

const STANDALONE_FILES = [
	// Core scripts
	"scripts/dev.ts",
	"scripts/build.ts",
	"scripts/bundle.ts",
	// Shared code
	"src/shared.ts",
	"src/engine.ts",
	"src/theme.ts",
	// Schemas (editor validation + migrations)
	"schemas/README.md",
	"schemas/site.schema.json",
	"schemas/theme.schema.json",
	"schemas/v0/site.schema.json",
	"schemas/v0/theme.schema.json",
	// Site templates and assets
	"src/site/template.html",
	"src/site/styles.css",
];

// Directories to copy entirely
const STANDALONE_DIRS = ["assets"];

function toArrayBuffer(data: Uint8Array): ArrayBuffer {
	// Normalize to a standalone ArrayBuffer to satisfy SubtleCrypto typing.
	return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

async function hashBytes(data: Uint8Array): Promise<string> {
	const hashBuffer = await crypto.subtle.digest("SHA-256", toArrayBuffer(data));
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashContent(content: string): Promise<string> {
	return hashBytes(new TextEncoder().encode(content));
}

async function getKitflyVersion(): Promise<string> {
	try {
		const versionFile = join(KITFLY_ROOT, "VERSION");
		return (await readFile(versionFile, "utf-8")).trim();
	} catch {
		return "0.0.0";
	}
}

async function copyStandaloneFiles(
	root: string,
	ctx: TemplateContext,
): Promise<StandaloneProvenance> {
	const provenance: StandaloneProvenance = {
		kitflyVersion: await getKitflyVersion(),
		createdAt: new Date().toISOString(),
		template: ctx.template.id,
		files: [],
	};

	// Copy individual files
	for (const relPath of STANDALONE_FILES) {
		const srcPath = join(KITFLY_ROOT, relPath);
		const destPath = join(root, relPath);

		try {
			const content = await readFile(srcPath, "utf-8");
			await ensureDir(dirname(destPath));
			await writeFile(destPath, content, "utf-8");
			const localHash = await hashContent(content);

			provenance.files.push({
				path: relPath,
				sourceHash: localHash,
				localHash,
				modified: false,
			});

			console.log(`  + ${relPath} (standalone)`);
		} catch (e) {
			console.warn(`  ! Could not copy ${relPath}: ${e}`);
		}
	}

	// Copy asset directories
	for (const dirName of STANDALONE_DIRS) {
		const srcDir = join(KITFLY_ROOT, dirName);
		const destDir = join(root, dirName);

		try {
			await copyDir(srcDir, destDir, provenance);
		} catch {
			// Directory may not exist, that's ok
		}
	}

	return provenance;
}

async function copyDir(src: string, dest: string, provenance: StandaloneProvenance): Promise<void> {
	const { readdir } = await import("node:fs/promises");

	await ensureDir(dest);
	const entries = await readdir(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDir(srcPath, destPath, provenance);
		} else {
			const content = await readFile(srcPath);
			await writeFile(destPath, content);

			// Get relative path from KITFLY_ROOT for provenance
			const relPath = srcPath.replace(`${KITFLY_ROOT}/`, "");
			const bytes = new Uint8Array(content);
			const localHash = await hashBytes(bytes);
			provenance.files.push({
				path: relPath,
				sourceHash: localHash,
				localHash,
				modified: false,
			});
		}
	}
}

function ensureYamlSchemaComment(content: string, schemaPath: string): string {
	const lines = content.split("\n");
	const desired = `# yaml-language-server: $schema=${schemaPath}`;
	if (lines[0]?.startsWith("# yaml-language-server:")) {
		lines[0] = desired;
		return lines.join("\n");
	}
	return `${desired}\n${content}`;
}

function ensureSiteSchemaVersion(content: string, version: string): string {
	if (/^schemaVersion\s*:/m.test(content)) return content;
	const lines = content.split("\n");
	const insertLine = `schemaVersion: "${version}"`;
	if (lines[0]?.startsWith("# yaml-language-server:")) {
		lines.splice(1, 0, insertLine);
		return lines.join("\n");
	}
	return `${insertLine}\n${content}`;
}

async function stampSchemaVersion(root: string, version: string): Promise<void> {
	const sitePath = join(root, "site.yaml");
	try {
		let content = await readFile(sitePath, "utf-8");
		content = ensureYamlSchemaComment(content, "./schemas/v0/site.schema.json");
		content = ensureSiteSchemaVersion(content, version);
		await writeFile(sitePath, content, "utf-8");
	} catch {
		// site.yaml may not exist; ignore
	}

	const themePath = join(root, "theme.yaml");
	try {
		let content = await readFile(themePath, "utf-8");
		content = ensureYamlSchemaComment(content, "./schemas/v0/theme.schema.json");
		await writeFile(themePath, content, "utf-8");
	} catch {
		// theme.yaml may not exist; ignore
	}
}

function generateStandalonePackageJson(ctx: TemplateContext): string {
	return JSON.stringify(
		{
			name: ctx.name,
			version: "0.1.0",
			type: "module",
			description: ctx.branding.siteName,
			scripts: {
				dev: "bun run scripts/dev.ts",
				build: "bun run scripts/build.ts",
				bundle: "bun run scripts/bundle.ts",
			},
			dependencies: {
				marked: "^15.0.0",
			},
			devDependencies: {
				"@types/bun": "^1.2.0",
			},
		},
		null,
		2,
	);
}

function generateStandaloneReadme(ctx: TemplateContext): string {
	return `# ${ctx.branding.siteName}

Documentation site built with [Kitfly](https://github.com/3leaps/kitfly) (standalone mode).

## Prerequisites

### Install Bun

This site uses [Bun](https://bun.sh) as its JavaScript runtime.

**macOS/Linux:**
\`\`\`bash
curl -fsSL https://bun.sh/install | bash
\`\`\`

**Windows:**
\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

For other installation methods, see: https://bun.sh/docs/installation

### Install Dependencies

\`\`\`bash
bun install
\`\`\`

## Development

\`\`\`bash
# Preview locally with hot reload
bun run dev

# Build static site to dist/
bun run build

# Create offline bundle (single HTML file)
bun run bundle
\`\`\`

## Structure

\`\`\`
${ctx.name}/
├── site.yaml          # Site configuration
├── theme.yaml         # Theme customization (optional)
├── index.md           # Home page
├── content/           # Documentation content
├── assets/            # Static assets (images, brand files)
├── scripts/           # Build scripts (standalone)
│   ├── dev.ts         # Development server
│   ├── build.ts       # Static site generator
│   └── bundle.ts      # Single-file bundler
└── src/               # Site engine (standalone)
    ├── shared.ts      # Shared utilities
    ├── engine.ts      # Engine paths
    ├── theme.ts       # Theme system
    └── site/          # HTML template & styles
\`\`\`

## Customization

- Edit \`site.yaml\` to configure sections and branding
- Add a \`theme.yaml\` for color/typography customization
- Replace files in \`assets/brand/\` with your logo and favicon

## Standalone Mode

This site was created with \`--standalone\` flag, meaning all build tooling is included.
No external kitfly installation is required.

See \`.kitfly/provenance.json\` for version tracking.

---
© ${ctx.year} ${ctx.branding.brandName}
`;
}

function generateDependentReadme(ctx: TemplateContext): string {
	return `# ${ctx.branding.siteName}

Documentation site built with [Kitfly](https://github.com/3leaps/kitfly).

## Prerequisites

### Install Bun

This site uses [Bun](https://bun.sh) as its JavaScript runtime.

**macOS/Linux:**
\`\`\`bash
curl -fsSL https://bun.sh/install | bash
\`\`\`

**Windows:**
\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

### Install Kitfly

\`\`\`bash
# Via npm/bun
bun install -g kitfly

# Or clone and link
git clone https://github.com/3leaps/kitfly.git
cd kitfly && bun link
\`\`\`

## Development

\`\`\`bash
# Preview locally with hot reload
kitfly dev

# Build static site to dist/
kitfly build

# Create offline bundle (single HTML file)
kitfly bundle
\`\`\`

## Structure

\`\`\`
${ctx.name}/
├── site.yaml      # Site configuration
├── index.md       # Home page
├── content/       # Documentation content
└── assets/brand/  # Logo, favicon, etc.
\`\`\`

## Customization

- Edit \`site.yaml\` to configure sections and branding
- Add a \`theme.yaml\` for color/typography customization
- Replace \`assets/brand/\` files with your logo

---
© ${ctx.year} ${ctx.branding.brandName}
`;
}

// -----------------------------------------------------------------------------
// AI Assistance Instrumentation
// -----------------------------------------------------------------------------

function generateAgentsMd(ctx: TemplateContext): string {
	const templateType = ctx.template.id;
	const isOperational = templateType === "runbook" || templateType === "pipeline";
	const isPipeline = templateType === "pipeline";
	const isProductbook = templateType === "productbook";
	const isServicebook = templateType === "servicebook";
	const isCrucible = templateType === "crucible";

	const typeLabel = isCrucible
		? "information architecture SSOT"
		: isServicebook
			? "professional services catalog"
			: isProductbook
				? "product and domain documentation site"
				: isPipeline
					? "pipeline operations site"
					: templateType === "runbook"
						? "runbook"
						: "documentation site";

	return `# ${ctx.branding.siteName} - AI Agent Guide

## Overview

This ${typeLabel} is instrumented for AI assistance. AI coding assistants can help maintain and extend this documentation.

## Site Structure

See \`CUSTOMIZING.md\` for full details on:
- Adding new pages and sections
- Configuration options
- Linking conventions
- Brand assets

## Content Guidelines

${
	isCrucible
		? `### Specs
- Use **RFC 2119 language** (MUST, SHOULD, MAY) for requirements
- Include **version and status** in every specification
- Provide **compliant and non-compliant examples**
- State scope explicitly — what is and isn't covered

### Schemas
- Document **purpose, fields, and examples** for each schema
- Link to the raw \`.schema.json\` file in \`schemas/\`
- Note **breaking change policy** and version compatibility
- Include sample valid documents

### Config
- Document **valid values and defaults** for every config entry
- Explain what each config controls and who consumes it
- Link to the validating schema (if any)

### Policies
- Be prescriptive — use **MUST/SHOULD/MAY** language
- Include **rationale** for each rule
- Define **consequences** for non-compliance
- State review and approval requirements`
		: isServicebook
			? `### Offerings
- State the **client problem** before describing the service
- Define **deliverables** with format, content, and audience
- Include **scoping criteria** so engagements are sized consistently
- Link to relevant methodology phases and delivery templates

### Methodology
- Document phases with **inputs, activities, and outputs**
- Tools should include purpose, capabilities, and when they're used
- Frameworks need clear **scoring criteria and limitations**
- Record methodology changes as decision records (MDRs)

### Delivery
- Engagement lifecycle needs **quality gates** between each stage
- Quality gates need **specific, checkable criteria**
- Deliverable templates should be ready to use, not just described
- Document onboarding as a checklist with clear prerequisites

### Case Studies
- Always **anonymize** unless client has approved attribution
- **Quantify outcomes** where possible
- Include **lessons learned** — what you'd do differently
- Link to relevant verticals and methodology`
			: isProductbook
				? `### Product
- State the **user problem** before the solution
- Include **acceptance criteria** and **success metrics**
- Link to related domain context and specs

### Domain
- Write for someone **new to the business** — explain why, not just what
- Be precise with terminology — the **data dictionary is canonical**
- Document **edge cases and variations**, not just happy paths
- Business processes need: triggers, steps, actors, systems, business rules

### Planning
- **Decisions**: capture context and alternatives, not just the choice
- **Specs**: problem first, solution second, acceptance criteria always
- **Research**: state methodology and limitations

### Guides
- Write for the audience (team member vs end user)
- Start with what they need to know first`
				: isPipeline
					? `### Pipeline Stages
- Start with **Objective** (what this stage accomplishes)
- List **Prerequisites** as checkboxes
- Number **Steps** explicitly with verification
- Include expected outputs and verification commands

### Sources & Destinations
- Document connection details, auth profiles, data formats
- Keep index tables in \`index.md\` up to date
- Include schema or path structure documentation

### Troubleshooting
- Lead with **Symptoms** (what user observes)
- List **Possible Causes**
- Provide step-by-step **Resolution**
- Include **Prevention** guidance

### Checklists
- Use checkbox format: \`- [ ] Item\`
- Group by phase or category
- Include Go/No-Go decision point`
					: isOperational
						? `### Procedures
- Start with **Objective** (what this accomplishes)
- List **Prerequisites** as checkboxes
- Number **Steps** explicitly with verification
- Include expected outputs
- Always provide **Rollback** section

### Troubleshooting
- Lead with **Symptoms** (what user observes)
- List **Possible Causes**
- Provide step-by-step **Resolution**
- Include **Escalation** path

### Checklists
- Use checkbox format: \`- [ ] Item\`
- Group by phase or category
- Include Go/No-Go decision point`
						: `### General Guidelines
- Use clear, descriptive headings
- Include code examples where helpful
- Link related content using relative paths
- Mark placeholder content with \`<!-- ← CUSTOMIZE -->\``
}

## AI Assistant Instructions

When working on this site:

1. **Read \`CUSTOMIZING.md\` first** - Understand the structure before making changes
2. **Follow existing patterns** - Match the style of existing content
3. **Check \`.kitfly/manifest.json\`** - Know which template was used
4. **Respect limitations** - Content must be inside this folder; link external resources via URL
5. **Preserve frontmatter** - Every markdown file needs title and description

## Roles

${
	isCrucible
		? `Recommended roles for crucible maintenance:
- \`infoarch\` - Information architecture, standards structure, consistency
- \`devlead\` - Schema design, config catalogs, technical standards
- \`advisor\` - Governance, policy design, strategic decisions
- \`analyst\` - Research, gap analysis, ecosystem assessment
- \`qa\` - Validation, compliance checking, review`
		: isServicebook
			? `Recommended roles for servicebook maintenance:
- \`prodstrat\` - Service strategy, offering design, market positioning
- \`advisor\` - Client engagement, industry expertise, methodology
- \`analyst\` - Research, frameworks, case study analysis
- \`devlead\` - Delivery operations, tooling, quality processes
- \`infoarch\` - Documentation structure, consistency`
			: isProductbook
				? `Recommended roles for productbook maintenance:
- \`prodstrat\` - Product direction, roadmap, feature prioritization
- \`advisor\` - Domain knowledge, business context, strategic decisions
- \`analyst\` - Research, data modeling, business process analysis
- \`devlead\` - Architecture, operations, implementation
- \`infoarch\` - Documentation structure, consistency`
				: isOperational
					? `Recommended roles for ${isPipeline ? "pipeline operations" : "runbook"} maintenance:
- \`devlead\` - Implementation, fixing procedures
- \`infoarch\` - Documentation structure, organization
- \`qa\` - Testing, validation, checklists`
					: `Recommended roles for documentation:
- \`devlead\` - Technical content, code examples
- \`infoarch\` - Structure, navigation, organization
- \`prodmktg\` - Messaging, user-facing content`
}

See \`config/agentic/roles/\` for role definitions (if present).

## Quick Reference

| Task | Location |
|------|----------|
| Site config | \`site.yaml\` |
| Theme/styling | \`theme.yaml\` (create if needed) |
| Add content | \`content/<section>/\` |
| Brand assets | \`assets/brand/\` |
| AI instructions | This file (\`AGENTS.md\`) |
| Customization guide | \`CUSTOMIZING.md\` |

---

*Generated by kitfly from ${templateType} template*
`;
}

async function addAiAssistInstrumentation(root: string, ctx: TemplateContext): Promise<void> {
	// Generate AGENTS.md
	const agentsMd = generateAgentsMd(ctx);
	await writeFile(join(root, "AGENTS.md"), agentsMd, "utf-8");
	console.log(`  + AGENTS.md (AI assistance)`);

	// Copy relevant roles from kitfly's config
	const rolesSource = join(KITFLY_ROOT, "config/agentic/roles");
	const rolesTarget = join(root, "config/agentic/roles");

	try {
		const { readdir } = await import("node:fs/promises");
		const entries = await readdir(rolesSource);

		// Select roles relevant to documentation work
		const relevantRoles = ["devlead.yaml", "infoarch.yaml", "qa.yaml", "README.md"];
		if (ctx.template.id === "crucible") {
			relevantRoles.push("advisor.yaml", "analyst.yaml");
		} else if (ctx.template.id === "productbook" || ctx.template.id === "servicebook") {
			relevantRoles.push("prodstrat.yaml", "advisor.yaml", "analyst.yaml");
		} else if (ctx.template.id !== "runbook" && ctx.template.id !== "pipeline") {
			relevantRoles.push("prodmktg.yaml");
		}

		await ensureDir(rolesTarget);

		for (const entry of entries) {
			if (relevantRoles.includes(entry)) {
				const srcPath = join(rolesSource, entry);
				const destPath = join(rolesTarget, entry);
				const content = await readFile(srcPath, "utf-8");
				await writeFile(destPath, content, "utf-8");
			}
		}
		console.log(`  + config/agentic/roles/ (${relevantRoles.length} files)`);
	} catch {
		// Roles directory not found - skip silently
		console.log(`  ! config/agentic/roles/ not copied (source not found)`);
	}
}

// -----------------------------------------------------------------------------
// Template Execution
// -----------------------------------------------------------------------------

export async function runTemplate(options: InitOptions): Promise<void> {
	const template = getTemplate(options.template);
	if (!template) {
		throw new Error(`Unknown template: ${options.template}`);
	}

	// Resolve inheritance chain
	const chain = resolveTemplateChain(template);

	// Build context
	const branding: BrandingConfig = {
		...defaultBranding(options.name),
		...options.branding,
	};

	const ctx: TemplateContext = {
		name: options.name,
		branding,
		template,
		year: new Date().getFullYear(),
	};

	const root = join(process.cwd(), options.name);
	const modeLabel = options.standalone ? "standalone" : "standard";

	console.log(`Creating ${template.name} site (${modeLabel}): ${options.name}/\n`);

	// Create root directory
	await ensureDir(root);

	// Create sections from all templates in chain
	for (const tpl of chain) {
		for (const section of tpl.sections) {
			const sectionPath = join(root, section.path);
			await ensureDir(sectionPath);
			console.log(`  + ${section.path}/`);
		}
	}

	// Write files from all templates in chain (except README which we handle specially)
	for (const tpl of chain) {
		for (const file of tpl.files) {
			if (file.path === "README.md") continue; // Skip, we generate mode-specific README
			await writeTemplateFile(root, file, ctx);
			console.log(`  + ${file.path}`);
		}
	}

	// Generate mode-specific README
	const readme = options.standalone ? generateStandaloneReadme(ctx) : generateDependentReadme(ctx);
	await writeFile(join(root, "README.md"), readme, "utf-8");
	console.log(`  + README.md`);

	// Create .kitfly/ metadata folder with manifest (for all sites)
	const kitflyVersion = await getKitflyVersion();
	const manifest: SiteManifest = {
		template: template.id,
		templateVersion: template.version,
		created: new Date().toISOString(),
		kitflyVersion,
		standalone: options.standalone ?? false,
		schemaVersion: kitflyVersion,
	};
	await ensureDir(join(root, ".kitfly"));
	await writeFile(join(root, ".kitfly/manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");
	console.log(`  + .kitfly/manifest.json`);

	// Handle standalone mode
	if (options.standalone) {
		// Copy site code
		const provenance = await copyStandaloneFiles(root, ctx);
		await stampSchemaVersion(root, kitflyVersion);

		// Write standalone package.json
		const packageJson = generateStandalonePackageJson(ctx);
		await writeFile(join(root, "package.json"), packageJson, "utf-8");
		console.log(`  + package.json (standalone)`);

		// Write provenance
		await writeFile(
			join(root, ".kitfly/provenance.json"),
			JSON.stringify(provenance, null, 2),
			"utf-8",
		);
		console.log(`  + .kitfly/provenance.json`);
	}

	// Add AI assistance instrumentation if requested
	if (options.aiAssist) {
		await addAiAssistInstrumentation(root, ctx);
	}

	// Initialize git if requested
	if (options.git !== false) {
		const gitOk = await initGit(root);
		if (gitOk) {
			await gitCommit(root, "Initial commit from kitfly init");
			console.log(`  + .git/ (initialized)`);
		}
	}

	console.log(`\n✓ Site created at ${options.name}/`);
	console.log(`\nNext steps:`);
	console.log(`  cd ${options.name}`);

	if (options.standalone) {
		console.log(`  bun install`);
		console.log(`  bun run dev`);
	} else {
		console.log(`  kitfly dev`);
	}
}

// -----------------------------------------------------------------------------
// Template Inheritance
// -----------------------------------------------------------------------------

function resolveTemplateChain(template: TemplateDef): TemplateDef[] {
	const chain: TemplateDef[] = [];
	let current: TemplateDef | undefined = template;

	while (current) {
		chain.unshift(current); // Add to front (base first)
		if (current.extends) {
			current = getTemplate(current.extends);
		} else {
			current = undefined;
		}
	}

	return chain;
}
