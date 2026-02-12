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

This page is the entry point. During the v0.2.0 dev phase, we’ll extend it into:
- a shape list (what exists, what each is for)
- a figure list (patterns, slot definitions, examples)
- guidance on when to choose figures vs Mermaid

