---
title: Crucible Template
description: Information architecture SSOT with specs, schemas, config, and governance
---

# Crucible Template

The `crucible` template creates a **layer-0 information architecture site** — the single source of truth (SSOT) for an ecosystem's specifications, schemas, configuration, and governance. It extends `minimal` with six sections and a four-zone layout that separates rendered documentation from machine-consumable artifacts.

## When to Use

- Establishing the foundational standards for a new ecosystem or platform
- Centralizing specs, schemas, and config that multiple projects depend on
- Governing an organization's technical standards, policies, and decision records
- Creating a reference architecture that AI agents and humans consume together
- Any situation where you need a "layer 0" that everything else builds on

## What You Get

Everything from `minimal`, plus:

```
my-crucible/
├── site.yaml              # Configured with 6 sections
├── index.md               # Home page with standards status and zone overview
├── CUSTOMIZING.md         # Four-zone layout guide (AI + human friendly)
├── content/
│   ├── specs/
│   │   ├── overview.md            # Standards catalog with status table
│   │   └── spec-template.md       # Specification template (RFC 2119)
│   ├── schemas/
│   │   ├── index.md               # Schema catalog linking to raw files
│   │   └── versioning.md          # Schema versioning policy
│   ├── config/
│   │   ├── overview.md            # Config catalog overview
│   │   ├── roles.md               # Role definitions documentation
│   │   └── prompts.md             # Prompt templates documentation
│   ├── policies/
│   │   ├── security-model.md      # Security baseline
│   │   ├── dependency-policy.md   # Dependency governance
│   │   └── change-procedure.md    # How changes are approved
│   ├── guides/
│   │   ├── getting-started.md     # Consuming the crucible
│   │   └── contributing.md        # Adding specs, schemas, config
│   └── reference/
│       ├── decisions/
│       │   ├── index.md           # Decision log (ADR pattern)
│       │   └── adr-template.md    # ADR template
│       ├── changelog/
│       │   └── index.md           # Release log
│       └── glossary.md            # Terminology
├── internal/
│   └── ops/
│       └── README.md              # Explains the internal zone
└── ...
```

## Sections

| Section       | Purpose                | Typical Content                                                 |
| ------------- | ---------------------- | --------------------------------------------------------------- |
| **Specs**     | What the standards are | Specifications, technical definitions, RFC 2119 requirements    |
| **Schemas**   | The contracts          | Schema catalog, versioning policy, field documentation          |
| **Config**    | The data               | Configuration catalogs, taxonomies, role and prompt definitions |
| **Policies**  | The rules              | Security model, dependency governance, change procedures        |
| **Guides**    | How to use it          | Getting started, contributing, integration guides               |
| **Reference** | Look-up material       | Decision records, changelog, glossary                           |

## The Four-Zone Model

This is what makes crucible different from every other template. Crucibles serve two audiences simultaneously — **humans reading documentation** and **machines consuming schemas and config**. The four-zone layout makes this explicit:

```
my-crucible/
├── content/           ← RENDERED: kitfly documentation sections
├── schemas/           ← MACHINE: JSON Schema files (consumed by code)
├── config/            ← MACHINE: YAML catalogs, roles, prompts
├── internal/          ← PROJECT: repo ops, project code, automation
├── src/               ← KITFLY: site engine (standalone only)
└── scripts/           ← KITFLY: build scripts (standalone only)
```

**Zone rules:**

- `content/` documents the artifacts in other zones (e.g., `content/schemas/` documents `schemas/`)
- `schemas/` and `config/` are machine-consumable — other projects `$ref` or import from these paths
- `internal/` holds repo housekeeping, project code (lang wrappers, code generators), and automation
- `src/` and `scripts/` are kitfly's territory (standalone mode only)

For a WASM skill platform, this might look like:

- **Machine zone**: `schemas/ipc/v0/control.schema.json`, `config/agentic/roles/devlead.yaml`
- **Content zone**: `content/schemas/ipc-protocol.md` documenting those schemas
- **Internal zone**: `internal/src/` for language-specific SDK generators

## The Config Section

Crucibles define the **agentic catalog** — roles and prompts that AI agents use across the ecosystem:

```
config/agentic/
├── roles/           # WHO — role definitions (scope, mindset, anti-patterns)
├── prompts/         # HOW — reusable prompt templates for specific tasks
└── README.md
```

Roles define identity ("I am a devlead"). Prompts define approach ("Write a spec following this template"). The `content/config/` section documents these for human consumption.

## Usage

```bash
kitfly init my-crucible --template crucible
kitfly init my-crucible --template crucible --brand "Lanyte Standards"

# With AI assistance instrumentation
kitfly init my-crucible --template crucible --standalone --ai-assist
```

## Crucible vs. Other Templates

| Aspect                | Handbook     | Productbook    | Crucible                        |
| --------------------- | ------------ | -------------- | ------------------------------- |
| **Orientation**       | How we work  | What we build  | What everything is built on     |
| **Assumes**           | Team exists  | Product exists | Ecosystem starting              |
| **Key section**       | Guides       | Domain         | Specs                           |
| **Audience**          | Team members | Product team   | All consumers + machines        |
| **Tone**              | Explanatory  | Analytical     | Prescriptive (RFC 2119)         |
| **Machine artifacts** | None         | None           | Schemas + config alongside docs |

## Growing Your Crucible

As the ecosystem matures, the sections grow naturally:

**Specs accumulate as standards are defined** — each standard gets its own page:

```
content/specs/
├── overview.md
├── spec-template.md
├── skill-abi-v1.md
├── ipc-protocol.md
├── autonomy-model.md
└── capability-model.md
```

**Schemas grow with the type system** — organized by domain and version:

```
schemas/
├── ipc/v0/
│   ├── control.schema.json
│   ├── command.schema.json
│   └── telemetry.schema.json
├── skill/v0/
│   ├── manifest.schema.json
│   └── capability.schema.json
└── config/v0/
    └── autonomy-gates.schema.json
```

**Policies solidify through experience** — security model, dependency rules, and change procedures evolve.

**Decisions capture the "why"** — the ADR log becomes the institutional memory.

## Example Use Cases

**WASM Skill Platform (Lanyte)**

- Specs: Skill ABI, IPC protocol, autonomy model, capability taxonomy
- Schemas: IPC message schemas, skill manifest, assessment pipeline
- Config: Autonomy gates, delegation rules, proxy policies
- Policies: Security model, dependency policy, skill assessment criteria
- Guides: Writing skills, deployment, skill assessment process
- Reference: ADRs for architecture choices, CalVer changelog

**Enterprise Ecosystem (FulmenHQ-style)**

- Specs: Coding standards, repository category standards, testing standards
- Schemas: Logging schemas, config schemas, error handling schemas
- Config: Repository taxonomy, fixture catalog, branding ecosystem
- Policies: Stream output policy, dependency governance, publishing standards
- Guides: Bootstrap guide, integration patterns, consuming assets
- Reference: Two-tier ADR system, release notes, glossary

**Open Source Foundation**

- Specs: API standards, data format specifications, interop requirements
- Schemas: API schemas, event schemas, config schemas
- Config: Project taxonomy, maintainer roles
- Policies: Contribution policy, security disclosure, licensing
- Guides: Getting started, SDK integration, migration guides
- Reference: Governance decisions, release history, terminology
