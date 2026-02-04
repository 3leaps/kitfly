/**
 * Crucible Template
 *
 * Extends minimal with structured sections for information architecture sites.
 * Designed as the layer-0 SSOT for an ecosystem: specs, schemas, config,
 * policies, guides, and reference material.
 * Sections: Specs, Schemas, Config, Policies, Guides, Reference
 */

import type { TemplateContext, TemplateDef } from "./schema.ts";

export const crucible: TemplateDef = {
	id: "crucible",
	name: "Crucible",
	description: "Information architecture SSOT with specs, schemas, config, and governance",
	version: 1,
	extends: "minimal",
	sections: [
		{
			name: "Specs",
			path: "content/specs",
			description: "Specifications, standards, and technical definitions",
		},
		{
			name: "Schemas",
			path: "content/schemas",
			description: "Schema catalog and documentation",
		},
		{
			name: "Config",
			path: "content/config",
			description: "Configuration catalogs, taxonomies, role definitions",
		},
		{
			name: "Policies",
			path: "content/policies",
			description: "Governance, security, SOPs, compliance",
		},
		{
			name: "Guides",
			path: "content/guides",
			description: "Integration, onboarding, and how-to documentation",
		},
		{
			name: "Reference",
			path: "content/reference",
			description: "ADRs, changelog, glossary, contacts",
		},
	],
	files: [
		{
			path: "site.yaml",
			content: (ctx: TemplateContext) => `# ${ctx.branding.siteName} - Site Configuration
# Documentation: https://github.com/3leaps/kitfly

title: "${ctx.branding.siteName}"

# \u2190 CUSTOMIZE: Your brand settings
brand:
  name: "${ctx.branding.brandName}"
  url: "${ctx.branding.brandUrl}"
  # external: false  # Set true if brand URL is external

# Content sections
sections:
  - name: "Specs"
    path: "content/specs"
  - name: "Schemas"
    path: "content/schemas"
  - name: "Config"
    path: "content/config"
  - name: "Policies"
    path: "content/policies"
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
description: ${ctx.branding.siteName} - Information Architecture SSOT
---

# ${ctx.branding.siteName}

Single source of truth for specifications, schemas, configuration, and governance.

## Standards Status

| Area | Documents | Status |
|------|-----------|--------|
| Specifications | <!-- count --> | Draft |
| Schemas | <!-- count --> | Draft |
| Policies | <!-- count --> | Draft |

## Quick Links

### [Specifications](/content/specs/overview)
Standards and technical definitions that govern the ecosystem.

### [Schema Catalog](/content/schemas/)
Schema documentation and versioning policy.

### [Configuration](/content/config/overview)
Configuration catalogs, taxonomies, and role definitions.

### [Getting Started](/content/guides/getting-started)
How to consume and contribute to this crucible.

## Four-Zone Layout

This repository uses four zones:

| Zone | Path | Purpose |
|------|------|---------|
| **Content** | \`content/\` | Rendered documentation (this site) |
| **Machine** | \`schemas/\`, \`config/\` | Machine-consumable artifacts |
| **Internal** | \`internal/\` | Repo operations, project code |
| **Engine** | \`src/\`, \`scripts/\` | Kitfly site engine (standalone) |

See [CUSTOMIZING.md](./CUSTOMIZING.md) for full layout documentation.

---

*Last updated: ${new Date().toISOString().split("T")[0]}*
`,
		},
		// ---------------------------------------------------------------
		// Specs section
		// ---------------------------------------------------------------
		{
			path: "content/specs/overview.md",
			content: (ctx: TemplateContext) => `---
title: Specifications
description: Standards catalog for ${ctx.branding.brandName}
---

# Specifications

<!-- \u2190 CUSTOMIZE: Add your specifications and standards -->

## Standards Catalog

| Spec | Version | Status | Description |
|------|---------|--------|-------------|
| <!-- spec name --> | <!-- v1.0 --> | Draft / Stable / Deprecated | <!-- brief description --> |

## Status Definitions

| Status | Meaning |
|--------|---------|
| **Draft** | Under development, may change without notice |
| **Stable** | Reviewed and approved, changes follow the change procedure |
| **Deprecated** | Superseded, maintained for backward compatibility only |

## Writing a Specification

Use the [Spec Template](./spec-template) for new specifications.

Each spec should include:
1. **Purpose** \u2014 what problem this standard solves
2. **Scope** \u2014 what is and isn\u2019t covered
3. **Definitions** \u2014 key terms with precise meanings
4. **Requirements** \u2014 using MUST/SHOULD/MAY language (RFC 2119)
5. **Examples** \u2014 concrete illustrations of compliance
6. **Version history** \u2014 what changed and when

## Related

- [Change Procedure](/content/policies/change-procedure) \u2014 how specs are proposed and accepted
- [Decisions](/content/reference/decisions/) \u2014 rationale behind key standards
`,
		},
		{
			path: "content/specs/spec-template.md",
			content: () => `---
title: "SPEC-000: Specification Template"
description: Template for writing specifications and standards
---

# SPEC-000: [Specification Title]

## Status

Draft | Stable | Deprecated

**Version**: 0.1.0
**Last updated**: <!-- date -->

## Purpose

<!-- What problem does this standard solve? Why does it exist? -->

## Scope

<!-- What is covered? What is explicitly out of scope? -->

## Definitions

| Term | Definition |
|------|-----------|
| <!-- term --> | <!-- precise definition --> |

## Requirements

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are used per RFC 2119.

### [Requirement Area]

1. Implementations MUST ...
2. Implementations SHOULD ...
3. Implementations MAY ...

## Examples

### Compliant

\`\`\`
<!-- example of correct usage -->
\`\`\`

### Non-Compliant

\`\`\`
<!-- example of incorrect usage, with explanation -->
\`\`\`

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | <!-- date --> | Initial draft |
`,
		},
		// ---------------------------------------------------------------
		// Schemas section
		// ---------------------------------------------------------------
		{
			path: "content/schemas/index.md",
			content: (ctx: TemplateContext) => `---
title: Schema Catalog
description: Schema documentation for ${ctx.branding.brandName}
---

# Schema Catalog

<!-- \u2190 CUSTOMIZE: Add your schemas as they are defined -->

This section documents the schemas defined in this crucible. Machine-consumable schema files live in the root \`schemas/\` directory; this section provides human-readable documentation about them.

## Schemas

| Schema | Version | Path | Description |
|--------|---------|------|-------------|
| <!-- schema name --> | <!-- v0 --> | \`schemas/domain/v0/name.schema.json\` | <!-- what it defines --> |

## Schema Organization

Schemas are organized by domain and version:

\`\`\`
schemas/
\u251c\u2500\u2500 domain-a/
\u2502   \u2514\u2500\u2500 v0/
\u2502       \u251c\u2500\u2500 entity.schema.json
\u2502       \u2514\u2500\u2500 config.schema.json
\u2514\u2500\u2500 domain-b/
    \u2514\u2500\u2500 v0/
        \u2514\u2500\u2500 message.schema.json
\`\`\`

## Adding a Schema

1. Create the JSON Schema file in \`schemas/<domain>/<version>/\`
2. Add documentation in this section explaining purpose and fields
3. Update this catalog table
4. See [Versioning Policy](./versioning) for version numbering

## Related

- [Versioning Policy](./versioning) \u2014 how schemas are versioned
- [Change Procedure](/content/policies/change-procedure) \u2014 how schema changes are approved
`,
		},
		{
			path: "content/schemas/versioning.md",
			content: () => `---
title: Schema Versioning
description: How schemas are versioned and evolved
---

# Schema Versioning

<!-- \u2190 CUSTOMIZE: Adapt versioning policy to your project -->

## Version Scheme

Schemas use directory-based versioning:

\`\`\`
schemas/<domain>/v<major>/
\`\`\`

- **Major version** (v0, v1, v2): Breaking changes increment the major version
- **Minor/patch**: Backward-compatible changes update files in place within the same version directory
- **v0**: Development phase \u2014 breaking changes allowed without major bump

## Compatibility Rules

| Change Type | Example | Compatibility |
|-------------|---------|--------------|
| Add optional field | New field with default | Backward compatible |
| Add required field | New field, no default | **Breaking** \u2014 new major version |
| Remove field | Delete existing field | **Breaking** \u2014 new major version |
| Rename field | Change field name | **Breaking** \u2014 new major version |
| Narrow type | string \u2192 enum | **Breaking** \u2014 new major version |
| Widen type | enum \u2192 string | Backward compatible |

## Migration

When a new major version is released:
1. Create new version directory (\`v1/\` alongside \`v0/\`)
2. Document migration steps
3. Deprecate old version (keep for backward compatibility)
4. Set timeline for old version removal

## Schema IDs

Each schema SHOULD include a \`$id\` field with its canonical URL:

\`\`\`json
{
  "$id": "https://schemas.example.com/crucible/domain/v0/entity.schema.json"
}
\`\`\`
`,
		},
		// ---------------------------------------------------------------
		// Config section
		// ---------------------------------------------------------------
		{
			path: "content/config/overview.md",
			content: (ctx: TemplateContext) => `---
title: Configuration Catalog
description: Configuration documentation for ${ctx.branding.brandName}
---

# Configuration Catalog

<!-- \u2190 CUSTOMIZE: Document your configuration catalogs -->

This section documents the machine-readable configuration defined in this crucible. Config files live in the root \`config/\` directory; this section provides human-readable documentation about them.

## Configuration Areas

| Area | Path | Description |
|------|------|-------------|
| Agentic Roles | \`config/agentic/roles/\` | AI agent role definitions |
| Agentic Prompts | \`config/agentic/prompts/\` | Reusable prompt templates |
| Taxonomies | \`config/taxonomy/\` | Classification systems and catalogs |

## Config Organization

\`\`\`
config/
\u251c\u2500\u2500 agentic/
\u2502   \u251c\u2500\u2500 roles/          # Role definitions (YAML)
\u2502   \u251c\u2500\u2500 prompts/        # Prompt templates (YAML)
\u2502   \u2514\u2500\u2500 README.md
\u251c\u2500\u2500 taxonomy/           # Classification systems
\u2514\u2500\u2500 ...                 # Project-specific config
\`\`\`

## Related

- [Role Definitions](./roles) \u2014 AI agent role catalog
- [Prompt Templates](./prompts) \u2014 reusable prompt catalog
`,
		},
		{
			path: "content/config/roles.md",
			content: (ctx: TemplateContext) => `---
title: Role Definitions
description: AI agent role catalog for ${ctx.branding.brandName}
---

# Role Definitions

<!-- \u2190 CUSTOMIZE: Document your role definitions -->

Roles define **who** an AI agent is when working on this project. Each role has a scope, mindset, responsibilities, and anti-patterns.

## Role Catalog

| Role | Category | Scope |
|------|----------|-------|
| \`devlead\` | Agentic | Architecture, implementation, technical decisions |
| \`infoarch\` | Agentic | Documentation structure, consistency, navigation |
| \`devrev\` | Review | Code review, quality standards |
| \`secrev\` | Review | Security review, vulnerability assessment |
| \`qa\` | Review | Testing, validation, checklists |

## Role File Format

Role files live in \`config/agentic/roles/\` as YAML:

\`\`\`yaml
# config/agentic/roles/devlead.yaml
name: devlead
category: agentic
scope: "Architecture, implementation, technical decisions"
mindset: "Ship working software that meets the spec"
responsibilities:
  - Implementation and code quality
  - Architecture decisions
  - Technical debt management
anti_patterns:
  - Over-engineering beyond requirements
  - Ignoring existing patterns
escalation: "Raise blockers to project lead"
\`\`\`

## Adding a Role

1. Create YAML file in \`config/agentic/roles/\`
2. Follow the schema in \`schemas/agentic/\` (if defined)
3. Update this documentation page
4. Test with your AI tooling
`,
		},
		{
			path: "content/config/prompts.md",
			content: (ctx: TemplateContext) => `---
title: Prompt Templates
description: Reusable AI prompt templates for ${ctx.branding.brandName}
---

# Prompt Templates

<!-- \u2190 CUSTOMIZE: Document your prompt templates -->

Prompts define **how** an AI agent should approach specific tasks. They complement roles (who) with task-specific instructions (how).

## Prompt Catalog

| Prompt | Role | Purpose |
|--------|------|---------|
| <!-- prompt name --> | <!-- role --> | <!-- what task it guides --> |

## Prompt File Format

Prompt templates live in \`config/agentic/prompts/\` as YAML:

\`\`\`yaml
# config/agentic/prompts/write-spec.yaml
name: write-spec
description: "Guide for writing a new specification"
role: infoarch
template: |
  Write a specification following the SPEC template.
  Include: Purpose, Scope, Definitions, Requirements (RFC 2119), Examples.
  Reference existing specs for style consistency.
  Link to related schemas and config.
tags:
  - specs
  - documentation
\`\`\`

## Adding a Prompt

1. Create YAML file in \`config/agentic/prompts/\`
2. Reference the appropriate role
3. Update this documentation page
`,
		},
		// ---------------------------------------------------------------
		// Policies section
		// ---------------------------------------------------------------
		{
			path: "content/policies/security-model.md",
			content: (ctx: TemplateContext) => `---
title: Security Model
description: Security baseline for ${ctx.branding.brandName}
---

# Security Model

<!-- \u2190 CUSTOMIZE: Define your security baseline -->

## Principles

1. **Safe by default** \u2014 missing configuration is a policy error, not a permissive fallback
2. **Least privilege** \u2014 grant minimum access needed for each role
3. **Defense in depth** \u2014 no single control prevents all abuse
4. **Audit everything** \u2014 actions are logged and traceable

## Access Control

| Resource | Who | Access Level |
|----------|-----|-------------|
| Specifications | All team members | Read |
| Specifications | Spec authors + reviewers | Write |
| Schemas | All consumers | Read |
| Schemas | Schema owners | Write |
| Config | All team members | Read |
| Config | Config owners | Write |

## Secrets and Credentials

- Never store secrets in this repository
- Use environment variables or secret management systems
- Document required secrets in [Getting Started](/content/guides/getting-started), not their values

## Review Requirements

| Change Type | Required Reviews |
|------------|-----------------|
| New specification | 2 reviewers |
| Schema breaking change | 2 reviewers + owner approval |
| Policy change | Lead approval |
| Config change | 1 reviewer |
`,
		},
		{
			path: "content/policies/dependency-policy.md",
			content: () => `---
title: Dependency Policy
description: Rules for managing dependencies and external references
---

# Dependency Policy

<!-- \u2190 CUSTOMIZE: Adapt to your dependency management approach -->

## Principles

- Minimize external dependencies
- Pin versions explicitly
- Audit dependencies for security
- Document why each dependency exists

## Dependency Categories

| Category | Policy | Example |
|----------|--------|---------|
| Runtime | Must be explicitly justified | Libraries consumed by code |
| Dev/Build | Standard tooling accepted | Formatters, linters, test runners |
| Schema references | Pin to specific version | External \`$ref\` in JSON Schema |
| Documentation | Avoid external hosting dependencies | Prefer self-contained content |

## Adding a Dependency

1. Open a decision record explaining the need
2. Evaluate alternatives (can we avoid it?)
3. Check license compatibility
4. Pin to specific version
5. Document in project manifest

## Removing a Dependency

1. Verify nothing depends on it
2. Remove from manifest and lock file
3. Update documentation
`,
		},
		{
			path: "content/policies/change-procedure.md",
			content: (ctx: TemplateContext) => `---
title: Change Procedure
description: How changes flow through ${ctx.branding.brandName}
---

# Change Procedure

<!-- \u2190 CUSTOMIZE: Define your change approval process -->

## Overview

All changes to this crucible follow a structured process to maintain quality and consistency.

## Change Types

| Type | Process | Approval |
|------|---------|----------|
| New spec | Draft \u2192 Review \u2192 Accept | 2 reviewers |
| Spec update (non-breaking) | PR \u2192 Review | 1 reviewer |
| Spec update (breaking) | ADR \u2192 PR \u2192 Review | 2 reviewers + owner |
| New schema | PR \u2192 Review | 1 reviewer |
| Schema breaking change | ADR \u2192 New version dir \u2192 Review | 2 reviewers |
| Policy change | Proposal \u2192 Discussion \u2192 Approval | Lead approval |
| Config change | PR \u2192 Review | 1 reviewer |
| Guide/reference update | PR \u2192 Review | 1 reviewer |

## Process

### 1. Propose

- Open a PR with the change
- For breaking changes, create an [ADR](/content/reference/decisions/) first
- Reference the spec, schema, or policy being changed

### 2. Review

- Reviewers check for:
  - Consistency with existing standards
  - Completeness (all required sections present)
  - Accuracy (examples work, references valid)
  - Impact assessment (who/what is affected)

### 3. Accept

- Required approvals received
- CI checks pass (schema validation, formatting)
- Merge to main branch

### 4. Communicate

- Update changelog
- Notify consumers of breaking changes
- Update version if applicable
`,
		},
		// ---------------------------------------------------------------
		// Guides section
		// ---------------------------------------------------------------
		{
			path: "content/guides/getting-started.md",
			content: (ctx: TemplateContext) => `---
title: Getting Started
description: How to consume and use ${ctx.branding.brandName}
---

# Getting Started

<!-- \u2190 CUSTOMIZE: Adapt for your ecosystem -->

## What Is This?

${ctx.branding.siteName} is the single source of truth (SSOT) for specifications, schemas, configuration, and governance. Everything else in the ecosystem builds on what is defined here.

## For Consumers

### Reading Documentation

Browse this site for human-readable standards and guides.

### Using Schemas

Machine-consumable schemas are in the root \`schemas/\` directory:

\`\`\`bash
# Reference a schema by path
schemas/<domain>/<version>/<name>.schema.json
\`\`\`

### Using Configuration

Machine-readable config is in the root \`config/\` directory:

\`\`\`bash
# Role definitions
config/agentic/roles/<role>.yaml

# Prompt templates
config/agentic/prompts/<prompt>.yaml
\`\`\`

## For Contributors

### Prerequisites

- Read the [Change Procedure](/content/policies/change-procedure)
- Understand the [four-zone layout](/) (content, machine, internal, engine)
- Review existing specs and schemas for style

### Making Changes

1. Create a branch
2. Make changes in the appropriate zone
3. Run validation: \`make check\`
4. Open a PR with description and rationale
5. Address review feedback

See [Contributing Guide](./contributing) for details.

## For AI Agents

1. Read \`AGENTS.md\` and \`CUSTOMIZING.md\` at the project root
2. Check \`.kitfly/manifest.json\` for template metadata
3. Understand the four-zone layout before making changes
4. Follow existing patterns in each section
5. Never edit machine artifacts (\`schemas/\`, \`config/\`) without understanding consumers
`,
		},
		{
			path: "content/guides/contributing.md",
			content: (ctx: TemplateContext) => `---
title: Contributing
description: How to add specs, schemas, and config to ${ctx.branding.brandName}
---

# Contributing

<!-- \u2190 CUSTOMIZE: Adapt for your project -->

## Adding a Specification

1. Copy the [Spec Template](/content/specs/spec-template)
2. Place in \`content/specs/<name>.md\`
3. Fill in all required sections
4. Use RFC 2119 language (MUST, SHOULD, MAY)
5. Include compliant and non-compliant examples
6. Update the [Specifications catalog](/content/specs/overview)
7. Open a PR

## Adding a Schema

1. Create the JSON Schema file:
   \`\`\`
   schemas/<domain>/<version>/<name>.schema.json
   \`\`\`
2. Include \`$id\` and \`$schema\` fields
3. Add documentation in \`content/schemas/\`
4. Update the [Schema Catalog](/content/schemas/)
5. Open a PR

## Adding Configuration

1. Create the config file in the appropriate directory:
   \`\`\`
   config/<area>/<name>.yaml
   \`\`\`
2. Add documentation in \`content/config/\`
3. Open a PR

## Adding a Decision Record

1. Copy the [ADR Template](/content/reference/decisions/adr-template)
2. Place in \`content/reference/decisions/adr-NNN-<title>.md\`
3. Fill in context, options, decision, and consequences
4. Update the [Decision Log](/content/reference/decisions/)

## Style Guide

- **Specs**: Formal tone, RFC 2119 language, versioned
- **Schemas**: Include descriptions for all fields, provide examples
- **Config**: Document valid values and defaults
- **Guides**: Practical, task-oriented, concrete examples
- **Policies**: Prescriptive, clear consequences for non-compliance
`,
		},
		// ---------------------------------------------------------------
		// Reference section
		// ---------------------------------------------------------------
		{
			path: "content/reference/decisions/index.md",
			content: () => `---
title: Decisions
description: Architecture and governance decision records
---

# Decision Log

<!-- \u2190 CUSTOMIZE: Record decisions as they are made -->

| ID | Decision | Date | Status |
|----|----------|------|--------|
| ADR-001 | <!-- decision title --> | <!-- date --> | Proposed / Accepted / Superseded |

## When to Record a Decision

A decision is worth recording when:
- It affects the structure or governance of this crucible
- It changes how schemas, specs, or config are managed
- Multiple valid approaches were considered
- Future contributors will ask \u201cwhy did we do it this way?\u201d

## Using the Template

Use the [ADR Template](./adr-template) for each decision.
`,
		},
		{
			path: "content/reference/decisions/adr-template.md",
			content: () => `---
title: "ADR-000: Decision Template"
description: Template for architecture and governance decision records
---

# ADR-000: [Decision Title]

## Status

Proposed | Accepted | Deprecated | Superseded by [ADR-XXX]

## Context

<!-- What prompted this decision?
     What forces are at play \u2014 technical, organizational, ecosystem? -->

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
			path: "content/reference/changelog/index.md",
			content: (ctx: TemplateContext) => `---
title: Changelog
description: Release history for ${ctx.branding.brandName}
---

# Changelog

<!-- \u2190 CUSTOMIZE: Add releases as they ship -->

## Versioning

This crucible uses <!-- CalVer (YYYY.MM) / SemVer (X.Y.Z) --> versioning.

| Version | Date | Highlights |
|---------|------|------------|
| <!-- version --> | <!-- date --> | <!-- key changes --> |

## Release Process

1. Collect changes since last release
2. Update this changelog
3. Tag the release
4. Notify consumers of breaking changes
`,
		},
		{
			path: "content/reference/glossary.md",
			content: (ctx: TemplateContext) => `---
title: Glossary
description: Terminology and definitions for ${ctx.branding.brandName}
---

# Glossary

<!-- \u2190 CUSTOMIZE: Add terms as the ecosystem evolves -->

| Term | Definition | Context |
|------|-----------|---------|
| Crucible | Information architecture SSOT for an ecosystem | This repository |
| SSOT | Single Source of Truth \u2014 the authoritative definition | Architecture |
| Spec | Specification document with MUST/SHOULD/MAY requirements | Standards |
| Schema | JSON Schema definition for data validation | Contracts |
| ADR | Architecture Decision Record | Governance |
| CalVer | Calendar Versioning (e.g., 2026.02) | Versioning |
| SemVer | Semantic Versioning (e.g., 1.2.3) | Versioning |

## Naming Conventions

<!-- \u2190 CUSTOMIZE: Document naming rules for your ecosystem -->

| Artifact | Convention | Example |
|----------|-----------|---------|
| Specs | SPEC-NNN | SPEC-001 |
| Schemas | kebab-case.schema.json | entity-config.schema.json |
| ADRs | ADR-NNN-kebab-case | ADR-001-versioning-policy |
| Config | kebab-case.yaml | autonomy-gates.yaml |
| Roles | lowercase.yaml | devlead.yaml |
`,
		},
		// ---------------------------------------------------------------
		// Internal zone
		// ---------------------------------------------------------------
		{
			path: "internal/ops/README.md",
			content: (_ctx: TemplateContext) => `# Internal Operations

This directory is for **repo-level housekeeping** that is not part of the rendered site.

## What Goes Here

- Release checklists and runbooks
- Sync logs and audit trails
- Migration scripts and notes
- CI/CD operational docs
- Anything about maintaining *this repo* (not the ecosystem it documents)

## What Does NOT Go Here

- Standards and specs \u2192 \`content/specs/\`
- Schema documentation \u2192 \`content/schemas/\`
- Policies \u2192 \`content/policies/\`
- How-to guides \u2192 \`content/guides/\`

## Four-Zone Model

| Zone | Path | Rendered? |
|------|------|-----------|
| Content | \`content/\` | Yes |
| Machine | \`schemas/\`, \`config/\` | No |
| **Internal** | **\`internal/\`** | **No** |
| Engine | \`src/\`, \`scripts/\` | No |

This directory is in the **Internal** zone.
`,
		},
		// ---------------------------------------------------------------
		// CUSTOMIZING.md
		// ---------------------------------------------------------------
		{
			path: "CUSTOMIZING.md",
			content: (ctx: TemplateContext) => `---
template: crucible
template_version: 1
created: ${new Date().toISOString().split("T")[0]}
---

# Customizing ${ctx.branding.siteName}

This guide helps you (and AI assistants) understand how to customize this crucible.

## Four-Zone Layout

This repository has four distinct zones:

\`\`\`
${ctx.name}/
\u251c\u2500\u2500 content/               # \u2190 RENDERED: kitfly documentation sections
\u2502   \u251c\u2500\u2500 specs/             #    Specifications and standards
\u2502   \u251c\u2500\u2500 schemas/           #    Schema documentation (about the schemas)
\u2502   \u251c\u2500\u2500 config/            #    Config catalog documentation
\u2502   \u251c\u2500\u2500 policies/          #    Governance, security, SOPs
\u2502   \u251c\u2500\u2500 guides/            #    Integration, onboarding
\u2502   \u2514\u2500\u2500 reference/         #    ADRs, changelog, glossary
\u2502       \u251c\u2500\u2500 decisions/     #    Architecture Decision Records
\u2502       \u2514\u2500\u2500 changelog/     #    Release history
\u251c\u2500\u2500 schemas/               # \u2190 MACHINE: JSON Schema files (consumed by code)
\u2502   \u2514\u2500\u2500 <domain>/<version>/*.schema.json
\u251c\u2500\u2500 config/                # \u2190 MACHINE: YAML catalogs, roles, prompts
\u2502   \u251c\u2500\u2500 agentic/
\u2502   \u2502   \u251c\u2500\u2500 roles/         #    AI agent role definitions
\u2502   \u2502   \u2514\u2500\u2500 prompts/       #    Reusable prompt templates
\u2502   \u2514\u2500\u2500 taxonomy/          #    Classification systems
\u251c\u2500\u2500 internal/              # \u2190 PROJECT: not rendered, not kitfly
\u2502   \u251c\u2500\u2500 ops/               #    Repo housekeeping
\u2502   \u251c\u2500\u2500 src/               #    Project code (lang wrappers, generators)
\u2502   \u2514\u2500\u2500 scripts/           #    Project automation
\u251c\u2500\u2500 src/                   # \u2190 KITFLY: site engine (standalone only)
\u251c\u2500\u2500 scripts/               # \u2190 KITFLY: build scripts (standalone only)
\u2514\u2500\u2500 site.yaml
\`\`\`

### Zone Rules

| Zone | Path | Rendered? | Who Owns It |
|------|------|-----------|-------------|
| **Content** | \`content/\` | Yes \u2014 kitfly renders this | Template + you |
| **Machine** | \`schemas/\`, \`config/\` | No \u2014 consumed by code | You |
| **Internal** | \`internal/\` | No \u2014 repo operations | You |
| **Engine** | \`src/\`, \`scripts/\` | No \u2014 kitfly site engine | Kitfly (standalone) |

**Key principle**: \`content/\` documents the artifacts in the other zones. The \`content/schemas/\` section documents the schemas in \`schemas/\`. The \`content/config/\` section documents the config in \`config/\`.

## Configuration Files

### site.yaml - Site Configuration

\`\`\`yaml
title: "${ctx.branding.siteName}"

brand:
  name: "${ctx.branding.brandName}"     # Shown in header
  url: "/"                              # Logo link destination

sections:
  - name: "Specs"
    path: "content/specs"
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
  text: "\u00a9 ${ctx.year} ${ctx.branding.brandName}"
\`\`\`

## Adding Content

### New Specification

1. Copy the [Spec Template](/content/specs/spec-template)
2. Place in \`content/specs/<name>.md\`
3. Use RFC 2119 language (MUST, SHOULD, MAY)
4. Update the catalog in \`content/specs/overview.md\`

### New Schema

Two artifacts are needed:

1. **Machine file**: Create in \`schemas/<domain>/<version>/<name>.schema.json\`
2. **Documentation**: Create in \`content/schemas/<name>.md\`
3. Update the [Schema Catalog](/content/schemas/)

### New Config Catalog

1. **Machine file**: Create in \`config/<area>/<name>.yaml\`
2. **Documentation**: Create in \`content/config/\`

### New Policy

1. Create in \`content/policies/<name>.md\`
2. Use prescriptive language (MUST, SHOULD, MAY)
3. Include rationale for each rule

### New Decision Record

1. Copy the [ADR Template](/content/reference/decisions/adr-template)
2. Place in \`content/reference/decisions/adr-NNN-<title>.md\`
3. Update the [Decision Log](/content/reference/decisions/)

### New Section

1. Create folder: \`content/newsection/\`
2. Add to \`site.yaml\`:
   \`\`\`yaml
   sections:
     - name: "New Section"
       path: "content/newsection"
   \`\`\`
3. Add at least one markdown file

## Machine Artifacts

### Adding Schemas

\`\`\`
schemas/
\u2514\u2500\u2500 my-domain/
    \u2514\u2500\u2500 v0/
        \u2514\u2500\u2500 my-entity.schema.json
\`\`\`

- Use JSON Schema Draft 2020-12
- Include \`$id\` with canonical URL
- Add \`description\` to all fields
- Follow [Versioning Policy](/content/schemas/versioning)

### Adding Config

\`\`\`
config/
\u251c\u2500\u2500 agentic/
\u2502   \u251c\u2500\u2500 roles/<role>.yaml        # WHO the agent is
\u2502   \u2514\u2500\u2500 prompts/<prompt>.yaml    # HOW the agent works
\u2514\u2500\u2500 taxonomy/<name>.yaml             # Classification systems
\`\`\`

## Internal Zone

The \`internal/\` directory is for repo housekeeping that is NOT rendered:

- \`internal/ops/\` \u2014 release checklists, sync logs, audit trails
- \`internal/src/\` \u2014 project code (lang wrappers, code generators)
- \`internal/scripts/\` \u2014 project automation (validation, sync)

Create these subdirectories as needed. Only \`internal/ops/\` is created by the template.

## Document Conventions

### Specifications

- Use RFC 2119 language (MUST, SHOULD, MAY)
- Include version and status in frontmatter
- Provide compliant and non-compliant examples
- State scope explicitly (what is and isn\u2019t covered)

### Schemas

- Document purpose, fields, and examples
- Link to the raw schema file in \`schemas/\`
- Note breaking change policy
- Include sample valid documents

### Config

- Document valid values and defaults
- Explain what each config controls
- Link to the schema that validates it (if any)

### Policies

- Be prescriptive \u2014 use MUST/SHOULD/MAY
- Include rationale for each rule
- Define consequences for non-compliance
- State review/approval requirements

## Linking and References

### Internal Links

\`\`\`markdown
See [Specifications](/content/specs/overview) for the standards catalog.
\`\`\`

### External Links

\`\`\`markdown
See [JSON Schema Specification](https://json-schema.org/).
\`\`\`

### Linking to Machine Artifacts

Reference schema and config files by path:

\`\`\`markdown
See \`schemas/ipc/v0/control.schema.json\` for the full schema.
\`\`\`

## Getting Help

- [Kitfly Documentation](https://github.com/3leaps/kitfly)
- [Markdown Guide](https://www.markdownguide.org/)
- [JSON Schema](https://json-schema.org/)
`,
		},
	],
};
