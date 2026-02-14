---
title: "DDR-0004: Slides Rendering Model"
description: "Defines slides mode rendering, segmentation, and navigation behavior across dev/build/bundle"
author: "devlead"
supervised_by: "@3leapsdave"
date: "2026-02-11"
status: "proposed"
tags: ["ddr", "slides", "layout", "routing", "rendering"]
---

# DDR-0004: Slides Rendering Model

## Status

Proposed

## Context

Kitfly is adding a new `mode: slides` experience for fixed-aspect presentation output while preserving existing docs mode behavior.

A design-level decision is needed so all render paths (`dev`, `build`, `bundle`) behave consistently and remain minimal.

## Decision

### 1. Single-page, hash-routed slides

Slides mode renders as a single-page deck with hash navigation (`#slide-n`).

Behavior:

- prev/next controls update active slide,
- keyboard navigation supports ArrowLeft/ArrowRight/Space/Home/End,
- URL hash deep-links and restores slide state on reload.

### 2. Explicit slide segmentation delimiter

Within a markdown file, slide boundaries use:

`--- slide ---`

Rules:

- standard YAML frontmatter remains unchanged,
- plain markdown `---` is treated as content (horizontal rule),
- one file per slide remains a first-class authoring model.

### 3. Frontmatter metadata for slide behavior

Per-slide frontmatter supports:

- `title` for sidebar/counter labels,
- `class` for slide-level layout/style hooks.

Rendered slide wrapper form:

`<section class="slide {frontmatter.class?}"> ... </section>`

### 4. Mode branch with parity requirement

Slides mode is a rendering branch, not a separate engine.

Parity requirement:

- `scripts/dev.ts`, `scripts/build.ts`, and `scripts/bundle.ts` must produce equivalent slide ordering, segmentation, and navigation semantics.
- Shared logic should live in `src/shared.ts` where feasible to avoid divergence.

### 5. Overflow policy

Default slide frame behavior is scrollable overflow (`overflow: auto`) to avoid silent content clipping. Optional strict clipping can be enabled via slide class if needed.

## Consequences

### Positive

- Deterministic routing and shareable deep links.
- Lower ambiguity for authors/agents due to explicit delimiter.
- Consistent output across dev/build/bundle.
- Keeps core implementation compact and understandable.

### Negative

- Authors must learn a non-standard delimiter token for intra-file slides.
- Very dense slides may still need manual content shaping for best presentation quality.

### Neutral

- Slides mode does not aim to replace full presentation suites; it optimizes markdown-native, web-first decks.

## Non-Goals

- Animated transitions in core,
- presenter mode/speaker notes in core,
- runtime slide master system,
- swipe gestures requirement for v1.

## Alternatives Considered

### Multi-page slide routing

Rejected for v1 due to higher complexity and weaker parity with single-file bundle behavior.

### Reusing plain `---` as slide break

Rejected due to ambiguity with frontmatter and horizontal-rule markdown usage.

### Hidden overflow by default

Rejected because clipped content fails silently and is hard to debug during authoring.

## References

- v0.2.0 slides mode plan (`.plans/active/v0.2.0/`)
- [DDR-0001: Viewport-Locked Layout](DDR-0001-viewport-locked-layout.md)
