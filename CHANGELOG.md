# Changelog

All notable changes to Kitfly are documented here.

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
