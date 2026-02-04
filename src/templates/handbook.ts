/**
 * Handbook Template
 *
 * Extends minimal with structured sections for team handbooks.
 * Sections: Overview, Guides, Reference
 */

import type { TemplateContext, TemplateDef } from "./schema.ts";

export const handbook: TemplateDef = {
	id: "handbook",
	name: "Handbook",
	description: "Team handbook with overview, guides, and reference sections",
	version: 1,
	extends: "minimal",
	sections: [
		{ name: "Overview", path: "content/overview", description: "High-level introduction" },
		{ name: "Guides", path: "content/guides", description: "How-to guides and tutorials" },
		{ name: "Reference", path: "content/reference", description: "Technical reference docs" },
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

# Content sections
sections:
  - name: "Overview"
    path: "content/overview"
  - name: "Guides"
    path: "content/guides"
  - name: "Reference"
    path: "content/reference"

# Home page
home: "index.md"
`,
		},
		{
			path: "index.md",
			content: (ctx: TemplateContext) => `---
title: Home
description: ${ctx.branding.siteName} - Team Handbook
---

# ${ctx.branding.siteName}

Welcome to the ${ctx.branding.brandName} handbook. This is your central resource for documentation, guides, and reference material.

## Sections

### [Overview](/content/overview/introduction)
Start here for an introduction to ${ctx.branding.brandName} and high-level concepts.

### [Guides](/content/guides/getting-started)
Step-by-step tutorials and how-to guides for common tasks.

### [Reference](/content/reference/glossary)
Technical reference documentation and specifications.

---

*Last updated: ${new Date().toISOString().split("T")[0]}*
`,
		},
		{
			path: "content/overview/introduction.md",
			content: (ctx: TemplateContext) => `---
title: Introduction
description: Introduction to ${ctx.branding.siteName}
---

# Introduction

<!-- ← CUSTOMIZE: Replace this content with your overview -->

Welcome to ${ctx.branding.siteName}. This section provides a high-level introduction to help you understand the fundamentals.

## What is ${ctx.branding.brandName}?

Describe your project, team, or organization here.

## Key Concepts

- **Concept 1**: Brief description
- **Concept 2**: Brief description
- **Concept 3**: Brief description

## Next Steps

- Continue to the [Guides](/content/guides/getting-started) for hands-on tutorials
- Check the [Reference](/content/reference/glossary) for detailed specifications
`,
		},
		{
			path: "content/guides/getting-started.md",
			content: (ctx: TemplateContext) => `---
title: Getting Started
description: Get started with ${ctx.branding.siteName}
---

# Getting Started

<!-- ← CUSTOMIZE: Replace this content with your getting started guide -->

This guide walks you through the initial setup and first steps.

## Prerequisites

Before you begin, ensure you have:

- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Step 1: Installation

Describe the installation process here.

\`\`\`bash
# Example command
echo "Hello, ${ctx.branding.brandName}!"
\`\`\`

## Step 2: Configuration

Explain initial configuration steps.

## Step 3: Verify Setup

Show how to verify everything is working.

## Next Steps

Now that you're set up, explore the other guides in this section.
`,
		},
		{
			path: "content/reference/glossary.md",
			content: (ctx: TemplateContext) => `---
title: Glossary
description: ${ctx.branding.siteName} terminology and definitions
---

# Glossary

<!-- ← CUSTOMIZE: Add your project-specific terminology -->

Key terms and definitions used throughout this handbook.

## A

**API**
: Application Programming Interface - a way for software components to communicate.

## B

**Build**
: The process of compiling source files into deployable artifacts.

## C

**Configuration**
: Settings that control how a system behaves.

---

*Add more terms as your documentation grows.*
`,
		},
		{
			path: "CUSTOMIZING.md",
			content: (ctx: TemplateContext) => `---
template: handbook
template_version: 1
created: ${new Date().toISOString().split("T")[0]}
---

# Customizing ${ctx.branding.siteName}

This guide helps you (and AI assistants) understand how to customize this site.

## Site Structure

\`\`\`
${ctx.name}/
├── site.yaml          # Site configuration (sections, branding)
├── theme.yaml         # Theme customization (colors, fonts) - create if needed
├── index.md           # Home page
├── CUSTOMIZING.md     # This file
├── content/           # Your documentation
│   ├── overview/      # High-level concepts
│   ├── guides/        # How-to tutorials
│   └── reference/     # Look-up information
└── assets/
    └── brand/         # Logo, favicon
        ├── logo.png   # Site logo (recommended: 200x50px)
        └── favicon.ico
\`\`\`

## Configuration Files

### site.yaml - Site Configuration

\`\`\`yaml
title: "${ctx.branding.siteName}"

brand:
  name: "${ctx.branding.brandName}"     # Shown in header
  url: "/"                              # Logo link destination
  # external: true                      # Set if URL is external

sections:
  - name: "Overview"                    # Display name in nav
    path: "content/overview"            # Folder path
  # Add more sections here
\`\`\`

### theme.yaml - Visual Customization (optional)

Create \`theme.yaml\` to customize colors and typography:

\`\`\`yaml
colors:
  primary: "#2563eb"      # Links, accents
  background: "#ffffff"   # Page background
  text: "#1f2937"         # Body text

fonts:
  body: "system-ui, sans-serif"
  code: "ui-monospace, monospace"
\`\`\`

## Header and Footer

- **Header**: Shows brand name/logo from \`site.yaml\` + navigation
- **Footer**: Auto-generated with copyright. Customize via \`theme.yaml\`:

\`\`\`yaml
footer:
  text: "© ${ctx.year} ${ctx.branding.brandName}. All rights reserved."
  links:
    - label: "Privacy"
      url: "/privacy"
\`\`\`

## Adding Content

### New Page in Existing Section

1. Create markdown file in the section folder:
   \`\`\`
   content/guides/new-guide.md
   \`\`\`

2. Add frontmatter:
   \`\`\`markdown
   ---
   title: My New Guide
   description: Brief description for SEO
   ---

   # My New Guide

   Content here...
   \`\`\`

### New Section

1. Create folder under \`content/\`:
   \`\`\`
   content/tutorials/
   \`\`\`

2. Add section to \`site.yaml\`:
   \`\`\`yaml
   sections:
     - name: "Tutorials"
       path: "content/tutorials"
   \`\`\`

3. Add at least one markdown file in the new section.

## Linking and References

### Internal Links

Link to other pages using root-relative paths:

\`\`\`markdown
See the [Getting Started](/content/guides/getting-started) guide.
\`\`\`

### External Links

\`\`\`markdown
Visit [Kitfly](https://github.com/3leaps/kitfly) for documentation.
\`\`\`

### Images

Place images in \`assets/\` and reference them:

\`\`\`markdown
![Diagram](/assets/images/architecture.png)
\`\`\`

## Important Limitations

- **Content must be inside this folder** - kitfly cannot include files from outside the site root
- **External files**: Link via URL rather than copying
- **Binary files** (PDFs, images): Place in \`assets/\` and link to them
- **No server-side includes**: This generates static HTML

## Brand Assets

| Asset | Location | Recommended Size |
|-------|----------|------------------|
| Logo | \`assets/brand/logo.png\` | 200x50px (or SVG) |
| Favicon | \`assets/brand/favicon.ico\` | 32x32px |
| Social image | \`assets/brand/social.png\` | 1200x630px |

## Getting Help

- [Kitfly Documentation](https://github.com/3leaps/kitfly)
- [Markdown Guide](https://www.markdownguide.org/)
`,
		},
	],
};
