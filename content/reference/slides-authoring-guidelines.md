---
title: "Slides Authoring Guidelines"
description: "Practical density and layout rules for reliable Kitfly slides"
last_updated: "2026-02-15"
---

# Slides Authoring Guidelines

This page is for slide authors and AI agents generating slide content.

Goal: avoid common layouts that look broken but are actually content-density issues.

## Quick rules

- Keep vertical visuals short. If a slide is tall and busy, trim items before adding more styling.
- Treat highlighted (`.accent`) blocks as emphasis, not interaction.
- Scroll in slides mode is allowed for dense content. Prefer no scroll for presentation slides.

## DF-006: Single `.accent` in `.block-grid` looks like a tab

### Problem

When one block in a row is accented and others are not, users read it as a selected tab and expect click behavior.

### Do this

- In one grid row, accent all blocks or accent none.
- If you need real tabs, treat that as a future widget (`slides-widgets`), not static blocks.

### Avoid this

```html
<div class="block-grid cols-3">
  <div class="block">Backend</div>
  <div class="block accent">Platform</div>
  <div class="block">SRE</div>
</div>
```

### Prefer this

```html
<div class="block-grid cols-3">
  <div class="block accent">Backend</div>
  <div class="block accent">Platform</div>
  <div class="block accent">SRE</div>
</div>
```

or

```html
<div class="block-grid cols-3">
  <div class="block">Backend</div>
  <div class="block">Platform</div>
  <div class="block">SRE</div>
</div>
```

## DF-007: `block-flow.vertical` can overflow at 4/3

### Problem

`.block-flow.vertical` (HTML: `class="block-flow vertical"`) with 4 steps can exceed the visible frame at `4/3`.

### Do this

- At `4/3`: limit vertical flows to 3 blocks.
- At `16/9`: 4 blocks is usually fine.
- If the slide also has extra text/callouts, reduce steps further.

### Guidance

- If you must keep all steps, scroll is acceptable.
- For presentation-first slides, split into two slides instead.

### Example target

```html
<div class="block-flow vertical">
  <div class="block">1. Intake</div>
  <div class="block">2. Validate</div>
  <div class="block">3. Ship</div>
</div>
```

## DF-014: `timeline-vertical` + callout can clip at 16/9

### Problem

A 5-event vertical timeline plus a callout often exceeds the frame at `16/9`.

### Do this

- At `16/9`: keep `timeline-vertical` to 4 events when the slide also has a callout.
- At `4/3`: keep to 3 events with a callout.
- If you need all events, remove the callout or move it to a follow-up slide.

### Example (safe with callout)

```markdown
:::timeline-vertical
events:
- label: "Detect"
  date: "09:15"
- label: "Triage"
  date: "09:24"
- label: "Mitigate"
  date: "09:42"
- label: "Recover"
  date: "10:08"
:::

> WARNING: External API fallback remained active for 12 minutes.
```

## Aspect ratio checklist

- `16/9`: medium density, but still cap long vertical stacks.
- `4/3`: tighter vertical budget. Reduce stacked items first.
- `16/10`: between `16/9` and `4/3`; apply the same conservative limits when callouts are present.

## Summary

These are authoring constraints, not renderer bugs. When a slide clips:

1. Reduce vertical item count.
2. Remove or move callouts.
3. Split dense content across two slides.
