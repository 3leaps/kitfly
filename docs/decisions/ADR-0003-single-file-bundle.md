---
title: "ADR-0003: Single-File Bundle Output"
description: "Kitfly produces a self-contained HTML file as an alternative to static site build"
author: "deliverylead"
supervised_by: "@3leapsdave"
date: "2026-02-09"
status: "accepted"
tags: ["adr", "bundle", "architecture", "sharing"]
---

# ADR-0003: Single-File Bundle Output

## Status

Accepted

## Context

Documentation is often shared outside of web hosting — via email, Slack uploads, shared drives, or USB handoff. Traditional static site generators produce a directory of HTML, CSS, JS, and images that require a web server or careful relative-path handling to open locally.

Kitfly needed a sharing model that works without any infrastructure: one file, any browser, no server.

## Decision

Implement `kitfly bundle` as a first-class output mode alongside `kitfly build`. The bundle produces a **single self-contained HTML file** with all dependencies inlined.

### What Gets Inlined

| Asset                          | Inlining Strategy                           |
| ------------------------------ | ------------------------------------------- |
| CSS (styles.css)               | `<style>` block in `<head>`                 |
| Theme CSS                      | Generated `<style id="kitfly-theme">` block |
| Images (PNG, JPG, SVG, GIF)    | Base64 data URIs in `<img src>`             |
| Brand logo + favicon           | Base64 data URIs                            |
| Prism.js (syntax highlighting) | Full JS inlined in `<script>`               |
| Mermaid (diagrams)             | Full JS inlined in `<script>`               |
| Dark mode toggle               | Inline `<script>`                           |
| All page content               | Inline HTML sections with `id` anchors      |

### Navigation Model

The bundle uses **hash-based navigation** rather than page-per-file:

- Each content page becomes a `<section id="slug">` within the single document
- Sidebar links use `href="#slug"` anchors
- JavaScript shows/hides sections on hash change
- The sidebar hierarchy uses the same `buildSectionNav()` function as the static build, with a hash-link adapter: `makeHref = (urlPath) => '#' + slugify(urlPath)`

This ensures nav structure parity between `build` and `bundle` output.

### Raw Markdown

By default, raw `.md` source is embedded in the bundle as hidden `<script type="text/markdown">` blocks, accessible to AI agents. The `--no-raw` flag omits them to reduce file size.

### File Size

Typical documentation produces 100KB–1MB bundles. Image-heavy sites are larger due to base64 overhead (~33% per image). The tradeoff is acceptable because the primary use case is sharing, not serving at scale.

## Consequences

### Positive

- **Zero-infrastructure sharing**: Email, Slack, Google Drive — recipients open in any browser
- **Offline by default**: No network requests, no CDN dependencies
- **Point-in-time snapshot**: Bundle captures exact state of docs at build time
- **Same navigation as build**: `buildSectionNav()` shared between both output modes
- **AI-accessible**: Raw markdown available inside the bundle

### Negative

- Large bundles with many images (base64 adds ~33% overhead)
- No incremental loading — entire document loads at once
- Hash navigation doesn't support deep-linking from external URLs (fine for the sharing use case)
- Prism + Mermaid JS inlining adds ~500KB to every bundle

### Neutral

- Bundle and build share `collectFiles()`, `loadConfig()`, and `buildSectionNav()` from `shared.ts` — shared code stays in one place
- Bundle is a separate script (`scripts/bundle.ts`) rather than a mode flag on `scripts/build.ts`, keeping each focused

## Alternatives Considered

### PDF export

Widely shareable but loses interactivity (dark mode, collapsible nav, syntax highlighting themes). Would require a headless browser dependency (Puppeteer/Playwright). May be added later as a third output mode.

### MHTML / Web Archive

Browser-native single-file formats. Rejected because support is inconsistent (Safari doesn't support MHTML, Chrome's implementation has quirks) and generation requires browser automation.

### ZIP of static files

Solves the single-artifact problem but requires recipients to extract before viewing. Adds friction compared to double-clicking an HTML file.
