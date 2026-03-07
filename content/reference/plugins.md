---
title: "Plugins"
description: "Enable small add-ons (CSS/JS) for docs and slides"
last_updated: "2026-03-03"
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

### Canonical plugins (v0.2.4)

- `callouts@0.2.0` - styled NOTE/TIP/INFO/WARNING/DANGER blockquotes
- `slides-visuals@0.2.1` - slide widgets + figures via `:::` blocks (`slides` mode only)
- `latex@0.2.2` - KaTeX math rendering for `$...$`, `$$...$$`, and fenced `math` blocks
- `slides-charts-lite@0.2.2` - bar/line/pie charts from fenced `chart` blocks (`slides` mode only)
- `planning-visuals@0.2.4` - gantt planning widget via `:::gantt` blocks (`docs` and `slides`)

Example:

```yaml
plugins:
  - latex@0.2.2
```

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

When iterating on a local plugin (for example, editing `plugins-dist/slides-visuals.js`), you must also update the matching `assetSha256` in `registry/plugins.yaml` (or disable the plugin) for Kitfly to load it.

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

## Triple-colon fence contract (`planning-visuals`)

The `planning-visuals` plugin adds a `:::gantt` block for planning and timeline visualization. Unlike `slides-visuals`, it works in both `docs` and `slides` mode.

Enable it in `kitfly.plugins.yaml`:

```yaml
plugins:
  - planning-visuals@0.2.4
```

### Supported type

- `gantt` — horizontal bar chart on a shared time axis with hierarchical depth control

### Chart-level parameters

| Parameter    | Required | Description                                         |
| ------------ | -------- | --------------------------------------------------- |
| `time-unit`  | yes      | Axis granularity: `week` or `month`                 |
| `time-start` | yes      | Left edge. `YYYY-Www` for week, `YYYY-MM` for month |
| `time-end`   | yes      | Right edge. Same format as `time-start`             |
| `label`      | no       | Chart title, rendered above the time axis           |
| `max-depth`  | no       | Maximum depth to render. `1` = top-level only       |
| `max-tracks` | no       | Maximum rendered rows. Excess shows "+N more"       |
| `today`      | no       | Renders a vertical dashed marker at this date       |

### Track fields

Tracks are horizontal bars spanning a start-to-end range.

| Field    | Required | Default   | Description                                   |
| -------- | -------- | --------- | --------------------------------------------- |
| `label`  | yes      | —         | Track label in the left column                |
| `depth`  | yes      | —         | Hierarchy level: 1, 2, or 3                   |
| `start`  | yes      | —         | Bar start (format must match `time-unit`)     |
| `end`    | yes      | —         | Bar end (format must match `time-unit`)       |
| `status` | no       | `planned` | `planned`, `active`, `complete`, or `blocked` |

### Milestone fields

Milestones are point-in-time markers (diamond icon, not a bar). Listed separately from tracks.

| Field   | Required | Default | Description                                       |
| ------- | -------- | ------- | ------------------------------------------------- |
| `label` | yes      | —       | Milestone label in the left column                |
| `date`  | yes      | —       | Single date (format must match `time-unit`)       |
| `depth` | no       | 1       | Hierarchy level, subject to `max-depth` filtering |

### Marker fields

Markers are chart-level vertical annotation lines spanning the full chart height, with a label at the top. Use them for gates, deadlines, and phase boundaries. Not subject to `max-depth` or `max-tracks` filtering.

| Field   | Required | Description                                                   |
| ------- | -------- | ------------------------------------------------------------- |
| `label` | yes      | Annotation text (~20 chars recommended). Truncated if longer. |
| `date`  | yes      | Position on axis (format must match `time-unit`)              |

Markers with dates outside the axis range produce a build-time warning and are not rendered.

### Row ordering

Tracks and milestones render in **source order** — the order you write them in the fence controls the visual sequence. You can interleave tracks and milestones freely.

### Example (week mode)

```markdown
:::gantt
label: "Platform Migration — 2026"
time-unit: week
time-start: "2026-W14"
time-end: "2026-W30"
max-depth: 2
today: "2026-W20"
tracks:

- label: "Phase 1 — Foundation"
  depth: 1
  start: "2026-W14"
  end: "2026-W22"
  status: active
- label: "Auth Service"
  depth: 2
  start: "2026-W14"
  end: "2026-W18"
  status: complete
- label: "Data Layer"
  depth: 2
  start: "2026-W17"
  end: "2026-W22"
  status: active
  milestones:
- label: "Architecture Review"
  date: "2026-W16"
- label: "Phase 1 Sign-Off"
  date: "2026-W23"
  depth: 2
  tracks:
- label: "Phase 2 — Integration"
  depth: 1
  start: "2026-W24"
  end: "2026-W30"
  status: planned
  :::
```

### Example (month mode)

```markdown
:::gantt
label: "Product Roadmap — H2 2026"
time-unit: month
time-start: "2026-07"
time-end: "2027-01"
tracks:

- label: "Beta Program"
  depth: 1
  start: "2026-07"
  end: "2026-09"
  status: active
- label: "GA Release"
  depth: 1
  start: "2026-10"
  end: "2026-12"
  status: planned
  milestones:
- label: "Launch Event"
  date: "2026-10"
  :::
```

### Depth filtering

The same data can drive a summary view and a detail view using `max-depth`:

- `max-depth: 1` renders only depth-1 bars and milestones (wave/phase level)
- `max-depth: 2` adds depth-2 items (individual workstreams)
- Omitting `max-depth` shows everything

### Validation

When `planning-visuals` is enabled, Kitfly validates `:::gantt` blocks at build time:

- Missing `time-unit`, `time-start`, `time-end`, or `tracks` is a build error
- Tracks missing `label`, `depth`, `start`, or `end` is a build error
- Milestones missing `label` or `date` is a build error
- Date format must match `time-unit` (`YYYY-Www` for week, `YYYY-MM` for month)
- `time-start` must be before `time-end`; track `start` must be before or equal to `end`
- Milestones are optional — a gantt with no `milestones:` list is valid

See [Gantt Widget Examples](gantt-widget.md) for more patterns.
