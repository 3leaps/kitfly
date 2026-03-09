<!-- Retention policy: latest 3 releases, reverse-chronological. Older notes archived in docs/releases/. -->

# Kitfly v0.2.4

**Release date:** 2026-03-08

## What's new

Kitfly v0.2.4 adds the **planning-visuals plugin** with Gantt charts for timeline visualization. Unlike Mermaid's gantt (which breaks in slide viewports), Kitfly's `:::gantt` widget uses `max-depth` filtering to let the same dataset drive both summary and detail views.

### Gantt charts (`planning-visuals` plugin)

Render wave-based rollout plans, product roadmaps, or project timelines:

```yaml
:::gantt
label: "Q2-Q4 Roadmap"
time-unit: month
time-start: "2026-04"
time-end: "2026-12"
max-depth: 1
today: "2026-06"
tracks:
  - label: "Phase 1 — Foundation"
    depth: 1
    start: "2026-04"
    end: "2026-06"
    status: complete
  - label: "Phase 2 — Core Features"
    depth: 1
    start: "2026-07"
    end: "2026-09"
    status: active
  - label: "Phase 3 — Scale"
    depth: 1
    start: "2026-10"
    end: "2026-12"
    status: planned
milestones:
  - label: "Beta Launch"
    date: "2026-06"
  - label: "Public Release"
    date: "2026-09"
markers:
  - label: "Investor Review"
    date: "2026-08"
    color: "#e11d48"
:::
```

**Key features:**

- **Dual time units**: `week` (ISO weeks, `YYYY-Www`) or `month` (`YYYY-MM`) — business audiences think in months, ops teams need week precision
- **Hierarchical depth**: `max-depth: 1` shows waves only, `max-depth: 2` adds clients/items — same YAML, different views
- **Status colors**: `planned` (muted), `active` (accent), `complete` (green), `blocked` (amber)
- **Milestones**: Diamond markers for point-in-time events
- **Custom markers**: Highlight key dates with `color:` for visual emphasis
- **Overflow handling**: `max-tracks: 8` truncates with "+N more" — deterministic, no runtime measurement
- **Today marker**: Vertical dashed line when `today:` is set

Works in both docs and slides modes from day one.

### Embedded CLI documentation

Access curated documentation directly from the compiled binary — no internet or repo clone required:

```bash
kitfly docs list              # List available topics with titles
kitfly docs show <slug>       # Output raw markdown to stdout
kitfly docs show ref/config | less  # Pipe to your favorite pager
```

Build-time codegen reads `docs/embed-manifest.yaml` (include/exclude globs), strips frontmatter, and bakes content into the binary. Missing slugs suggest similar matches.

### Why Kitfly Gantt vs. Mermaid

Mermaid's gantt produces SVGs that break in fixed-aspect slide viewports when you have 5+ waves and 20+ items. Kitfly's solution: **level-of-detail control**.

```yaml
# Same data, summary view
max-depth: 1  # Wave-level bars only — for exec slides

# Same data, detail view
max-depth: 2  # Waves + client-level items — for planning reviews
```

This solves the density problem without maintaining two files or switching tools.

## Plugin usage

Add to `kitfly.plugins.yaml`:

```yaml
plugins:
  - planning-visuals
```

The plugin loads in both docs and slides modes (no `modes:` restriction).

## Breaking changes

None. New plugin — opt-in only.

## Notes for upgraders

- To use gantt charts: add `planning-visuals` to your plugin list
- See `content/reference/gantt-widget.md` for complete authoring reference
- Validators check date formats, ranges, and track ordering at build time

## Full changelog

See [CHANGELOG.md](CHANGELOG.md) for the complete list.

---

# Kitfly v0.2.3

**Release date:** 2026-02-17

## What's new

Kitfly v0.2.3 adds **content profiles** for single-source multi-audience workflows, **data-driven bindings** with `{{ key }}` substitution and snippet injection, **pre-build hooks** for generator pipelines, and **Windows cross-platform fixes** for contributors on Windows.

### Content profiles

Filter which files appear in a build based on frontmatter tags. A profile is activated via `--profile` flag or `KITFLY_PROFILE` env var:

```bash
kitfly dev ./mysite --profile alpha
kitfly build ./mysite --profile beta
KITFLY_PROFILE=alpha kitfly bundle ./mysite
```

Tag content in frontmatter:

```yaml
---
title: Engagement Timeline
profile: alpha
---
```

Files without a `profile:` field are always included. Tagged files only appear when their profile is active. This enables one kitsite to produce multiple audience-specific outputs without maintaining separate branches or copies.

Define profiles in `site.yaml`:

```yaml
profiles:
  alpha:
    description: "Includes alpha-tagged content"
    include:
      tags: ["alpha"]
  beta:
    description: "Includes beta-tagged content"
    include:
      tags: ["beta"]
```

Sites without `profiles:` in site.yaml are completely unaffected.

### Data-driven bindings

Pages can now bind to external YAML/JSON data files for value substitution and block injection. Declare the binding in frontmatter:

```yaml
---
title: Pricing
data: data/pricing.yaml
---
```

Use `{{ key }}` for value substitution and `{{ snippet:name }}` for block injection:

```markdown
Implementation rate: **{{ baseline_rate | dollar }}/hour**

## Pricing Tiers

{{ snippet:pricing-table }}
```

Data files use a structured format with globals and per-page bindings:

```yaml
globals:
  company: "Acme Corp"
  baseline_rate: "200"

pages:
  - path: content/product/pricing.md
    inject:
      hero: "Implementation and operating costs"
    snippets:
      - slot: pricing-table
        content: |
          | Tier | Price |
          |------|-------|
          | Basic | $10/mo |
          | Pro | $50/mo |
```

Note: `pages[].path` must be relative to site root including the `content/` prefix (e.g. `content/product/pricing.md`, not `product/pricing.md`).

Six built-in formatters with pipe chaining: `dollar`, `number`, `percent`, `round(n)`, `upper`, `lower`. Example: `{{ rate | round(0) | dollar }}`. The `percent` formatter expects a decimal ratio (0.0–1.0) as input, not an already-computed percentage — `"0.15"` becomes `15%`, but `"15"` would become `1500%`.

Unresolved bindings, unknown snippets, and formatter errors are build errors — never silent failures. Optional JSON Schema validation when a `.schema.json` file exists alongside the data file.

Pages without `data:` frontmatter are completely unaffected.

### Pre-build hooks

Run shell commands before dev/build/bundle via `prebuild:` in site.yaml:

```yaml
prebuild:
  - command: "bun run scripts/generate-pricing-data.ts"
    watch: ["data/raw/pricing-input.json"]
```

Hooks run sequentially before each build. In dev mode, changes to `watch:` patterns re-run the matching hook. Environment variables `KITFLY_SITE_ROOT`, `KITFLY_DATA_DIR`, `KITFLY_BUILD_MODE`, and `KITFLY_PROFILE` are set for each hook.

Non-zero exit codes halt the build with the hook's stderr as error context.

### Windows cross-platform compatibility

- Makefile `install` target uses a launcher script instead of symlinks (avoids Windows admin/Developer Mode requirement)
- Dev server browser open dispatches correctly across Windows (`cmd /c start`), macOS (`open`), and Linux (`xdg-open`)
- Build and bundle scripts normalize MSYS `/c/...` paths on Windows
- Makefile lint skips `goneat assess` on Windows (upstream glob issue)
- New Windows contributor setup guide in `docs/development.md`

### Architecture

- ADR-0006: Data-Driven Content — defines the boundary, contract, and constraints for build-time data binding
- "Kitsite" terminology adopted in README with new "What's a Kitsite?" section

## YAML parser hardening

The built-in YAML parser (used for data files) gained block scalar support needed for snippet content:

- Literal (`|`) and folded (`>`) block scalar parsing
- Direct list-item block scalars (`- |` / `- >`)
- Chomping indicators (`|+`, `|-`, `>+`, `>-`) and indentation indicators
- Malformed block scalar headers (`|abc`, `>foo`) are now rejected instead of silently converting to empty strings

## Guidance for generator authors

These patterns emerged from dogfooding and apply to any non-trivial generator:

- **The template is the contract.** Every `{{ snippet:X }}` in a markdown template means the generator must always emit a snippet named `X`, even if empty. If a section is conditionally relevant, emit it with empty string content rather than omitting it — kitfly treats missing snippets as build errors, by design.
- **Use JSON for generator output.** Generators should write JSON data files (`JSON.stringify` is deterministic in every language, no quoting ambiguity, multiline strings are unambiguous `\n`). Reserve YAML for hand-authored data files where human readability matters.
- **Separate raw input from kitfly data.** Keep generator source files in `data/raw/` and kitfly data files in `data/`. This prevents naming collisions and makes the data flow visible: `data/raw/pricing-input.json` → generator → `data/pricing.json`.
- **`percent` expects a decimal ratio.** The `percent` formatter multiplies by 100: `"0.15"` → `15%`. If your generator already computes integer percentages, store them as pre-formatted strings (`"15%"`) and don't pipe through `percent` (which would yield `1500%`).

## Breaking Changes

None. All new features are opt-in. Existing sites are unaffected.

## Notes for upgraders

- To use content profiles: add `profiles:` to `site.yaml` and `profile:` tags to content frontmatter
- To use data bindings: add `data:` to page frontmatter and create data files in `data/`
- To use pre-build hooks: add `prebuild:` to `site.yaml`
- Windows contributors: see updated `docs/development.md` for setup guide

## Deferred

- `kitfly build --check` — exit non-zero if built output differs from what's on disk (CI pipeline verification)
- `kitflygen` scaffolding tool for data generators
- Visual figures Phase 3, general connectors, `slides-embed`, `slides-refresh`
- `kitfly update` command
- Plugin repo split

## Full changelog

See [CHANGELOG.md](CHANGELOG.md) for the complete list.

---

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
