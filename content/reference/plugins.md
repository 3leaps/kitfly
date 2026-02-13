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

## Triple-colon fence contract (`slides-visuals`)

The `slides-visuals` plugin adds a `:::` block syntax for slides mode (widgets + figures).

To keep authoring predictable and make errors actionable, Kitfly defines a strict contract for these blocks.
When `slides-visuals` is enabled, Kitfly validates blocks before rendering and reports contract violations.

### Valid block shape

- Opening fence: `:::<type>` **must** start at column 0 and be the only content on the line.
- Closing fence: `:::` **must** start at column 0 and be the only content on the line.
- No blank lines inside a `:::` block.
- Content is a narrow YAML subset:
  - Scalar: `key: value`
  - List: `key:` followed by list items
    - List item start: exactly two spaces, then `- ` (example: `␠␠- label: Users`)
    - Continuation lines (object fields): exactly four spaces, then `field: value`

### Supported types

Widgets:
- `kpi` (scalar keys: `label`, `value`, optional `trend`)
- `stat-grid` (list key: `metrics` of `{label,value,trend?}` objects)
- `compare` (scalar keys: `left-title`, `right-title`; list keys: `left`, `right` as **strings only**)

Notes:
- `compare.left` and `compare.right` items are simple strings (not `{label: ..., value: ...}` objects).
- If you need multi-field items, use `stat-grid` / `scorecard` instead.
- If an item contains a colon (`:`), quote it as a string.

Figures:
- `quadrant-grid` (scalar keys: `axis-x`, `axis-y`, `tl`, `tr`, `bl`, `br`)
- `scorecard` (list key: `metrics` of `{label,value,trend?}` objects)
- `comparison-table` (list keys: `headers` (strings), `rows` (strings))
- `layer-cake` (list key: `layers` (strings))
- `pyramid` (list key: `levels` (strings))
- `funnel` (list key: `stages` (strings))

### Example (valid)

```markdown
:::stat-grid
metrics:
  - label: Users
    value: 1,234
  - label: Uptime
    value: 99.95%
    trend: +0.3%
:::
```

### How to know it’s correct

When `slides-visuals@...` is enabled, Kitfly validates your `:::` blocks before it renders pages.

You know your fences are valid if:
- `kitfly dev` starts successfully, and pages load normally
- `kitfly build` completes successfully
- `kitfly bundle` completes successfully

If a block is invalid, Kitfly will fail fast with an error that points to the file and the specific contract rule you violated.

### Common mistakes (and how to fix them)

- **Indented fences**: `:::kpi` must start at column 0 (no spaces, no list indentation, no blockquote `>`).
- **Blank lines inside the block**: remove empty lines between keys/items.
- **Wrong list indentation**:
  - list items must start with exactly two spaces then `- `
  - fields under an item must use exactly four spaces
- **Unknown type**: the opening fence `:::<type>` must be one of the supported types.

### Examples (invalid → fixed)

#### 1) Indented fence (invalid)

```markdown
  :::kpi
  label: Users
  value: 1,234
  :::
```

Fixed:

```markdown
:::kpi
label: Users
value: 1,234
:::
```

#### 2) Blank line inside block (invalid)

```markdown
:::kpi
label: Users

value: 1,234
:::
```

Fixed:

```markdown
:::kpi
label: Users
value: 1,234
:::
```

#### 3) Bad list indentation (invalid)

```markdown
:::stat-grid
metrics:
 - label: Users
   value: 1,234
:::
```

Fixed:

```markdown
:::stat-grid
metrics:
  - label: Users
    value: 1,234
:::
```

#### 4) Unknown type (invalid)

```markdown
:::stats
label: Users
value: 1,234
:::
```

Fixed: use a supported type (for example `kpi`):

```markdown
:::kpi
label: Users
value: 1,234
:::
```
