/**
 * Minimal Template
 *
 * Base template that all others extend.
 * Creates: site.yaml, index.md, .gitignore, README.md
 */

import type { TemplateContext, TemplateDef } from "./schema.ts";

export const minimal: TemplateDef = {
	id: "minimal",
	name: "Minimal",
	description: "Bare-bones site with just the essentials",
	version: 1,
	sections: [
		{ name: "Content", path: "content", description: "Your documentation content" },
		{ name: "Assets", path: "assets/brand", description: "Brand assets (logo, favicon)" },
	],
	files: [
		{
			path: "site.yaml",
			content: (ctx: TemplateContext) => `# ${ctx.branding.siteName} - Site Configuration
# Documentation: https://github.com/3leaps/kitfly

title: "${ctx.branding.siteName}"

# ← CUSTOMIZE: Your brand settings
brand:
  name: "${ctx.branding.brandName}"
  url: "${ctx.branding.brandUrl}"
  # external: false  # Set true if brand URL is external

# ← CUSTOMIZE: Define your content sections
# sections:
#   - name: "Guide"
#     path: "content/guide"
#   - name: "Reference"
#     path: "content/reference"

# ← CUSTOMIZE: Set a dedicated home page (optional)
# home: "index.md"
`,
		},
		{
			path: "index.md",
			content: (ctx: TemplateContext) => `---
title: Welcome
description: ${ctx.branding.siteName} documentation
---

# Welcome to ${ctx.branding.siteName}

This is your documentation site, powered by [Kitfly](https://github.com/3leaps/kitfly).

## Getting Started

1. Edit this file (\`index.md\`) to customize your home page
2. Add markdown files to \`content/\` directory
3. Configure sections in \`site.yaml\`
4. Run \`kitfly dev\` to preview locally
5. Run \`kitfly build\` to generate static HTML

## Quick Links

- [Kitfly Documentation](https://github.com/3leaps/kitfly)
- [Markdown Guide](https://www.markdownguide.org/)
`,
		},
		{
			path: ".gitignore",
			content: () => `# Build output
dist/
bundles/

# Dependencies (if using kitfly as dependency)
node_modules/

# OS files
.DS_Store
Thumbs.db

# Editor
.idea/
.vscode/
*.swp
*~

# Logs
*.log
`,
		},
		{
			path: "README.md",
			content: (ctx: TemplateContext) => `# ${ctx.branding.siteName}

Documentation site built with [Kitfly](https://github.com/3leaps/kitfly).

## Development

\`\`\`bash
# Preview locally with hot reload
kitfly dev

# Build static site
kitfly build

# Create offline bundle
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
`,
		},
		{
			path: "content/.gitkeep",
			content: () => "",
		},
		{
			path: "assets/brand/.gitkeep",
			content: () => "",
		},
	],
};
