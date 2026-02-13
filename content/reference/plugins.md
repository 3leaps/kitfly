---
title: "Plugins"
description: "Enable small add-ons (CSS/JS) for docs and slides"
last_updated: "2026-02-12"
---

# Plugins

Kitfly plugins are small, optional add-ons that inject CSS and/or JS into your generated HTML.

They are designed to stay minimal:

- No build pipeline required
- Offline-friendly when assets are local
- You own the files (standalone sites copy `registry/` + `plugins-dist/`)

## Enable a plugin

Create `kitfly.plugins.yaml` in your site root:

```yaml
# yaml-language-server: $schema=./schemas/v0/plugins.schema.json
plugins:
  - callouts@0.2.0
```

Canonical plugins are referenced as pinned strings: `name@x.y.z`.

## Registry + assets

Canonical plugins come from a registry file:

- Site registry: `registry/plugins.yaml` (preferred if present)
- Engine registry: used as a fallback when the site does not include a registry

Registry entries map a plugin id + version to asset locations (`assets.js` and/or `assets.css`) and per-asset checksums (`assetSha256`).

For local/offline registries, `baseUrl` may be an empty string.

## Mode allowlist (`modes`)

Registry entries may include an optional `modes` allowlist to control where a plugin runs:

- Omitted: allowed in `docs` and `slides`
- Present with values: allowed only in those modes (example: `["slides"]`)
- Present but empty (`[]`): blocked in all modes (quick disable switch)

Example:

```yaml
plugins:
  slides-widgets:
    version: "0.2.0"
    modes: ["slides"]
    assets:
      js: "plugins-dist/slides-widgets.js"
      assetSha256:
        js: "sha256:..."
```

## Integrity checks

Kitfly verifies every enabled asset against its `sha256:<hex>` checksum. If a checksum does not match, the build/dev server fails with an integrity error.
