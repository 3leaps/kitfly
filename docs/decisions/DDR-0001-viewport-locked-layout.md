---
title: "DDR-0001: Viewport-Locked Layout with Fixed Footer Ribbon"
description: "Defines the kitfly page layout model: fixed chrome (header/footer) with scrollable middle band"
author: "uxdev"
supervised_by: "@3leapsdave"
date: "2026-02-06"
status: "accepted"
tags: ["ddr", "layout", "css", "ux"]
---

# DDR-0001: Viewport-Locked Layout with Fixed Footer Ribbon

## Status

Accepted

## Context

Kitfly sites use a three-column layout: sidebar navigation, main content, and a table-of-contents panel. The original footer was appended to the content flow with `margin-left` to offset past the sidebar, which caused several problems:

- Footer only covered the content pane, not the full viewport width
- Sidebar navigation extended below the footer, breaking visual hierarchy
- Footer position depended on content length — short pages had it mid-screen, long pages required scrolling to find it
- On mobile the footer needed separate margin overrides per breakpoint

## Decision

Adopt a **viewport-locked layout** where fixed chrome (footer ribbon, and mobile header) occupies known height at viewport edges, and the middle band (sidebar + content + TOC) fills the remaining space between them.

### Layout Model

```
┌──────────────────────────────────────────────────┐
│ (mobile header — 768px and below only)           │
├────────────┬─────────────────────────┬───────────┤
│            │                         │           │
│  SIDEBAR   │       CONTENT           │   TOC     │
│  fixed     │       scrollable        │   fixed   │
│  left      │       center            │   right   │
│  280px     │       flex: 1           │   200px   │
│            │                         │           │
│  top: 0    │  margin-left: sidebar   │  top: 6r  │
│  bottom:   │  padding-bottom:        │           │
│   footer   │   footer + 1rem        │           │
│            │                         │           │
├────────────┴─────────────────────────┴───────────┤
│                 FOOTER RIBBON                     │
│  position: fixed; bottom: 0; left: 0; right: 0   │
│  height: var(--footer-height)  z-index: 300       │
│  full-width — spans all columns                   │
└──────────────────────────────────────────────────┘
```

### CSS Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `--sidebar-width` | `280px` | Sidebar column width |
| `--footer-height` | `2.25rem` | Footer ribbon height |

### Z-Index Stack

| Layer | Z-Index | Element |
|-------|---------|---------|
| Footer ribbon | 300 | `.site-footer` |
| Mobile header | 200 | `.mobile-header` |
| Mobile sidebar | 100 | `.sidebar` (mobile overlay) |

### Key Rules

1. **Footer is viewport-fixed**, not content-appended. It uses `position: fixed; bottom: 0` and spans full width.
2. **Sidebar stops above footer** via `bottom: var(--footer-height)` — no overlap, sidebar scrolls independently within its band.
3. **Content has bottom padding** of `calc(var(--footer-height) + 1rem)` so the last content line is never hidden behind the footer.
4. **Layout min-height** is `calc(100vh - var(--footer-height))` to prevent the document from extending behind the footer.
5. **Mobile breakpoints** inherit the same `--footer-height` variable — no per-breakpoint footer overrides needed.
6. **Print styles** hide the footer entirely (`.site-footer { display: none !important }`).

### Responsive Behavior

| Breakpoint | Sidebar | TOC | Footer |
|------------|---------|-----|--------|
| > 1200px | Fixed left | Fixed right | Fixed bottom, full-width |
| 769–1200px | Fixed left (240px) | Hidden | Fixed bottom, full-width |
| ≤ 768px | Overlay (toggle) | Hidden | Fixed bottom, full-width |

The footer ribbon is consistent across all breakpoints — it never changes position or width.

## Consequences

### Positive

- Footer is always visible as a status/provenance ribbon without scrolling
- Sidebar navigation never extends below footer
- Single `--footer-height` variable controls all spacing — easy to adjust
- No per-breakpoint footer margin overrides
- Clean visual hierarchy: chrome frames content

### Negative

- Content needs `padding-bottom` to avoid being hidden — if `--footer-height` changes, padding must match (mitigated by using the CSS variable)
- Fixed footer consumes ~36px of viewport permanently — acceptable for the information density it provides (version, date, copyright, brand link)

## Alternatives Considered

### Sticky footer (content-appended)
The original approach. Footer stays in document flow but sticks to bottom on short pages. Rejected because it doesn't span the sidebar and creates layout inconsistencies across page lengths.

### CSS Grid viewport layout
Use `grid-template-rows: 1fr auto` on the body. Would work but requires restructuring the HTML template (moving sidebar inside a grid container). More invasive than necessary for the current fix.
