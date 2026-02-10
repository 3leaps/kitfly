# Kitfly v0.1.1

**Release date:** 2026-02-10

## What's new

Kitfly v0.1.1 adds full footer customization. You can now control copyright text, add footer links, and toggle Kitfly attribution — all from `site.yaml`.

### Footer customization

Add a `footer:` block to your `site.yaml`:

```yaml
footer:
  copyright: "© 2026 My Company, Inc."
  copyrightUrl: "https://mycompany.com"
  links:
    - text: "Privacy"
      url: "/privacy"
    - text: "Terms"
      url: "/terms"
  attribution: true
```

The footer now has three zones:

```
v0.1.1 · Published 2026-02-10     © 2026 My Company · Privacy · Terms     Built with Kitfly
← provenance                      ← copyright + links                     ← attribution →
```

All fields are optional. Without any config, you get a sensible default: auto-generated copyright from `brand.name`, your brand URL as a link, and Kitfly attribution.

Set `footer.attribution: false` to remove "Built with Kitfly". Set `footer.links: []` to remove all center links.

### Bundle parity

All footer options work identically in bundles. The productbook team has validated full parity across dev server and bundled output.

### Platform binaries

Release now includes pre-built binaries for Linux x64/arm64, macOS arm64, and Windows x64/arm64.

## Bug fixes

- Relative brand URLs (like `/`) now show `brand.name` as link text instead of the raw URL
- Footer no longer overflows on narrow viewports when content wraps to multiple lines
- All config-sourced strings are HTML-escaped to prevent markup injection

## Full changelog

See [CHANGELOG.md](CHANGELOG.md) or [docs/releases/v0.1.1.md](docs/releases/v0.1.1.md) for the complete list.
