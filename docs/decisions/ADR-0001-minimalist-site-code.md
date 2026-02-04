---
title: "ADR-0001: Minimalist Site Code"
description: "Defines thresholds for the site code that kitfly copies to user projects"
author: "devlead"
supervised_by: "@3leapsdave"
date: "2026-02-04"
status: "accepted"
tags: ["adr", "architecture", "minimalism", "site-code"]
---

# ADR-0001: Minimalist Site Code

## Status

Accepted

## Context

When users run `kitfly init`, they receive a complete, standalone site with rendering code. This code becomes **theirs** — they can modify it, version it, and maintain it.

The site code must be:

- **Small**: Understandable in an afternoon
- **Reviewable**: A security-conscious user can audit it
- **Modifiable**: Users can customize without fear
- **Maintainable**: One dependency, no churn

This ADR defines what belongs in site code vs. what stays in the kitfly CLI.

## Decision

### Site Code Thresholds

The site code that `kitfly init` copies should stay within these bounds:

| Metric | Target | Hard Limit |
|--------|--------|------------|
| Total lines (scripts/) | ~500 | 800 |
| Dependencies | 1 (marked) | 2 |
| Files copied | ~10 | 15 |

### What Belongs in Site Code

| Component | Purpose | Approximate Size |
|-----------|---------|------------------|
| `scripts/dev.ts` | Dev server with hot reload | ~400 lines |
| `scripts/build.ts` | Static site generation | ~350 lines |
| `scripts/bundle.ts` | Single-file HTML output | ~250 lines |
| `src/theme.ts` | Theme loading and CSS generation | ~150 lines |
| `src/engine.ts` | Path utilities | ~20 lines |
| `src/site/template.html` | HTML template | ~150 lines |
| `src/site/styles.css` | Default styles | ~400 lines |

**Rule of thumb**: If it can be done with CSS, vanilla JS under 50 lines, or a marked plugin, it belongs in site code.

### What Stays in Kitfly CLI

| Component | Purpose | Reason |
|-----------|---------|--------|
| `src/cli.ts` | CLI entry point | Users don't need this |
| `src/commands/init.ts` | Project scaffolding | Meta-tooling |
| `src/commands/update.ts` | Site code updates | Meta-tooling |
| `content/` | Kitfly's own docs | Not user content |
| `assets/brand/` | Kitfly branding | Users have their own |

### Feature Evaluation

Before adding any feature to site code:

1. **Check the line budget** — Will this exceed 800 lines?
2. **Check the dependency count** — Does this require a new dependency?
3. **Check the complexity** — Can a user understand this in an afternoon?
4. **Check the necessity** — Is this core rendering, or CLI convenience?

Features that fail these checks should:
- Stay in the kitfly CLI (not copied to user sites)
- Be implemented as optional user customization
- Trigger a discussion about whether we're solving the right problem

### Migration Path

If site code grows beyond thresholds:

1. **Refactor first** — Can we simplify?
2. **Extract to CLI** — Move non-essential features to kitfly CLI
3. **Document the tradeoff** — If complexity is unavoidable, explain why

Users who need more should migrate to Astro, VitePress, or similar. Their content is just markdown — migration is straightforward.

## Consequences

### Positive

- Users receive code they can actually understand
- Security review is feasible (small surface area)
- Modifications don't require framework knowledge
- One `bun install` and they're running

### Negative

- Some features require discipline to implement minimally
- Visual sophistication bounded by CSS capabilities
- Power users may want more than we provide

### Neutral

- Feature requests require threshold evaluation
- "Can we add X?" becomes a structured conversation

## Compliance

All changes to files under `scripts/`, `src/site/`, `src/engine.ts`, or `src/theme.ts` must consider this ADR. These files are copied to user projects.

## References

- [Kitfly Overview](../../content/guide/kitfly-overview.md) — Product philosophy
- Handbook ADR-0001 — Original minimalist thresholds
