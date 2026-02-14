---
title: "DDR-0005: Deterministic Layout Boundary"
description: "Defines the boundary between CSS layout primitives/figures and diagramming engines for slide visual composition"
author: "deliverylead"
supervised_by: "@3leapsdave"
date: "2026-02-12"
status: "proposed"
tags: ["ddr", "slides", "layout", "primitives", "figures", "diagrams"]
---

# DDR-0005: Deterministic Layout Boundary

## Status

Proposed

## Context

Kitfly generates slidesites — fixed-aspect pages that are not “infinite scroll” documents. A key use case is AI agents generating presentation-quality slides, including infographic-style layouts with shapes, connectors, and composed visual patterns. (If content is long, it may scroll _within_ the slide frame; the page layout remains slide-like.)

Kitfly is not trying to recreate diagram engines like Mermaid or PlantUML. Those tools compute layout from relationships, which is powerful but hard to control precisely in slide composition and hard for agents to predict.

We need to decide how far to push CSS-based shapes and figures before delegating to diagram engines. The risk on one side is rebuilding a diagram engine inside CSS; the risk on the other is forcing all visual compositions through tools whose auto-layout is difficult for agents to control precisely.

### Observed Problems

1. **Mermaid/PlantUML alignment** — Auto-layout engines optimize for their own constraints. Achieving pixel-precise placement within a slide's visual design is unreliable. Agents cannot predict where nodes will land.
2. **Agent reasoning** — AI agents generate better results when they can specify placement explicitly ("put X at grid position 2,1") rather than describing relationships and hoping the layout engine produces the desired visual.
3. **Scope creep** — Without a clear boundary, CSS primitives could grow into a general-purpose diagramming system, duplicating work better handled by existing engines.

## Decision

**Kitfly will maintain two distinct tiers of visual building blocks, separated by a deterministic layout boundary.**

### Tier 1: Shapes (Primitives)

Atomic visual elements (shapes, connectors, text treatments, decorators) with **no internal layout logic**. The author or agent specifies position explicitly. These are analogous to icons in an icon library.

Examples: box, circle, diamond, chevron, block-arrow, line-connector, callout, badge.

### Tier 2: Figures (Deterministic Infographic Patterns)

Parameterized layout templates built from primitives. The figure owns its **internal arrangement** via a deterministic algorithm (CSS Grid, flexbox, trigonometric placement). The agent fills named slots; the figure handles spacing, sizing, and connector routing within its bounding box.

Examples: cycle-wheel, quadrant-grid, layer-cake, funnel, hub-spoke, horizontal-flow, timeline.

### The Boundary Rule

> **If you can name the pieces and where they go (explicit positions or slots), it is a figure. If layout must be computed from relationships between a variable set of nodes, it is a diagram engine.**

| Criterion                                   | Primitives / Figures        | Diagramming Engine  |
| ------------------------------------------- | --------------------------- | ------------------- |
| Agent knows element count                   | Yes                         | Maybe not           |
| Agent controls placement                    | Yes (explicit or via slots) | No (engine decides) |
| Adding a node requires recalculating others | No                          | Yes                 |
| Relationships determine layout              | No                          | Yes                 |
| Topology is fixed per figure type           | Yes                         | No                  |

### Diagramming Engine Integration

For compositions that cross the boundary (flowcharts with variable branching, org charts, dependency graphs, state machines), kitfly's **plugin model** will wrap diagramming engines with a constrained contract:

- The plugin renders into a **declared bounding box** within the slide grid.
- The plugin accepts a **kitfly theme** (colors, fonts, stroke styles) for visual consistency.
- Internal layout is fully delegated to the engine.
- The agent does not attempt to micro-position nodes within the engine's output.

## Consequences

### Implementation Notes (M1.1)

- Core ships **shape primitives** as `.block` modifiers (for example `circle`, `diamond`, `chevron`, `block-arrow`) with deterministic CSS-only behavior.
- Simple directional flows use existing `block-flow` glyph arrows plus directional shapes; general connector routing remains deferred to plugin/engine phases.
- This keeps Tier 1 in core without crossing into layout-engine responsibilities.

### Benefits

1. **Agent reliability** — Agents produce consistent, predictable visual output for common infographic patterns that are deterministic layouts.
2. **Clear plugin contract** — Diagramming engines are scoped to a bounding box with theme passthrough, avoiding the "Mermaid vs. slide layout" fight.
3. **No engine rebuild** — We explicitly stop before reimplementing graph layout, edge routing, or constraint solving in CSS.
4. **Catalog-driven authoring** — The figure catalog acts as a vocabulary. Agents pick a pattern and fill slots, similar to choosing an icon from a set.

### Trade-offs

1. **Figure library maintenance** — Each new infographic pattern requires a new figure implementation. This is intentional — it's the cost of deterministic quality.
2. **Boundary edge cases** — Some compositions (e.g., a flow diagram with exactly 2 branch points) could go either way. Default to figures when topology is fixed and small; to engines when variable.
3. **Two rendering paths** — Slides mixing figures and engine-rendered diagrams have two rendering subsystems. The plugin model must ensure visual coherence (shared theme tokens).

## Alternatives Considered

### A. CSS-only, no diagramming engines

Rejected. Connector routing and auto-layout for arbitrary graphs is a solved problem in existing engines. Rebuilding it in CSS is high effort, low quality.

### B. Diagramming engine-only (Mermaid/PlantUML for everything)

Rejected. Agents cannot control output placement precisely enough for slide-quality layouts. Simple compositions (4-box grid, layer cake) become unnecessarily complex in diagram DSLs.

### C. Canvas/SVG drawing API exposed to agents

Rejected for primary use. Too low-level — agents generating raw SVG coordinates produce inconsistent results. However, primitives may use inline SVG internally (especially for connectors), hidden behind the primitive's API.

## References

- [Design Catalog: Shapes and Figures](../../content/reference/design-catalog.md)
- [ADR-0005: Plugin Contract and Distribution Strategy](ADR-0005-plugin-contract-and-distribution.md)
- [DDR-0004: Slides Rendering Model](DDR-0004-slides-rendering-model.md)
