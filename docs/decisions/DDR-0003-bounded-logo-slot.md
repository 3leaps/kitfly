---
title: "DDR-0003: Bounded Logo Slot"
description: "Logo rendering uses a bounded bounding-box model supporting both square icons and wide wordmarks"
author: "deliverylead"
supervised_by: "@3leapsdave"
date: "2026-02-09"
status: "accepted"
tags: ["ddr", "logo", "css", "branding"]
---

# DDR-0003: Bounded Logo Slot

## Status

Accepted

## Context

Kitfly sites display a brand logo in the sidebar header. Logos come in two aspect ratios:

- **Square icons** (1:1 or near-square) — app icons, monograms, favicons scaled up
- **Wide wordmarks** (3:1 or wider) — full brand names, logotypes with text

The previous implementation used a fixed pixel height for the logo image, which worked for one shape but not the other. A square icon at 64px rendered fine; the same 64px height on a wide wordmark meant it consumed most of the sidebar width and pushed navigation down. Conversely, constraining width for wordmarks made square icons tiny.

## Decision

Use a **bounded bounding-box model** where the logo slot defines maximum dimensions per breakpoint, and the image fills the box while preserving its native aspect ratio.

### Slot Dimensions

| Breakpoint         | Max Height | Max Width |
| ------------------ | ---------- | --------- |
| Desktop (> 1024px) | 64px       | 180px     |
| Tablet (≤ 1024px)  | 56px       | 150px     |
| Mobile (≤ 768px)   | 48px       | 130px     |

### CSS Implementation

```css
.logo-icon {
  height: 64px;
  width: auto;
  max-width: 180px;
}
```

The key properties:

- `height` sets the box height (the dominant constraint for square icons)
- `width: auto` preserves aspect ratio
- `max-width` prevents wide wordmarks from overflowing the sidebar

For wordmark logos, the `.logo-wordmark` class switches the constraint axis:

```css
.logo.logo-wordmark .logo-img {
  max-width: 180px;
  height: auto;
  max-height: 64px;
}
```

### logoType Configuration

`site.yaml` supports `brand.logoType` to select the rendering mode:

| Value              | Behavior                                       |
| ------------------ | ---------------------------------------------- |
| `"icon"` (default) | Height-dominant constraint, square/near-square |
| `"wordmark"`       | Width-dominant constraint, wide aspect ratio   |

The bundle system propagates `logoType` via `buildBundleSidebarHeader()` to ensure parity between build and bundle output.

### Supported Formats

- **PNG**: Recommended for icons. Use `kitfly-logo-128.png` at 128px for 2x retina clarity in the 64px slot.
- **SVG**: Supported but requires a tightly-cropped `viewBox`. An oversized canvas (e.g., A4 page `viewBox="0 0 210 297"`) will render the artwork too small within the bounded slot.

## Consequences

### Positive

- Both icon and wordmark logos render cleanly without CSS customization
- Responsive scaling is automatic — one set of breakpoints handles both shapes
- No logo distortion — aspect ratio is always preserved
- Bundle output matches static build (logoType propagation)

### Negative

- SVG logos with oversized viewBox render poorly — users must crop the viewBox to artwork bounds (documented in configuration reference)
- Two rendering modes (`icon` vs `wordmark`) add a configuration choice — mitigated by defaulting to `icon` which handles most cases

## Alternatives Considered

### Fixed pixel dimensions

Single `width: 120px; height: 40px` for all logos. Rejected because it distorts non-matching aspect ratios and doesn't adapt to breakpoints.

### Percentage-based sizing

`width: 60%` of sidebar. Rejected because it couples logo size to sidebar width and produces inconsistent results across breakpoints (280px desktop vs overlay mobile).

### User-specified dimensions in site.yaml

Let users set `logo.width` and `logo.height` in config. Rejected as over-engineering — the bounded box handles the common cases, and users can override via custom CSS if needed.
