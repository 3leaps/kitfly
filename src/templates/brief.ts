/**
 * Brief Template
 *
 * Extends minimal with structured sections for external-facing backgrounders.
 * Sections: Product, Use Cases, Getting Started, Reference
 */

import type { TemplateContext, TemplateDef } from "./schema.ts";

export const brief: TemplateDef = {
	id: "brief",
	name: "Brief",
	description: "External-facing product, platform, or service brief for clients and partners",
	version: 1,
	extends: "minimal",
	sections: [
		{
			name: "Product",
			path: "content/product",
			description: "What it is and what it does",
		},
		{
			name: "Use Cases",
			path: "content/use-cases",
			description: "Why it matters to the reader",
		},
		{
			name: "Getting Started",
			path: "content/getting-started",
			description: "What adoption looks like",
		},
		{
			name: "Reference",
			path: "content/reference",
			description: "Look-up material and contacts",
		},
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
  - name: "Product"
    path: "content/product"
  - name: "Use Cases"
    path: "content/use-cases"
  - name: "Getting Started"
    path: "content/getting-started"
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
description: ${ctx.branding.siteName}
---

# ${ctx.branding.siteName}

<!-- ← CUSTOMIZE: Replace with your product/platform executive summary -->

A brief introduction to [Product Name] - what it does, who it serves, and why it matters.

## At a Glance

| | |
|---|---|
| **What** | One-line description of the product/platform |
| **For** | Target audience or customer segments |
| **Key Value** | Primary benefit or differentiator |

## Sections

### [Product](/content/product/overview)
What it is, what it does, and how it works.

### [Use Cases](/content/use-cases/overview)
How different customer types benefit from the platform.

### [Getting Started](/content/getting-started/overview)
What adoption and onboarding look like.

### [Reference](/content/reference/architecture)
Technical architecture, integrations, FAQ, and contacts.
`,
		},
		{
			path: "content/product/overview.md",
			content: (ctx: TemplateContext) => `---
title: Overview
description: What ${ctx.branding.siteName} is and who it's for
---

# Product Overview

<!-- ← CUSTOMIZE: Replace with your product description -->

## What It Is

Describe the product or platform in 2-3 sentences. Focus on what it does
for the customer, not how it's built.

## Who It's For

| Audience | How They Use It |
|----------|----------------|
| Business leaders | Strategic dashboards and trend analysis |
| Operations teams | Day-to-day monitoring and alerting |
| Technical staff | Integration, configuration, data access |

## Key Differentiators

- **Differentiator 1**: Brief explanation
- **Differentiator 2**: Brief explanation
- **Differentiator 3**: Brief explanation
`,
		},
		{
			path: "content/product/capabilities.md",
			content: (ctx: TemplateContext) => `---
title: Capabilities
description: ${ctx.branding.siteName} capability areas
---

# Capabilities

<!-- ← CUSTOMIZE: Replace with your product's capability areas -->

## Capability Area 1

What this capability does and what business outcome it enables.

**Key features:**
- Feature A
- Feature B
- Feature C

## Capability Area 2

What this capability does and what business outcome it enables.

**Key features:**
- Feature D
- Feature E

## Capability Area 3

What this capability does and what business outcome it enables.
`,
		},
		{
			path: "content/use-cases/overview.md",
			content: (ctx: TemplateContext) => `---
title: Use Cases
description: How different customer types benefit from ${ctx.branding.siteName}
---

# Use Cases

<!-- ← CUSTOMIZE: Replace with your actual use cases -->

## Who Benefits

| Customer Profile | Primary Use Case | Key Outcome |
|-----------------|-----------------|-------------|
| Profile A | What they do with it | What they gain |
| Profile B | What they do with it | What they gain |
| Profile C | What they do with it | What they gain |

## Explore Use Cases

- [Example Use Case](/content/use-cases/example-use-case) - Detailed walkthrough
`,
		},
		{
			path: "content/use-cases/example-use-case.md",
			content: (ctx: TemplateContext) => `---
title: Example Use Case
description: A sample use case for ${ctx.branding.siteName}
---

# Example Use Case

<!-- ← CUSTOMIZE: Replace with a real use case. Duplicate this file for each use case. -->

## Scenario

Describe the customer situation and challenge.

## How ${ctx.branding.brandName} Helps

Walk through how the product addresses this scenario.

## Outcome

What the customer achieves - quantify where possible.

| Metric | Before | After |
|--------|--------|-------|
| Metric 1 | Baseline | Improved |
| Metric 2 | Baseline | Improved |
`,
		},
		{
			path: "content/getting-started/overview.md",
			content: (ctx: TemplateContext) => `---
title: Getting Started
description: What onboarding looks like for ${ctx.branding.siteName}
---

# Getting Started

<!-- ← CUSTOMIZE: Replace with your onboarding process -->

## Onboarding Process

A typical implementation follows these phases:

| Phase | Duration | What Happens |
|-------|----------|--------------|
| Discovery | 1-2 weeks | Requirements gathering, scope alignment |
| Setup | 2-4 weeks | Environment provisioning, data integration |
| Validation | 1-2 weeks | Testing, user acceptance |
| Go-Live | 1 week | Launch, training, handoff |

## What You'll Need

See [Requirements](/content/getting-started/requirements) for prerequisites
and integration details.
`,
		},
		{
			path: "content/getting-started/requirements.md",
			content: (ctx: TemplateContext) => `---
title: Requirements
description: Prerequisites and integration requirements for ${ctx.branding.siteName}
---

# Requirements

<!-- ← CUSTOMIZE: Replace with your actual requirements -->

## Prerequisites

- [ ] Prerequisite 1
- [ ] Prerequisite 2
- [ ] Prerequisite 3

## Integrations

| System | Purpose | Required? |
|--------|---------|-----------|
| System A | Data source | Yes |
| System B | Authentication | Yes |
| System C | Reporting export | Optional |

## Timeline

Typical implementation takes **4-8 weeks** depending on scope and
data integration complexity.
`,
		},
		{
			path: "content/reference/architecture.md",
			content: (ctx: TemplateContext) => `---
title: Architecture
description: High-level technical architecture of ${ctx.branding.siteName}
---

# Architecture

<!-- ← CUSTOMIZE: Replace with your actual architecture overview -->

## High-Level Overview

Describe the major components and how they connect at a level appropriate
for a technical audience evaluating the platform.

## Key Design Principles

- **Principle 1**: Brief explanation
- **Principle 2**: Brief explanation

## Data Flow

Describe how data moves through the system at a high level.

## Security and Compliance

Summarize the security posture and any compliance certifications.
`,
		},
		{
			path: "content/reference/faq.md",
			content: (ctx: TemplateContext) => `---
title: FAQ
description: Frequently asked questions about ${ctx.branding.siteName}
---

# Frequently Asked Questions

<!-- ← CUSTOMIZE: Replace with your actual FAQs -->

## General

**Q: What is ${ctx.branding.brandName}?**
A: One-sentence answer.

**Q: Who is it for?**
A: Target audience description.

## Technical

**Q: What are the system requirements?**
A: See [Requirements](/content/getting-started/requirements).

**Q: How does it integrate with our existing systems?**
A: Brief answer with link to architecture page.

## Getting Started

**Q: How long does implementation take?**
A: Typical timelines and what affects them.

**Q: What support is available?**
A: Support model description.
`,
		},
		{
			path: "content/reference/contacts.md",
			content: (ctx: TemplateContext) => `---
title: Contacts
description: Who to talk to about ${ctx.branding.siteName}
---

# Contacts

<!-- ← CUSTOMIZE: Replace with your actual contacts -->

| Role | Name | Email | When to Contact |
|------|------|-------|-----------------|
| Account Lead | Name | email@example.com | General inquiries, commercial |
| Technical Lead | Name | email@example.com | Architecture, integrations |
| Support | Team | support@example.com | Issues, troubleshooting |

## Additional Resources

- **Documentation**: Link to detailed technical docs (if separate)
- **Support Portal**: Link to ticketing system
- **Status Page**: Link to uptime/status monitoring
`,
		},
		{
			path: "CUSTOMIZING.md",
			content: (ctx: TemplateContext) => `---
template: brief
template_version: 1
created: ${new Date().toISOString().split("T")[0]}
---

# Customizing ${ctx.branding.siteName}

This guide helps you customize this brief for external audiences.

## Template Purpose

The \`brief\` template is designed for clients, prospects, and partners.
Use it to communicate what you offer, why it matters, and how to get started.

Tone guidance:
- Informational and professional
- Clear and specific
- Not sales copy and not internal jargon

## Section Structure

This template ships with four sections:

1. **Product** - What it is and what it does
2. **Use Cases** - Why it matters for different customer profiles
3. **Getting Started** - Requirements and onboarding timeline
4. **Reference** - Architecture, FAQ, and contacts

## Starter Files

Use these as working templates, not final content:

- \`content/product/overview.md\`
- \`content/product/capabilities.md\`
- \`content/use-cases/overview.md\`
- \`content/use-cases/example-use-case.md\` (duplicate per use case)
- \`content/getting-started/overview.md\`
- \`content/getting-started/requirements.md\`
- \`content/reference/architecture.md\`
- \`content/reference/faq.md\`
- \`content/reference/contacts.md\`

All placeholders are marked with \`<!-- ← CUSTOMIZE -->\`.

## Adding Use Cases

To add a new use case:

1. Duplicate \`content/use-cases/example-use-case.md\`
2. Rename it to match the customer scenario
3. Use this structure: problem -> solution -> outcome
4. Add a link from \`content/use-cases/overview.md\`

## Visual Content

For external readers, visuals improve understanding:

- Product screenshots for key workflows
- Simple architecture diagrams for technical evaluators
- Tables for timelines, requirements, and measurable outcomes

Store assets in \`assets/\` and reference them with root-relative paths.

## Brand Assets

| Asset | Location | Recommended Size |
|-------|----------|------------------|
| Logo | \`assets/brand/logo.png\` | 200x50px (or SVG) |
| Logo (dark) | \`assets/brand/logo-dark.png\` | Same as logo, for dark backgrounds |
| Favicon | \`assets/brand/favicon.ico\` | 32x32px |
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

## Final Review Checklist

Before sharing this brief:

- [ ] Replace all placeholder text and examples
- [ ] Validate audience-specific use cases and outcomes
- [ ] Confirm onboarding steps and timeline are accurate
- [ ] Verify contacts and support links
- [ ] Check tone: factual, concise, and non-promotional
`,
		},
	],
};
