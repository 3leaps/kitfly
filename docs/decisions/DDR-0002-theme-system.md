---
title: "DDR-0002: Two-Layer Theme System"
description: "Defines the kitfly theming model: theme.yaml semantic tokens → generated CSS variables → styles.css fallbacks"
author: "deliverylead"
supervised_by: "@3leapsdave"
date: "2026-02-09"
status: "accepted"
tags: ["ddr", "theming", "css", "design"]
---

# DDR-0002: Two-Layer Theme System

## Status

Accepted

## Context

Kitfly needs a theming system that lets users customize colors and typography without editing CSS. At the same time, the shipped CSS must render correctly even without a theme file — cold-start works must work. The system must support light/dark modes, syntax highlighting themes, and user-supplied theme files alongside bundled presets.

## Decision

Adopt a **two-layer theming model** where a YAML configuration layer defines semantic design tokens and a CSS layer consumes them as custom properties, with hardcoded fallbacks.

### Layer 1: theme.yaml → CSS Variables

`theme.yaml` defines semantic color tokens and typography settings:

```yaml
colors:
  light:
    background: "#ffffff"
    surface: "#f5f7f8"
    text: "#374151"
    heading: "#152F46"
    primary: "#007182"
    accent: "#D17059"
    border: "#e5e7eb"
  dark:
    background: "#0d1117"
    surface: "#152F46"
    # ...

typography:
  body: "system"
  headings: "system"
  code: "mono"
  baseSize: "16px"
  scale: "1.25"

code:
  light: "default"
  dark: "okaidia"
```

`src/theme.ts` loads this file, deep-merges with `DEFAULT_THEME`, and calls `generateThemeCSS()` to produce a `<style id="kitfly-theme">` block that sets CSS custom properties on `:root`.

### Layer 2: styles.css Fallbacks

`src/site/styles.css` contains hardcoded fallback values in its `:root` block:

```css
:root {
  --color-bg: #ffffff;
  --color-bg-sidebar: #f8f9fa;
  --color-text: #1a1a1a;
  /* ... */
}
```

These fallbacks ensure the site renders correctly if `theme.yaml` is missing or `generateThemeCSS()` is not injected. When the theme `<style>` block is present, it overrides the fallbacks because it appears later in the document `<head>`.

### Token Mapping

| theme.yaml token | CSS variable | CSS usage |
|-------------------|-------------|-----------|
| `colors.light.background` | `--color-bg` | Page background |
| `colors.light.surface` | `--color-bg-sidebar` | Sidebar, code block backgrounds |
| `colors.light.text` | `--color-text` | Body text |
| `colors.light.textMuted` | `--color-text-muted` | Secondary text, metadata |
| `colors.light.heading` | `--color-accent` | Headings, logo color |
| `colors.light.primary` | `--color-link` | Links, active nav |
| `colors.light.primaryHover` | `--color-link-hover` | Link hover state |
| `colors.light.border` | `--color-border` | Borders, dividers |

Dark mode uses the same mapping under `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`.

### Dark Mode Strategy

Three selectors handle dark mode:

1. `@media (prefers-color-scheme: dark)` — OS-level automatic
2. `[data-theme="dark"]` — explicit user toggle
3. `:root:not([data-theme="light"])` — prevents OS dark overriding an explicit light choice

### Theme Presets

Bundled themes in `themes/` (`github.yaml`, `paper.yaml`, `terminal.yaml`) can be copied and customized. Users place their `theme.yaml` in the project root alongside `site.yaml`.

## Consequences

### Positive

- Users customize appearance via YAML without touching CSS
- CSS works standalone — no build step required to see something
- Dark mode works automatically via OS preference with manual override
- Theme presets provide starting points for customization
- Syntax highlighting themes are decoupled (Prism CDN URLs per light/dark)

### Negative

- CSS fallback values can drift from `DEFAULT_THEME` if one is updated without the other (mitigated: both live in the codebase and tests can catch drift)
- Token mapping is implicit — `surface` → `--color-bg-sidebar` isn't obvious without reading theme.ts

### Neutral

- Typography uses named presets (`system`, `serif`, `readable`) rather than raw font stacks — simple but limits advanced control

## Alternatives Considered

### CSS-only theming (no YAML)

Users edit CSS directly. Rejected because YAML is more accessible for non-developers and integrates with the existing `site.yaml` configuration model.

### CSS Modules / PostCSS pipeline

Build-time CSS transformation. Rejected because it contradicts ADR-0001 (minimalist site code) and adds build dependencies.

### Single source of truth (no CSS fallbacks)

Only generate CSS from theme.ts, no hardcoded `:root`. Rejected because it breaks cold-start: opening `styles.css` directly or loading before JS runs would show unstyled content.
