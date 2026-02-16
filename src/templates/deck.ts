/**
 * Deck Template
 *
 * Slides-first template for briefings and presentations.
 * Uses mode: slides with a starter multi-slide markdown file.
 */

import type { TemplateContext, TemplateDef } from "./schema.ts";

export const deck: TemplateDef = {
	id: "deck",
	name: "Presentation Deck",
	description: "Fixed-aspect slides for briefings and presentations",
	version: 1,
	extends: "minimal",
	sections: [
		{
			name: "Slides",
			path: "content/slides",
			description: "Slide content (one file per slide or --- slide --- delimiters)",
		},
	],
	files: [
		{
			path: "site.yaml",
			content: (ctx: TemplateContext) => `# ${ctx.branding.siteName} - Slides Configuration
# Documentation: https://github.com/3leaps/kitfly

title: "${ctx.branding.siteName}"
mode: slides
aspect: "16/9"
# Sections are resolved from repo root by default (docroot: ".")

brand:
  name: "${ctx.branding.brandName}"
  url: "${ctx.branding.brandUrl}"
  # external: false  # Set true if brand URL is external

sections:
  - name: "Slides"
    path: "content/slides"
`,
		},
		{
			path: "index.md",
			content: (ctx: TemplateContext) => `---
title: ${ctx.branding.siteName}
description: ${ctx.branding.siteName} slide deck
---

# ${ctx.branding.siteName}

This site is configured for slides mode.

Run \`kitfly dev\` and use the slide controls to navigate.
`,
		},
		{
			path: "content/slides/briefing.md",
			content: (ctx: TemplateContext) => `---
title: Title
class: title-slide
---

# ${ctx.branding.siteName}

**${ctx.branding.brandName}**

${new Date().toISOString().split("T")[0]}

--- slide ---
---
title: Agenda
---

## Agenda

1. Context
2. Current State
3. Options
4. Recommendation

--- slide ---
---
title: Options
class: two-column
---

## Build vs Buy

**Build In-House**

- Full control
- More setup effort
- Longer implementation timeline

**Buy SaaS**

- Faster launch
- Ongoing subscription cost
- Vendor dependency

--- slide ---
---
title: Architecture
class: diagram
---

## Architecture Snapshot

\`\`\`mermaid
flowchart LR
  A["Users"] --> B["Web App"]
  B --> C["API"]
  C --> D["Data Store"]
\`\`\`

--- slide ---
---
title: Section Break
class: section-header
---

# Recommendation

Preferred path and next actions

--- slide ---
---
title: Summary
---

## Summary

- Current state and trade-offs reviewed
- Recommended path identified
- Next milestone scheduled this quarter
`,
		},
		{
			path: "CUSTOMIZING.md",
			content: (ctx: TemplateContext) => `---
template: deck
template_version: 1
created: ${new Date().toISOString().split("T")[0]}
---

# Customizing ${ctx.branding.siteName}

This template is optimized for \`mode: slides\`.

## Slide Authoring Patterns

You can author slides in either style:

1. One file per slide in \`content/slides/\`
2. One file with explicit delimiters:

\`\`\`markdown
--- slide ---
\`\`\`

## Slide Frontmatter

\`\`\`yaml
---
title: My Slide
class: title-slide
---
\`\`\`

Built-in classes:
- \`title-slide\`
- \`section-header\`
- \`centered\`
- \`two-column\`
- \`diagram\`

## Two-Column Notes

For markdown-only content, \`two-column\` will flow content into columns.
For strict side-by-side control, use explicit HTML wrappers inside the slide body.

## Brand Assets

| Asset | Location | Recommended Size |
|-------|----------|------------------|
| Logo | \`assets/brand/logo.png\` | 200x50px (or SVG) |
| Logo (dark) | \`assets/brand/logo-dark.png\` | Same as logo, for dark backgrounds |
| Favicon | \`assets/brand/favicon.png\` | 32x32px |
| Footer logo | \`assets/brand/footer-logo.png\` | Max height 20px |

### Header Logo

Single logo — kitfly auto-adjusts brightness in dark mode:

\`\`\`yaml
brand:
  logo: "assets/brand/logo.png"
\`\`\`

Light + dark variants — no automatic filters applied:

\`\`\`yaml
brand:
  logo: "assets/brand/logo.png"
  logoDark: "assets/brand/logo-dark.png"
\`\`\`

### Footer Logo

Add a separate logo to the footer ribbon (e.g. a parent company or client logo):

\`\`\`yaml
footer:
  logo: "assets/brand/footer-logo.png"
  logoUrl: "https://example.com"       # optional link
  logoAlt: "Company Name"              # optional alt text
  logoHeight: 20                        # optional max height in px
  logoDark: "assets/brand/footer-logo-dark.png"  # optional dark variant
\`\`\`
`,
		},
	],
};
