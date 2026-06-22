# Changelog

All notable changes to Kitfly are documented here.

## [0.2.5] - 2026-06-22

Maintenance release: CI/release hardening and a dependency refresh. No
user-facing feature changes; no breaking changes.

### Fixed

- **npm publish workflow:** generate embedded CLI docs
  (`src/generated/embedded-docs.ts`) before packing. `bun run build` does not
  produce this generated file and it is gitignored, so an automated publish from
  a clean checkout could have shipped a package with a broken `kitfly docs`
  command. The publish path now generates it explicitly.

### Changed

- **GitHub Actions Node 24 migration:** `actions/checkout@v4 → v5`,
  `actions/setup-node@v4 → v6` (npm publish now runs on Node 24).
  `oven-sh/setup-bun@v2` already targets Node 24. Clears the Node 20 runtime
  deprecation.
- **DRY release workflows:** the build-time embedded-asset step is consolidated
  into a shared `./.github/actions/build-prep` composite action (Bun setup +
  frozen install + embed), used by the release, Windows ARM64, and npm-publish
  workflows. Previously inlined separately in each, which caused per-workflow
  drift during the v0.2.4 cycle.
- **Dependencies (patch + minor):** `@3leaps/sysprims` 0.1.15,
  `@fulmenhq/tsfulmen` 0.2.10, `@biomejs/biome` 2.5.0, `vitest` /
  `@vitest/coverage-v8` 4.1.9, `@types/bun` 1.3.14, `prettier` 3.8.4.
  (`marked` 18 and `typescript` 6 majors deferred to dedicated upgrades.)

## [0.2.4] - 2026-03-08

### Added

- **Planning visuals plugin** (`planning-visuals`): Gantt charts for docs and slides with `:::gantt` fenced blocks
- Week and month time-axis support with ISO week date parsing (`YYYY-Www`) and month ordinals (`YYYY-MM`)
- Hierarchical depth filtering (`max-depth`) — same dataset drives summary views (depth 1) and detail views (depth 2+)
- Track status colors: `planned`, `active`, `complete`, `blocked` with dark mode adaptation
- Milestones as distinct point-in-time markers (diamond icons, separate from duration tracks)
- Chart-level markers with custom colors for highlighting key dates
- `max-tracks` truncation with "+N more" overflow indicator for dense timelines
- `today` marker: vertical dashed line at specified date
- Dual-mode rendering: works in both docs mode (`<main class="content">`) and slides mode (`.slide` containers)
- Comprehensive fence validation with semantic date/range checking in build/dev/bundle pipelines
- Sparse week-axis labeling (every Nth week when >16 units) with abbreviated format and edge alignment
- Test fixtures and contract tests for planning visuals fence validation
- **Embedded CLI documentation** (`kitfly docs`): `kitfly docs list` and `kitfly docs show <slug>` for offline access to curated documentation from the compiled binary, with build-time codegen from `docs/embed-manifest.yaml`

### Docs

- New `content/reference/gantt-widget.md` with complete authoring reference, schema, and examples
- Updated plugin registry documentation with `planning-visuals` contract and usage

## [0.2.3] - 2026-02-17

### Added

- Content profiles: `--profile` flag and `KITFLY_PROFILE` env var for single-source multi-audience filtering via frontmatter `profile:` tags
- Data-driven bindings: `{{ key }}` value substitution and `{{ snippet:name }}` block injection from YAML/JSON data files bound via `data:` frontmatter
- Pre-build hooks: `prebuild:` commands in site.yaml that run before dev/build/bundle with watch-mode reruns
- Built-in formatters: `dollar`, `number`, `percent`, `round(n)`, `upper`, `lower` with pipe chaining (`{{ key | round(0) | dollar }}`)
- Optional schema validation for data files (JSON Schema structural checks)
- ADR-0006: Data-Driven Content architecture decision
- "Kitsite" terminology and "What's a Kitsite?" section in README

### Fixed

- Windows cross-platform compatibility: launcher script install (no symlinks), browser open dispatch, MSYS `/c/...` path normalization
- Profile filtering backward compatibility when no profiles configured and no active profile selected
- `KITFLY_PROFILE` environment variable propagation through kitfly CLI entrypoints
- YAML parser: block scalar (`|`/`>`) support for data file snippets
- YAML parser: direct list-item block scalars, chomping/indent indicator handling
- YAML parser: reject malformed block scalar headers (`|abc`, `>foo`) instead of silent empty strings

### Docs

- Windows contributor setup guide in docs/development.md
- Development docs table alignment fix

### Generator guidance (from dogfooding)

- `pages[].path` in data files must be relative to site root including `content/` prefix (e.g. `content/product/pricing.md`, not `product/pricing.md`)
- Generators must emit every snippet the template references, even if empty — the template is the contract
- `percent` formatter expects a decimal ratio (0.0–1.0), not an already-computed percentage
- Use JSON for generator-produced data files; reserve YAML for hand-authored data where readability matters
- Recommended layout: raw input in `data/raw/`, kitfly data files in `data/`

## [0.2.2] - 2026-02-16

### Added

- `slides-charts-lite` plugin: bar/line/pie charts via Chart.js 4.4.7 CDN with fenced `chart` code blocks
- `latex` plugin: math typesetting via KaTeX 0.16.21 CDN ($inline$, $$display$$, fenced `math` blocks)
- `brief` template: external-audience product documentation with 4 sections and starter content
- Footer logo: `footer.logo`, `logoUrl`, `logoAlt`, `logoHeight` fields for image logos in the footer ribbon
- Dark mode logo variants: `brand.logoDark` and `footer.logoDark` fields with CSS show/hide swap (no JS)
- Hierarchical slide navigation: nested nav with collapsible groups for decks with subfolder content
- Branding guide (`content/guide/branding.md`): canonical reference for header logos, footer logos, dark mode variants

### Fixed

- Plugin template injection: `$` replacement corruption that broke LaTeX delimiter rendering
- Plugin CDN loader: path resolution for LaTeX plugin assets

### Docs

- Configuration reference updated with footer logo and dark mode logo fields
- All templates (handbook, runbook, brief, deck) updated with expanded Brand Assets documentation

## [0.2.1] - 2026-02-15

### Added

- 5 new `slides-visuals` figure types: `timeline-horizontal`, `timeline-vertical`, `flow-branching`, `flow-converging`, `staircase`
- Slides authoring guidelines for content-density pitfalls in visual figures

### Fixed

- Dev server shows friendly error page on plugin version mismatch instead of raw stack trace
- vitest/bun test compatibility: use `__dirname` over `import.meta.dir`, exclude `.bun.test.*` from vitest runs

## [0.2.0] - 2026-02-14

### Added

- Slides mode: `mode: slides` for fixed-aspect, hash-routed decks (`#slide-n`) with keyboard navigation
- Slide authoring models: one-file-per-slide and intra-file `--- slide ---` segmentation
- `kitfly init --template deck` for a ready-to-edit slides starter
- Plugin system: `kitfly.plugins.yaml`, registry-backed asset injection, mode allowlists, and integrity checks (sha256 + SRI where applicable)
- `slides-visuals` plugin (widgets + deterministic figures) with strict `:::` fence validation and actionable errors
- `callouts` plugin: styled NOTE/TIP/WARNING/INFO/DANGER blockquotes via `kitfly.plugins.yaml`
- Design primitives in core styles for deterministic visuals (block flow/grid + shape modifiers)
- Server management commands: `kitfly servers`, `kitfly stop <port|all>`, `kitfly logs <port>`
- Site version resolution: `site.yaml version: auto` (read `VERSION` file) and `version: file:<path>`
- Brand logo fallback initials when logo asset is missing/unreadable

### Changed

- Bundle output to `bundles/` (separate from `dist/`) so static-deploy and single-file outputs don't interfere

### Fixed

- Plugin registry hardening and checksum enforcement (fail fast on mismatches)
- Dev server behavior when iterating on plugin assets (cache invalidation and parity fixes)
- Multiple `slides-visuals` parsing/rendering edge cases (list merging, list-style blocks, comparison-table layout)

### Docs

- New Deployment section with beginner-friendly guardrails and provider recipes
- Expanded Reference docs (plugins contract, environment variables, key concepts, glossary, design catalog)

### Deferred

- Additional live-slides plugins (`slides-charts-lite`, `slides-refresh`, `slides-embed`) planned for v0.2.1

## [0.1.2] - 2026-02-10

### Added

- Configurable sidebar width via `theme.yaml` `layout.sidebarWidth` (default `280px`)
- Site version in footer provenance: reads from `site.yaml` `version` field, falls back to git tag
- Schema support for `version` field in `site.schema.json`
- Schema support for `layout.sidebarWidth` in `theme.schema.json`
- Comprehensive test coverage: 466 → 1174 tests, 56.9% → 68.7% statements, 42.3% → 79.6% functions
- Template test suites: crucible, pipeline, productbook, runbook, servicebook (all 100% coverage)
- Bundle test suite: parseArgs, imageMime, rewriteContentLinks, fileToDataUri, inlineLocalImages

### Fixed

- Footer provenance now displays site version instead of kitfly engine version
- Sidebar folder indicators: replaced tiny `▸`/`▾` triangles with `›` chevron + 150ms rotation transition
- Test suite: removed fs mocks from theme tests (eliminated cross-file mock contamination)
- Test suite: fixed Bun/Node dual-runtime compatibility for coverage runs
- Lint: eliminated 541 non-null assertion warnings across test files

## [0.1.1] - 2026-02-10

### Added

- Three-zone footer layout with configurable copyright, links, and attribution
- `footer.copyright` — override auto-generated copyright text
- `footer.copyrightUrl` — make copyright text a clickable link
- `footer.links` — custom footer links (max 10); empty array suppresses all center links
- `footer.attribution` — toggle "Built with Kitfly" (default: true)
- Immutable `KitflyBrand` constant — tool identity separate from user's `SiteBrand`
- Bundle footer parity via shared `buildBundleFooter()`
- HTML escaping for all user-provided config strings in footer output
- Platform binary releases: Linux x64/arm64, macOS arm64, Windows x64/arm64
- Provenance label: `Published YYYY-MM-DD` (was bare date)
- Copyright year derived from publish date, not runtime

### Fixed

- `brand.url: "/"` (relative URL) now displays `brand.name` as footer link text
- Footer wrapping on narrow viewports: `min-height` replaces fixed `height`

## [0.1.0] - 2026-02-05

### Added

- Initial release
- `kitfly init` — scaffold documentation sites (minimal, handbook templates)
- `kitfly dev` — development server with hot reload
- `kitfly build` — static site generation
- `kitfly bundle` — single-file HTML output
- Auto-discovered navigation from folder structure
- Brand logo/favicon support with bounded responsive slot
- Dark mode with system preference detection
- YAML-based config with JSON schema validation
- Cross-platform CI: Linux x64/arm64, macOS arm64, Windows x64/arm64
- Dual-format release signing: minisign + GPG
