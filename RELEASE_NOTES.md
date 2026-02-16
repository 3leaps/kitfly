<!-- Retention policy: latest 3 releases, reverse-chronological. Older notes archived in docs/releases/. -->

# Kitfly v0.2.2

**Release date:** 2026-02-16

## What's new

Kitfly v0.2.2 adds two new CDN plugins (**charts** and **math typesetting**), a **brief template** for product documentation, **footer logo** support, **dark mode logo variants**, and **hierarchical slide navigation** for decks with nested content.

### Charts plugin (`slides-charts-lite`)

Bar, line, and pie charts via Chart.js 4.4.7 CDN. Author charts using fenced code blocks:

````text
```chart
type: bar
labels: ["Q1", "Q2", "Q3", "Q4"]
data: [12, 19, 8, 15]
```
````

Charts render inline, respect theme colors, and re-render on light/dark mode toggle. Works in dev, build, and bundle output.

### LaTeX plugin (`latex`)

Math typesetting via KaTeX 0.16.21 CDN. Three authoring modes:

- Inline: `$E = mc^2$`
- Display: `$$\int_0^\infty e^{-x} dx = 1$$`
- Fenced: ` ```math ` blocks

Works in both docs and slides modes.

### Brief template

New `kitfly init --template brief` for external-audience product documentation. Four sections: Product, Use Cases, Getting Started, Reference. Includes starter content with `<!-- ← CUSTOMIZE -->` markers.

### Footer logo

Add an image logo to the footer ribbon — typically a parent company or client logo distinct from the header brand:

```yaml
footer:
  logo: "assets/brand/footer-logo.png"
  logoUrl: "https://example.com"
  logoAlt: "Example Corp"
  logoHeight: 24
```

Renders at the leading edge of the footer, before version and publish date. All fields are optional.

### Dark mode logo variants

Provide separate light/dark images for precise brand control:

```yaml
brand:
  logo: "assets/brand/logo.png"
  logoDark: "assets/brand/logo-dark.png"

footer:
  logo: "assets/brand/footer-logo.png"
  logoDark: "assets/brand/footer-logo-dark.png"
```

When `logoDark` is set, kitfly shows it in dark mode instead of applying the default brightness filter. The swap is pure CSS — instant on theme toggle, no JavaScript.

### Hierarchical slide navigation

Slide decks with subfolder content now render nested navigation with collapsible groups, matching the same tree pattern docs mode already uses:

```
Data Integration
  ├── Overview
  ├── Sources
  │   └── POS Data
  ├── Transforms
  │   └── ETL Pipeline
```

When content has no subfolders (the common case), the output is identical to the previous flat nav. Works in dev, build, and bundle.

### Branding documentation

New canonical branding guide covering header logos, footer logos, dark mode variants, and recommended asset files. Configuration reference updated with all new fields.

### Template brand asset docs

All built-in templates (handbook, runbook, brief, deck) updated with expanded Brand Assets documentation covering footer logo and dark mode variant configuration.

## Notes for upgraders

- No breaking changes.
- To use charts: add `slides-charts-lite` to your `kitfly.plugins.yaml`.
- To use math: add `latex` to your `kitfly.plugins.yaml`.
- Footer logo and dark mode logo fields are optional — existing sites are unaffected.

## Plugin fixes

- Fixed `$` replacement corruption in template injection that broke LaTeX delimiter rendering
- Fixed CDN loader path resolution for LaTeX plugin assets

## Deferred to v0.3.0

- Build-time marked extension hook (both plugins sidestepped the need)
- Visual figures Phase 3 (radial types)
- `slides-embed` (iframe/video)
- Offline cache polish
- PlantUML rendering (no viable client-side option)
- Windows operation (separate release)

## Full changelog

See [CHANGELOG.md](CHANGELOG.md) for the complete list.

---

# Kitfly v0.2.1

**Release date:** 2026-02-15

## What's new

Kitfly v0.2.1 completes **Phase 2 of the visual figures** set in the `slides-visuals` plugin, adding five new `:::` figure types for timelines, flows, and maturity models. It also improves developer experience with friendlier error handling and new authoring guidelines.

### Phase 2 figures (`slides-visuals` plugin)

Five new deterministic figure types, all following the same `:::` fence contract introduced in v0.2.0:

| Figure                | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `timeline-horizontal` | Left-to-right chronology strip (flexbox)                  |
| `timeline-vertical`   | Top-to-bottom chronology (flexbox)                        |
| `flow-branching`      | Single split point with deterministic branches (CSS grid) |
| `flow-converging`     | Multiple inputs merging to one output (CSS grid)          |
| `staircase`           | Ascending/descending stepped blocks for maturity models   |

Example:

```text
:::timeline-horizontal
events:
  - label: "Kickoff"
    date: "Jan 2026"
  - label: "Alpha"
    date: "Mar 2026"
  - label: "GA Release"
    date: "Jun 2026"
:::
```

All five types work in dev, build, and bundle output. They respect theme colors and dark mode. Validation rejects missing required fields with clear diagnostics.

### Friendlier plugin errors in dev preview

When a plugin version mismatch or loader error occurs, the dev server now renders a styled error page with actionable guidance instead of a raw 500 stack trace.

### Slides authoring guidelines

New reference doc (`content/reference/slides-authoring-guidelines.md`) with practical do/don't guidance for content-density pitfalls discovered during dogfooding:

- Don't use `.accent` on a single block in a grid row (looks like a selected tab)
- Limit vertical flows to 3 blocks at 4:3 aspect ratio
- Limit `timeline-vertical` to 4 events at 16:9, 3 at 4:3

### Test compatibility

Fixed vitest/bun dual-runtime compatibility so `bunx vitest run` and `bun test` both work cleanly.

## Breaking Changes

None.

## Deferred to v0.2.2

- `slides-charts-lite` (CDN/SRI pattern)
- `latex` (KaTeX, same CDN pattern)
- Build-time `:::` support via marked extension hook (decision memo in progress)
- `slides-embed` (iframe/video)

---

# Kitfly v0.2.0

**Release date:** 2026-02-14

## What's new

Kitfly v0.2.0 adds **slides mode** and a minimal **plugin system** — so you can ship fixed-aspect decks, add optional visuals/widgets, and still keep the core small and auditable.

### Slides mode (`mode: slides`)

Slides mode renders your content as a single-page, hash-routed deck (`#slide-n`) with keyboard navigation and a fixed aspect ratio.

```yaml
# site.yaml
mode: slides
aspect: "16/9"
```

Authoring models:

- **One file per slide**
- **One file, many slides** using the explicit delimiter: `--- slide ---`

If you're starting fresh, `kitfly init --template deck` gives you a ready-to-edit slide project.

### Plugins (optional, pinned, integrity-checked)

Plugins are small opt-in add-ons that inject CSS/JS. They are designed to stay minimal and predictable:

- **Pinned** versions (`name@x.y.z`)
- **Integrity checked** assets (sha256)
- Optional **mode allowlists** (run only in `slides`, etc.)

Enable plugins via `kitfly.plugins.yaml` in your site root.

### `callouts` plugin

The `callouts` plugin transforms blockquotes starting with NOTE:/TIP:/WARNING:/INFO:/DANGER: into styled callout boxes. Works in both docs and slides modes.

### `slides-visuals` and the `:::` fence contract

The first "live slides" plugin, `slides-visuals`, introduces a strict `:::` block syntax for widgets and deterministic figures.

### Deterministic design primitives (shapes + figures)

v0.2.0 introduces core CSS primitives for slide-friendly visuals (block flow/grid plus shape modifiers) and documents a design catalog to standardize terminology.

### Server management

New CLI commands for managing dev server instances:

- `kitfly servers` — list running dev servers
- `kitfly stop <port|all>` — stop dev server(s)
- `kitfly logs <port>` — view daemon server logs (supports `--follow`)

### Site versioning

Set `version` in `site.yaml` to display your site's version in the sidebar and footer.

### Bundle output separation

Bundle output now writes to `bundles/` (separate from `dist/`) so static-deploy and single-file outputs don't interfere.

## Breaking Changes

None for docs-mode sites. If you enable `slides-visuals`, invalid `:::` blocks are now treated as build errors (by design).

## Deferred to v0.2.1

- `slides-charts-lite`, `slides-refresh`, `slides-embed`
- Build-time `:::` support via a marked extension hook
