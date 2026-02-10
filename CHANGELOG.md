# Changelog

All notable changes to Kitfly are documented here.

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
