---
title: "Repository Documentation"
description: "Meta-documentation for the Kitfly repository"
author: "devlead"
date: "2026-02-04"
last_updated: "2026-02-04"
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
│   └── DDR-XXXX-*.md    # Design decisions - frontend/web (future)
└── README.md            # This file
```

## Decision Records

| ID | Title | Status |
|----|-------|--------|
| [ADR-0001](decisions/ADR-0001-minimalist-site-code.md) | Minimalist Site Code | Accepted |
| [ADR-0002](decisions/ADR-0002-ai-accessibility.md) | AI Accessibility for Published Sites | Accepted |
| [DDR-0001](decisions/DDR-0001-viewport-locked-layout.md) | Viewport-Locked Layout with Fixed Footer Ribbon | Accepted |

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

| Content | Location | Rendered by kitfly? |
|---------|----------|---------------------|
| Product docs (how to use kitfly) | `content/` | Yes |
| Repo docs (decisions, contributing) | `docs/` | No |
| Agent guide | `AGENTS.md` | No |
| Public README | `README.md` | No |

## Key Files

| File | Purpose |
|------|---------|
| `VERSION` | Version number (appears in footer, used for provenance) |
| `site.yaml` | Site configuration for the kitfly docs site |
| `theme.yaml` | Theme configuration for the kitfly docs site |
| `src/site/template.html` | HTML template with `{{variables}}` |
| `src/site/styles.css` | Default styles |

## Not Finding What You Need?

- **Product documentation**: See [content/guide/kitfly-overview.md](../content/guide/kitfly-overview.md)
- **Agent guide**: See [AGENTS.md](../AGENTS.md)
- **Architecture decisions**: See [decisions/](decisions/)
