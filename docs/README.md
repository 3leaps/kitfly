---
title: "Repository Documentation"
description: "Meta-documentation for the Kitfly repository"
author: "devlead"
date: "2026-02-04"
last_updated: "2026-02-12"
status: "approved"
---

# Kitfly Repository Documentation

This `docs/` directory contains documentation about the **kitfly repository itself** — decisions, contributing guidelines, and development notes.

For **product documentation** (how to use kitfly), see [`content/`](../content/) or run `kitfly dev`.

## Structure

```
docs/
├── decisions/           # Architecture Decision Records
│   ├── ADR-XXXX-*.md    # Architecture decisions
│   ├── SDR-XXXX-*.md    # Security decisions (future)
│   └── DDR-XXXX-*.md    # Design decisions - frontend/web
├── releases/            # Release notes per version
├── userguide/           # CLI and feature documentation
├── development.md       # Contributor setup (prerequisites, bootstrap)
└── README.md            # This file
```

## Decision Records

| ID                                                                 | Title                                           | Status   |
| ------------------------------------------------------------------ | ----------------------------------------------- | -------- |
| [ADR-0001](decisions/ADR-0001-minimalist-site-code.md)             | Minimalist Site Code                            | Accepted |
| [ADR-0002](decisions/ADR-0002-ai-accessibility.md)                 | AI Accessibility for Published Sites            | Accepted |
| [ADR-0003](decisions/ADR-0003-single-file-bundle.md)               | Single-File Bundle Output                       | Accepted |
| [ADR-0004](decisions/ADR-0004-bun-runtime.md)                      | Bun Runtime                                     | Accepted |
| [ADR-0005](decisions/ADR-0005-plugin-contract-and-distribution.md) | Plugin Contract and Distribution Strategy       | Proposed |
| [DDR-0001](decisions/DDR-0001-viewport-locked-layout.md)           | Viewport-Locked Layout with Fixed Footer Ribbon | Accepted |
| [DDR-0002](decisions/DDR-0002-theme-system.md)                     | Two-Layer Theme System                          | Accepted |
| [DDR-0003](decisions/DDR-0003-bounded-logo-slot.md)                | Bounded Logo Slot                               | Accepted |
| [DDR-0004](decisions/DDR-0004-slides-rendering-model.md)           | Slides Rendering Model                          | Proposed |
| [DDR-0005](decisions/DDR-0005-deterministic-layout-boundary.md)    | Deterministic Layout Boundary                   | Proposed |

## Conventions

### ADR (Architecture Decision Record)

For significant technical decisions affecting the codebase structure, dependencies, or patterns.

### SDR (Security Decision Record)

For security-related decisions: authentication, authorization, data handling, supply chain.

### DDR (Design Decision Record)

For frontend/web design decisions: layout, accessibility, responsive behavior, visual patterns.

## Adding a Decision

1. Create a new file: `{TYPE}-{NNNN}-{slug}.md`
2. Use the template from existing decisions
3. Set status to `proposed`
4. After review, update status to `accepted` or `rejected`

## What Goes Where

| Content                             | Location    | Rendered by kitfly?                                                                        |
| ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| Product docs (how to use kitfly)    | `content/`  | Yes                                                                                        |
| Repo docs (decisions, contributing) | `docs/`     | Some (this repo’s docs site exposes `docs/userguide` and `docs/decisions` via `site.yaml`) |
| Agent guide                         | `AGENTS.md` | No                                                                                         |
| Public README                       | `README.md` | No                                                                                         |

## Key Files

| File                     | Purpose                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `VERSION`                | Repo version number (used by releases and `kitfly version`; sites can optionally display a site version via `site.yaml`) |
| `site.yaml`              | Site configuration for the kitfly docs site                                                                              |
| `theme.yaml`             | Theme configuration for the kitfly docs site                                                                             |
| `src/site/template.html` | HTML template with `{{variables}}`                                                                                       |
| `src/site/styles.css`    | Default styles                                                                                                           |

## Not Finding What You Need?

- **Product documentation**: See [content/guide/kitfly-overview.md](../content/guide/kitfly-overview.md)
- **Agent guide**: See [AGENTS.md](../AGENTS.md)
- **Architecture decisions**: See [decisions/](decisions/)
