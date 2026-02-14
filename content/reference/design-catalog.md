---
title: "Design Catalog (Shapes and Figures)"
description: "Deterministic layout building blocks for slides (and when to use diagram engines instead)"
last_updated: "2026-02-12"
---

# Design Catalog (Shapes and Figures)

Kitfly is **not** trying to recreate diagram engines like Mermaid or PlantUML.

Those tools compute layout from relationships (a graph). That’s powerful, but the output can be hard to predict and hard for AI agents to control precisely.

Kitfly’s approach is simpler: a small catalog of **deterministic** building blocks that render predictably inside a slide.

## The two layers

### Shapes (primitives)

**Shapes** are atomic building blocks with **no internal layout logic**.

They are the “ink” you can draw with:

- boxes, circles, diamonds
- arrows and connectors
- badges, labels, callouts

You (or an agent) decide where they go.

### Figures (deterministic infographic patterns)

**Figures** are composed patterns built from shapes.

A figure has a known structure (a fixed topology) and a deterministic layout algorithm, such as CSS Grid or flexbox. You fill named **slots**, and the figure handles spacing and alignment inside its bounding box.

Examples of figures we expect to support:

- timeline
- layer cake
- quadrant grid
- hub-and-spoke
- funnel
- cycle wheel

## The boundary rule (simple)

If you can enumerate the elements and assign them positions (or slots) at authoring time, it belongs in the **shapes/figures** system.

If element positions must be computed from relationships between a variable set of nodes, it belongs in a **diagram engine**.

## Why this helps (especially for AI)

- **Predictable output**: “Put this in column 2” is easier than “hope the layout engine does what I meant”.
- **Slide-quality control**: common business infographics need alignment more than graph theory.
- **Minimal surface area**: a catalog is easier to learn and easier to audit than a full diagram framework.

## Where this is going

This page is the entry point. During the v0.2.x cycle, we’ll extend it with:

- a fuller shape list (what exists, what each is for)
- a figure list (patterns, slot definitions, examples)
- guidance on when to choose figures vs Mermaid (and when not to)

## What ships now (current)

Current core support focuses on **shapes** as `.block` modifiers:

- `circle`
- `pill`
- `diamond`
- `chevron`
- `hexagon`
- `triangle`
- `block-arrow`

For simple directional storytelling, use `block-flow` with directional shapes.  
General connector routing remains deferred to plugin/engine phases.

## How to use this (today)

These examples use plain HTML inside Markdown. That’s intentional: it’s simple, deterministic, and easy for both AI agents and frontend authors to write and review.

You can use these classes in slides mode (recommended) and in docs mode when you want a diagram-like block in the middle of a page.

## Live Examples

Use the theme toggle in the header to switch light/dark and see the same examples adapt automatically.

### Shape gallery (atomic primitives)

<div class="block-grid cols-4">
  <div class="block">box</div>
  <div class="block circle accent">1</div>
  <div class="block pill accent">pill</div>
  <div class="block diamond">diamond</div>
  <div class="block chevron">chevron</div>
  <div class="block hexagon">hex</div>
  <div class="block triangle">tri</div>
  <div class="block block-arrow accent">arrow</div>
</div>

```html
<div class="block-grid cols-4">
  <div class="block">box</div>
  <div class="block circle accent">1</div>
  <div class="block pill accent">pill</div>
  <div class="block diamond">diamond</div>
  <div class="block chevron">chevron</div>
  <div class="block hexagon">hex</div>
  <div class="block triangle">tri</div>
  <div class="block block-arrow accent">arrow</div>
</div>
```

### Directional flow (no connector engine)

<div class="block-flow">
  <div class="block chevron">Intake</div>
  <div class="block block-arrow accent">Assess</div>
  <div class="block chevron">Plan</div>
  <div class="block block-arrow accent">Ship</div>
</div>

```html
<div class="block-flow">
  <div class="block chevron">Intake</div>
  <div class="block block-arrow accent">Assess</div>
  <div class="block chevron">Plan</div>
  <div class="block block-arrow accent">Ship</div>
</div>
```

### Modifier comparison (same base shape, side-by-side)

<div class="block-grid cols-4">
  <div class="block">default</div>
  <div class="block accent">accent</div>
  <div class="block outline">outline</div>
  <div class="block muted">muted</div>
</div>

```html
<div class="block-grid cols-4">
  <div class="block">default</div>
  <div class="block accent">accent</div>
  <div class="block outline">outline</div>
  <div class="block muted">muted</div>
</div>
```

### Modifier comparison on one shape (circle)

<div class="block-grid cols-4">
  <div class="block circle">A</div>
  <div class="block circle accent">A</div>
  <div class="block circle outline">A</div>
  <div class="block circle muted">A</div>
</div>

```html
<div class="block-grid cols-4">
  <div class="block circle">A</div>
  <div class="block circle accent">A</div>
  <div class="block circle outline">A</div>
  <div class="block circle muted">A</div>
</div>
```
