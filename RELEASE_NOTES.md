<!-- Retention policy: latest 3 releases, reverse-chronological. Older notes archived in docs/releases/. -->

# Kitfly v0.2.5

**Release date:** 2026-06-22

Maintenance release: CI/release hardening and a dependency refresh. No user-facing feature changes; no breaking changes.

## Fixed

- **npm publish robustness.** The publish workflow now generates the embedded CLI docs (`src/generated/embedded-docs.ts`, which backs `kitfly docs`) before packing. That file is gitignored and is not produced by `bun run build`, so an automated publish from a clean checkout could have shipped a package whose `kitfly docs` command fails to load.

## Changed

- **GitHub Actions on Node 24:** `actions/checkout` v4 → v5 and `actions/setup-node` v4 → v6 (npm publish now runs on Node 24); `oven-sh/setup-bun@v2` already targets Node 24. Clears the upstream Node 20 runtime deprecation.
- **DRY workflows:** the Bun-setup + install + embed step is consolidated into a shared `./.github/actions/build-prep` composite action used by the release, Windows ARM64, and npm-publish workflows.
- **Dependency refresh (patch + minor):** `@3leaps/sysprims` 0.1.15, `@fulmenhq/tsfulmen` 0.2.10, `@biomejs/biome` 2.5.0, `vitest` / `@vitest/coverage-v8` 4.1.9, `@types/bun` 1.3.14, `prettier` 3.8.4. The `marked` 18 and `typescript` 6 majors are deferred to dedicated upgrades.

## Upgrading

Nothing to do — drop-in patch.

## Full changelog

See [CHANGELOG.md](CHANGELOG.md) for the complete list.

---

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
