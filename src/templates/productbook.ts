/**
 * Productbook Template
 *
 * Extends minimal with structured sections for product and domain documentation.
 * Designed for greenfield client engagements with complex business processes.
 * Sections: Product, Domain, Planning, Operations, Guides, Reference
 */

import type { TemplateContext, TemplateDef } from "./schema.ts";

export const productbook: TemplateDef = {
	id: "productbook",
	name: "Productbook",
	description: "Product and domain documentation for complex greenfield engagements",
	version: 1,
	extends: "minimal",
	sections: [
		{
			name: "Product",
			path: "content/product",
			description: "Product overview, features, user guides, release notes",
		},
		{
			name: "Domain",
			path: "content/domain",
			description: "Business processes, terminology, industry context, data dictionary",
		},
		{
			name: "Planning",
			path: "content/planning",
			description: "Roadmap, specifications, decisions (ADRs), research",
		},
		{
			name: "Operations",
			path: "content/operations",
			description: "Deployment, environments, configuration",
		},
		{
			name: "Guides",
			path: "content/guides",
			description: "Onboarding, how-tos, tutorials (user-facing)",
		},
		{
			name: "Reference",
			path: "content/reference",
			description: "Architecture, integrations, data models, contacts, metrics",
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
  - name: "Domain"
    path: "content/domain"
  - name: "Planning"
    path: "content/planning"
  - name: "Operations"
    path: "content/operations"
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
description: ${ctx.branding.siteName} - Product & Domain Documentation
---

# ${ctx.branding.siteName}

Product and domain documentation for ${ctx.branding.brandName}.

## Product

| Area | Description | Status |
|------|-------------|--------|
| Core Platform | <!-- primary product capability --> | Planning |
| Integrations | <!-- external system connections --> | Discovery |
| User Experience | <!-- end-user workflows --> | Discovery |

## Quick Links

### [Product Overview](/content/product/overview)
Vision, target users, key capabilities, and success metrics.

### [Domain Model](/content/domain/overview)
Business context, key concepts, and domain complexity.

### [Roadmap](/content/planning/roadmap)
Current priorities, phases, and decision rationale.

### [Getting Started](/content/guides/getting-started)
Onboarding for new team members and AI agents.

---

*Last updated: ${new Date().toISOString().split("T")[0]}*
`,
		},
		// ---------------------------------------------------------------
		// Product section
		// ---------------------------------------------------------------
		{
			path: "content/product/overview.md",
			content: (ctx: TemplateContext) => `---
title: Product Overview
description: Vision, users, and capabilities for ${ctx.branding.brandName}
---

# Product Overview

<!-- ← CUSTOMIZE: Replace with your product details -->

## Vision

<!-- What is this product and why does it exist? -->

## Target Users

| User | Role | Primary Need |
|------|------|-------------|
| <!-- user type --> | <!-- role --> | <!-- what they need --> |

## Key Capabilities

### 1. <!-- Capability Name -->

<!-- Description, value proposition -->

### 2. <!-- Capability Name -->

<!-- Description, value proposition -->

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|-------------|
| <!-- metric --> | <!-- target --> | <!-- measurement approach --> |

## Related

- [Domain Overview](/content/domain/overview) — business context
- [Roadmap](/content/planning/roadmap) — what we're building and when
`,
		},
		{
			path: "content/product/features/index.md",
			content: (ctx: TemplateContext) => `---
title: Features
description: Feature catalog for ${ctx.branding.brandName}
---

# Features

<!-- ← CUSTOMIZE: Add features as they are defined -->

| Feature | Status | Description | Spec |
|---------|--------|-------------|------|
| <!-- feature name --> | Planning / In Progress / Shipped | <!-- brief description --> | [Link](./feature-name) |

## Adding a Feature

1. Create a file in \`content/product/features/\`
2. Include: problem statement, user stories, acceptance criteria, success metrics
3. Update this index table
4. Link to the relevant spec in [Planning](/content/planning/specs/)
`,
		},
		{
			path: "content/product/releases/index.md",
			content: (ctx: TemplateContext) => `---
title: Releases
description: Release history for ${ctx.branding.brandName}
---

# Releases

<!-- ← CUSTOMIZE: Add releases as they ship -->

| Version | Date | Highlights |
|---------|------|------------|
| <!-- v0.1.0 --> | <!-- YYYY-MM-DD --> | <!-- key changes --> |

## Release Process

1. Feature complete and acceptance criteria met
2. Release notes drafted
3. Deployment per [Operations](/content/operations/deployment)
4. Update this log
`,
		},
		// ---------------------------------------------------------------
		// Domain section
		// ---------------------------------------------------------------
		{
			path: "content/domain/overview.md",
			content: (ctx: TemplateContext) => `---
title: Domain Overview
description: Business domain context for ${ctx.branding.brandName}
---

# Domain Overview

<!-- ← CUSTOMIZE: This is the most important section for complex engagements.
     Capture the business reality that shapes every product decision. -->

## What Is This Domain?

<!-- What business domain does this product operate in?
     Why is it complex? What makes it non-obvious? -->

## Key Concepts

| Concept | Definition | Why It Matters |
|---------|-----------|----------------|
| <!-- term --> | <!-- definition --> | <!-- product impact --> |

## Domain Boundaries

<!-- What's in scope? What's adjacent but out of scope?
     Where does this domain interact with other systems/processes? -->

## Complexity Drivers

<!-- What makes this domain hard? Regulations? Legacy systems?
     Multiple stakeholders? Ambiguous terminology? -->

## Related

- [Business Processes](/content/domain/processes/) — how work flows in this domain
- [Data Dictionary](/content/domain/data-dictionary) — canonical term definitions
- [Industry Notes](/content/domain/industry-notes) — regulations, standards, market context
`,
		},
		{
			path: "content/domain/processes/index.md",
			content: (ctx: TemplateContext) => `---
title: Business Processes
description: Business process catalog for ${ctx.branding.brandName}
---

# Business Processes

<!-- ← CUSTOMIZE: Document each key business process.
     This is often the most valuable artifact for complex engagements. -->

| Process | Trigger | Key Systems | Documentation |
|---------|---------|-------------|---------------|
| <!-- process name --> | <!-- what starts it --> | <!-- systems involved --> | [Details](./process-name) |

## Documenting a Process

Each process should capture:

1. **Trigger** — what initiates the process
2. **Actors** — who/what is involved (people, systems, roles)
3. **Steps** — the happy path, numbered
4. **Variations** — edge cases, exception paths
5. **Systems** — which systems participate at each step
6. **Data** — what data flows between steps
7. **Business Rules** — constraints, validations, policies

## Process Template

\`\`\`markdown
# Process: [Name]

## Trigger
<!-- What starts this process -->

## Actors
| Actor | Role | System |
|-------|------|--------|

## Steps
1. [Step] — [Actor] does [action] in [system]
2. ...

## Variations
### [Variation Name]
- When: [condition]
- Then: [different path]

## Business Rules
- [Rule 1]
- [Rule 2]
\`\`\`
`,
		},
		{
			path: "content/domain/data-dictionary.md",
			content: (ctx: TemplateContext) => `---
title: Data Dictionary
description: Canonical term definitions for ${ctx.branding.brandName}
---

# Data Dictionary

<!-- ← CUSTOMIZE: Add terms as the domain model evolves.
     This is the single source of truth for "what does X mean?" -->

## Core Terms

| Term | Definition | Also Known As | Used In |
|------|-----------|---------------|---------|
| <!-- term --> | <!-- precise definition --> | <!-- aliases --> | <!-- where it appears --> |

## Data Entities

### <!-- Entity Name -->

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| <!-- field --> | <!-- string/number/date/etc --> | <!-- what it represents --> | <!-- sample value --> |

## Relationships

<!-- How do entities relate to each other?
     Consider a diagram (Mermaid) for complex relationships. -->

## Naming Conventions

<!-- Are there naming rules? Field prefixes? Status value enumerations?
     Document anything that a developer or analyst needs to know. -->
`,
		},
		{
			path: "content/domain/industry-notes.md",
			content: (ctx: TemplateContext) => `---
title: Industry Notes
description: Industry context for ${ctx.branding.brandName}
---

# Industry Notes

<!-- ← CUSTOMIZE: Capture the external context that constrains product decisions -->

## Regulatory Environment

<!-- What regulations apply? Compliance requirements?
     Certification standards? Reporting obligations? -->

| Regulation | Scope | Impact on Product |
|-----------|-------|-------------------|
| <!-- regulation --> | <!-- what it covers --> | <!-- how it affects us --> |

## Industry Standards

<!-- Technical standards, data formats, protocols,
     interoperability requirements -->

## Competitive Landscape

<!-- Who else operates in this space?
     What are common industry patterns?
     What do users expect based on other products? -->

## Market Dynamics

<!-- Trends, shifts, upcoming changes that affect product direction -->
`,
		},
		// ---------------------------------------------------------------
		// Planning section
		// ---------------------------------------------------------------
		{
			path: "content/planning/roadmap.md",
			content: (ctx: TemplateContext) => `---
title: Roadmap
description: Product roadmap for ${ctx.branding.brandName}
---

# Roadmap

<!-- ← CUSTOMIZE: Define phases and priorities -->

## Current Phase

**Phase**: <!-- name -->
**Timeline**: <!-- date range -->
**Focus**: <!-- primary goal -->

## Priorities

| Priority | Initiative | Rationale | Status |
|----------|-----------|-----------|--------|
| 1 | <!-- initiative --> | <!-- why now --> | Planning |
| 2 | <!-- initiative --> | <!-- why now --> | Discovery |
| 3 | <!-- initiative --> | <!-- why now --> | Backlog |

## What We're NOT Doing (and Why)

<!-- Equally important as what we are doing.
     Document deferred items and rationale. -->

| Deferred Item | Reason | Revisit When |
|--------------|--------|-------------|
| <!-- item --> | <!-- rationale --> | <!-- trigger --> |

## Phase History

| Phase | Dates | Outcome |
|-------|-------|---------|
| <!-- phase --> | <!-- dates --> | <!-- what was achieved --> |

## Related

- [Specs](/content/planning/specs/) — detailed specifications
- [Decisions](/content/planning/decisions/) — key decision records
- [Research](/content/planning/research/) — supporting analysis
`,
		},
		{
			path: "content/planning/decisions/index.md",
			content: (_ctx: TemplateContext) => `---
title: Decisions
description: Architecture and product decision records
---

# Decision Log

<!-- ← CUSTOMIZE: Record significant decisions as they are made -->

| ID | Decision | Date | Status |
|----|----------|------|--------|
| ADR-001 | <!-- decision title --> | <!-- date --> | Proposed / Accepted / Superseded |

## Recording a Decision

Use the [ADR Template](./adr-template) for each significant decision.

A decision is worth recording when:
- It affects architecture or technology choice
- It's hard to reverse
- Multiple valid options were considered
- Future team members will ask "why did we do it this way?"
`,
		},
		{
			path: "content/planning/decisions/adr-template.md",
			content: (_ctx: TemplateContext) => `---
title: "ADR-000: Decision Template"
description: Template for architecture/product decision records
---

# ADR-000: [Decision Title]

## Status

Proposed | Accepted | Deprecated | Superseded by [ADR-XXX]

## Context

<!-- What is the issue? What forces are at play?
     Include technical, business, and organizational context. -->

## Options Considered

### Option A: [Name]

- **Pros**: ...
- **Cons**: ...

### Option B: [Name]

- **Pros**: ...
- **Cons**: ...

## Decision

<!-- What was decided and why. Be specific. -->

## Consequences

### Positive

- <!-- benefit -->

### Negative

- <!-- trade-off -->

### Risks

- <!-- risk and mitigation -->
`,
		},
		{
			path: "content/planning/specs/index.md",
			content: (ctx: TemplateContext) => `---
title: Specifications
description: Product specifications for ${ctx.branding.brandName}
---

# Specifications

<!-- ← CUSTOMIZE: Add specs as features are scoped -->

| Spec | Feature | Status | Owner |
|------|---------|--------|-------|
| <!-- spec title --> | <!-- feature link --> | Draft / Review / Approved | <!-- who --> |

## Writing a Spec

Each spec should include:

1. **Problem Statement** — what user problem this solves
2. **Proposed Solution** — how we solve it
3. **Acceptance Criteria** — how we know it's done
4. **Out of Scope** — what this spec does NOT cover
5. **Dependencies** — what else needs to exist
`,
		},
		{
			path: "content/planning/research/index.md",
			content: (ctx: TemplateContext) => `---
title: Research
description: Research and analysis for ${ctx.branding.brandName}
---

# Research

<!-- ← CUSTOMIZE: Add research as analysis is completed -->

| Topic | Type | Date | Key Finding |
|-------|------|------|-------------|
| <!-- topic --> | Market / User / Technology / Competitive | <!-- date --> | <!-- one-line summary --> |

## Research Types

- **Market research** — industry trends, market size, opportunity assessment
- **User research** — interviews, surveys, usage patterns, pain points
- **Technology assessment** — vendor evaluation, build vs buy, feasibility
- **Competitive analysis** — alternatives, positioning, differentiation
`,
		},
		// ---------------------------------------------------------------
		// Operations section
		// ---------------------------------------------------------------
		{
			path: "content/operations/environments.md",
			content: (ctx: TemplateContext) => `---
title: Environments
description: Environment catalog for ${ctx.branding.brandName}
---

# Environments

<!-- ← CUSTOMIZE: Document your environments -->

| Environment | URL | Purpose | Access |
|-------------|-----|---------|--------|
| Development | <!-- URL --> | Active development | Team |
| Staging | <!-- URL --> | Pre-production testing | Team + stakeholders |
| Production | <!-- URL --> | Live system | End users |

## Configuration

<!-- How do environments differ? Feature flags? API keys?
     What needs to change between environments? -->

## Access

<!-- How to get access to each environment.
     Credentials, VPN, service accounts. -->
`,
		},
		{
			path: "content/operations/deployment.md",
			content: (ctx: TemplateContext) => `---
title: Deployment
description: Deployment procedure for ${ctx.branding.brandName}
---

# Deployment

<!-- ← CUSTOMIZE: Replace with your deployment process -->

## Prerequisites

- [ ] Code reviewed and approved
- [ ] Tests passing
- [ ] Staging verified
- [ ] Stakeholders notified

## Procedure

### 1. Pre-deployment

\`\`\`bash
# ← CUSTOMIZE: your verification commands
\`\`\`

### 2. Deploy

\`\`\`bash
# ← CUSTOMIZE: your deployment commands
\`\`\`

### 3. Verify

- [ ] Application healthy
- [ ] Key flows working
- [ ] No error spikes

## Rollback

\`\`\`bash
# ← CUSTOMIZE: your rollback commands
\`\`\`
`,
		},
		// ---------------------------------------------------------------
		// Guides section
		// ---------------------------------------------------------------
		{
			path: "content/guides/getting-started.md",
			content: (ctx: TemplateContext) => `---
title: Getting Started
description: Onboarding guide for ${ctx.branding.brandName}
---

# Getting Started

<!-- ← CUSTOMIZE: Adapt for your team and project -->

## For New Team Members

### 1. Read the Domain

Start with [Domain Overview](/content/domain/overview) — understand the business context before the code.

### 2. Understand the Product

Read [Product Overview](/content/product/overview) — what we're building and why.

### 3. Review Current Plan

Check the [Roadmap](/content/planning/roadmap) — what phase are we in, what are the priorities.

### 4. Set Up

Follow the environment setup in [Operations](/content/operations/environments).

## For AI Agents

1. Read \`AGENTS.md\` and \`CUSTOMIZING.md\` at the project root
2. Read [Domain Overview](/content/domain/overview) for business context
3. Check \`.kitfly/manifest.json\` for template metadata
4. Follow existing content patterns in each section
`,
		},
		{
			path: "content/guides/user-guide.md",
			content: (ctx: TemplateContext) => `---
title: User Guide
description: End-user documentation for ${ctx.branding.brandName}
---

# User Guide

<!-- ← CUSTOMIZE: Write for end users, not developers -->

## Overview

<!-- What can users do with this product? -->

## Getting Started

### Step 1: <!-- first thing a user does -->

### Step 2: <!-- next step -->

## Common Tasks

### <!-- Task Name -->

1. <!-- step -->
2. <!-- step -->

## FAQ

### <!-- Common question? -->

<!-- Answer -->

## Support

<!-- How to get help -->
`,
		},
		// ---------------------------------------------------------------
		// Reference section
		// ---------------------------------------------------------------
		{
			path: "content/reference/architecture/overview.md",
			content: (ctx: TemplateContext) => `---
title: Architecture Overview
description: System architecture for ${ctx.branding.brandName}
---

# Architecture Overview

<!-- ← CUSTOMIZE: Document your system architecture -->

## System Diagram

<!-- Consider a Mermaid diagram for architecture visualization -->

## Components

| Component | Purpose | Technology | Owner |
|-----------|---------|-----------|-------|
| <!-- component --> | <!-- what it does --> | <!-- tech stack --> | <!-- team/person --> |

## Data Flow

<!-- How does data move through the system?
     Source → Processing → Storage → Presentation -->

## Key Design Decisions

See [Decision Log](/content/planning/decisions/) for architectural decisions and rationale.
`,
		},
		{
			path: "content/reference/integrations/index.md",
			content: (ctx: TemplateContext) => `---
title: Integrations
description: External system integrations for ${ctx.branding.brandName}
---

# Integrations

<!-- ← CUSTOMIZE: Document each external system integration -->

| System | Type | Purpose | Documentation |
|--------|------|---------|---------------|
| <!-- system --> | REST API / File / Database | <!-- why we integrate --> | [Details](./system-name) |

## Adding an Integration

1. Create a file in \`content/reference/integrations/\`
2. Document: connection details, auth, endpoints, data format, error handling
3. Update this index table
4. Add relevant entries to [Data Dictionary](/content/domain/data-dictionary)
`,
		},
		{
			path: "content/reference/data-models/index.md",
			content: (ctx: TemplateContext) => `---
title: Data Models
description: Database and API schemas for ${ctx.branding.brandName}
---

# Data Models

<!-- ← CUSTOMIZE: Document your data structures -->

## Database Schema

<!-- Tables, relationships, key constraints -->

## API Schema

<!-- Request/response formats, versioning -->

## Related

- [Data Dictionary](/content/domain/data-dictionary) — business term definitions
- [Integrations](/content/reference/integrations/) — external system data formats
`,
		},
		{
			path: "content/reference/contacts/directory.md",
			content: (ctx: TemplateContext) => `---
title: Contact Directory
description: Team and vendor contacts for ${ctx.branding.brandName}
---

# Contact Directory

<!-- ← CUSTOMIZE: Add your team and vendor contacts -->

## Project Team

| Role | Contact | Responsibility |
|------|---------|----------------|
| Product Lead | <!-- name/email --> | Product direction, priorities |
| Technical Lead | <!-- name/email --> | Architecture, implementation |
| Domain Expert | <!-- name/email --> | Business context, process knowledge |

## Vendor Contacts

| Vendor | Type | Contact |
|--------|------|---------|
| <!-- vendor --> | <!-- what they provide --> | <!-- portal/email --> |

## Stakeholders

| Stakeholder | Interest | Communication |
|-------------|----------|---------------|
| <!-- who --> | <!-- what they care about --> | <!-- how/when to update --> |
`,
		},
		{
			path: "content/reference/metrics/kpis.md",
			content: (ctx: TemplateContext) => `---
title: KPIs & Metrics
description: Key performance indicators for ${ctx.branding.brandName}
---

# KPIs & Metrics

<!-- ← CUSTOMIZE: Define your success metrics -->

## Product Metrics

| Metric | Target | Dashboard |
|--------|--------|-----------|
| <!-- metric --> | <!-- target --> | [Link] |

## Business Metrics

| Metric | Target | Source |
|--------|--------|--------|
| <!-- metric --> | <!-- target --> | <!-- where measured --> |

## Monitoring

| Alert | Warning | Critical | Action |
|-------|---------|----------|--------|
| <!-- what --> | <!-- threshold --> | <!-- threshold --> | <!-- response --> |
`,
		},
		// ---------------------------------------------------------------
		// CUSTOMIZING.md
		// ---------------------------------------------------------------
		{
			path: "CUSTOMIZING.md",
			content: (ctx: TemplateContext) => `---
template: productbook
template_version: 1
created: ${new Date().toISOString().split("T")[0]}
---

# Customizing ${ctx.branding.siteName}

This guide helps you (and AI assistants) understand how to customize this productbook.

## Site Structure

\`\`\`
${ctx.name}/
├── site.yaml              # Site configuration (sections, branding)
├── theme.yaml             # Theme customization (create if needed)
├── index.md               # Home page with product status
├── CUSTOMIZING.md         # This file
├── content/
│   ├── product/           # Product definition
│   │   ├── features/      # Feature catalog
│   │   └── releases/      # Release history
│   ├── domain/            # Business domain knowledge
│   │   └── processes/     # Business process documentation
│   ├── planning/          # Roadmap, specs, decisions
│   │   ├── decisions/     # Decision records (ADRs)
│   │   ├── specs/         # Product specifications
│   │   └── research/      # Research and analysis
│   ├── operations/        # Deployment, environments
│   ├── guides/            # Onboarding, user guides, tutorials
│   └── reference/         # Supporting materials
│       ├── architecture/  # System architecture
│       ├── integrations/  # External system docs
│       ├── data-models/   # Database and API schemas
│       ├── contacts/      # Team and vendor contacts
│       └── metrics/       # KPIs, dashboards
└── assets/
    └── brand/             # Logo, favicon
\`\`\`

## Configuration Files

### site.yaml - Site Configuration

\`\`\`yaml
title: "${ctx.branding.siteName}"

brand:
  name: "${ctx.branding.brandName}"     # Shown in header
  url: "/"                              # Logo link destination

sections:
  - name: "Product"
    path: "content/product"
  # Add or modify sections here
\`\`\`

### theme.yaml - Visual Customization (optional)

Create \`theme.yaml\` to customize colors and typography:

\`\`\`yaml
colors:
  primary: "#2563eb"
  background: "#ffffff"
  text: "#1f2937"

footer:
  text: "© ${ctx.year} ${ctx.branding.brandName}"
\`\`\`

## Adding Content

### New Feature

1. Create in \`content/product/features/\`:
   \`\`\`
   content/product/features/my-feature.md
   \`\`\`
2. Include: problem statement, user stories, acceptance criteria, success metrics
3. Update the index table in \`content/product/features/index.md\`

### Documenting a Business Process

1. Create in \`content/domain/processes/\`:
   \`\`\`
   content/domain/processes/my-process.md
   \`\`\`
2. Include: trigger, actors, steps, variations, systems, business rules
3. Update the index table in \`content/domain/processes/index.md\`
4. Add new terms to [Data Dictionary](/content/domain/data-dictionary)

### Recording a Decision

1. Copy the [ADR Template](/content/planning/decisions/adr-template) to a new file:
   \`\`\`
   content/planning/decisions/adr-001-my-decision.md
   \`\`\`
2. Fill in: context, options, decision, consequences
3. Update the index in \`content/planning/decisions/index.md\`

### Adding an Integration

1. Create in \`content/reference/integrations/\`:
   \`\`\`
   content/reference/integrations/my-system.md
   \`\`\`
2. Document: connection details, auth, endpoints, data format, error handling
3. Update the integrations index
4. Add data entities to [Data Models](/content/reference/data-models/)

### New Section

1. Create folder: \`content/newsection/\`
2. Add to \`site.yaml\`:
   \`\`\`yaml
   sections:
     - name: "New Section"
       path: "content/newsection"
   \`\`\`
3. Add at least one markdown file

## Document Conventions

### Product (features, releases)

- State the user problem first
- Include acceptance criteria
- Define success metrics
- Link to related specs and domain context

### Domain (processes, data dictionary)

- Write for someone new to the business
- Be precise with terminology — the data dictionary is canonical
- Document edge cases and variations, not just happy paths
- Explain *why* things work the way they do, not just *what*

### Planning (decisions, specs, research)

- Decisions: capture context and alternatives, not just the choice
- Specs: problem first, solution second
- Research: state methodology and limitations

### Guides (onboarding, user docs)

- Write for the audience (team member vs end user)
- Start with what they need to know first
- Include concrete examples

## Linking and References

### Internal Links

\`\`\`markdown
See [Domain Overview](/content/domain/overview) for business context.
\`\`\`

### External Links

\`\`\`markdown
See [Vendor Documentation](https://vendor.com/docs).
\`\`\`

## Getting Help

- [Kitfly Documentation](https://github.com/3leaps/kitfly)
- [Markdown Guide](https://www.markdownguide.org/)
`,
		},
	],
};
