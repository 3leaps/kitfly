---
title: "Gantt Widget Examples"
description: "Usage patterns for the :::gantt planning widget"
last_updated: "2026-03-06"
---

# Gantt Widget Examples

The `:::gantt` widget renders a horizontal bar chart on a shared time axis. It ships in the `planning-visuals` plugin and works in both docs and slides mode.

Enable the plugin in `kitfly.plugins.yaml`:

```yaml
plugins:
  - planning-visuals@0.2.4
```

## Minimal example (week)

The smallest valid gantt — three required fields plus at least one track:

```markdown
:::gantt
time-unit: week
time-start: "2026-W20"
time-end: "2026-W28"
tracks:

- label: "Sprint 1"
  depth: 1
  start: "2026-W20"
  end: "2026-W23"
- label: "Sprint 2"
  depth: 1
  start: "2026-W24"
  end: "2026-W28"
  :::
```

No label, no milestones, no today marker — all optional. Tracks default to `status: planned` (muted/gray bars).

## Minimal example (month)

Same structure, different time unit. Dates use `YYYY-MM` format:

```markdown
:::gantt
time-unit: month
time-start: "2026-06"
time-end: "2026-12"
tracks:

- label: "Discovery"
  depth: 1
  start: "2026-06"
  end: "2026-08"
- label: "Build"
  depth: 1
  start: "2026-09"
  end: "2026-12"
  :::
```

Month mode is natural for business audiences — no ISO week numbers to decode.

## Status colors

Four statuses control bar color. Use them to show progress at a glance:

```markdown
:::gantt
label: "Status Reference"
time-unit: week
time-start: "2026-W14"
time-end: "2026-W26"
tracks:

- label: "Completed work"
  depth: 1
  start: "2026-W14"
  end: "2026-W17"
  status: complete
- label: "In progress"
  depth: 1
  start: "2026-W18"
  end: "2026-W21"
  status: active
- label: "Waiting on vendor"
  depth: 1
  start: "2026-W19"
  end: "2026-W23"
  status: blocked
- label: "Not started"
  depth: 1
  start: "2026-W22"
  end: "2026-W26"
  status: planned
  :::
```

| Status     | Color        | Use for               |
| ---------- | ------------ | --------------------- |
| `complete` | Green        | Done, signed off      |
| `active`   | Accent/blue  | Currently in progress |
| `blocked`  | Amber/orange | Waiting, at risk      |
| `planned`  | Muted/gray   | Not started (default) |

All colors adapt to dark mode automatically.

## Hierarchy and depth filtering

The key feature: `depth` + `max-depth` lets one data set produce multiple views.

### Full detail (`max-depth: 2`)

```markdown
:::gantt
label: "Client Rollout — Detail View"
time-unit: week
time-start: "2026-W18"
time-end: "2026-W40"
max-depth: 2
today: "2026-W28"
tracks:

- label: "Wave 1 — Pilot"
  depth: 1
  start: "2026-W20"
  end: "2026-W30"
  status: active
- label: "Apex Advisory (45 sites)"
  depth: 2
  start: "2026-W20"
  end: "2026-W26"
  status: complete
- label: "Beacon Logistics (80 sites)"
  depth: 2
  start: "2026-W24"
  end: "2026-W30"
  status: active
  milestones:
- label: "Pilot Review"
  date: "2026-W31"
  tracks:
- label: "Wave 2 — Scale"
  depth: 1
  start: "2026-W33"
  end: "2026-W40"
  status: planned
- label: "Crestview Energy (120 sites)"
  depth: 2
  start: "2026-W33"
  end: "2026-W37"
  status: planned
- label: "Dunmore Foods (90 sites)"
  depth: 2
  start: "2026-W36"
  end: "2026-W40"
  status: planned
  :::
```

### Summary view (`max-depth: 1`)

Use the same data with `max-depth: 1` to show only wave-level bars — ideal for executive slides:

```markdown
:::gantt
label: "Client Rollout — Summary View"
time-unit: week
time-start: "2026-W18"
time-end: "2026-W40"
max-depth: 1
today: "2026-W28"
tracks:

- label: "Wave 1 — Pilot"
  depth: 1
  start: "2026-W20"
  end: "2026-W30"
  status: active
- label: "Apex Advisory (45 sites)"
  depth: 2
  start: "2026-W20"
  end: "2026-W26"
  status: complete
- label: "Beacon Logistics (80 sites)"
  depth: 2
  start: "2026-W24"
  end: "2026-W30"
  status: active
  milestones:
- label: "Pilot Review"
  date: "2026-W31"
  tracks:
- label: "Wave 2 — Scale"
  depth: 1
  start: "2026-W33"
  end: "2026-W40"
  status: planned
- label: "Crestview Energy (120 sites)"
  depth: 2
  start: "2026-W33"
  end: "2026-W37"
  status: planned
- label: "Dunmore Foods (90 sites)"
  depth: 2
  start: "2026-W36"
  end: "2026-W40"
  status: planned
  :::
```

Depth-2 tracks and milestones are hidden. The data is identical — only `max-depth` changes.

## Milestones

Milestones are point-in-time markers (diamonds). They have a `date` instead of `start`/`end`, and they're listed separately from tracks. Interleave freely — source order controls layout:

```markdown
:::gantt
time-unit: month
time-start: "2026-03"
time-end: "2026-12"
milestones:

- label: "Kick-off"
  date: "2026-03"
  tracks:
- label: "Design Phase"
  depth: 1
  start: "2026-04"
  end: "2026-06"
  status: complete
  milestones:
- label: "Design Sign-off"
  date: "2026-07"
  tracks:
- label: "Build Phase"
  depth: 1
  start: "2026-07"
  end: "2026-10"
  status: active
  milestones:
- label: "Launch"
  date: "2026-11"
  :::
```

Milestones respect `max-depth` filtering. A milestone with `depth: 2` is hidden when `max-depth: 1`.

## Chart-level markers

Markers are vertical annotation lines that span the full chart height — use them for gates, deadlines, and phase boundaries. Unlike row-level milestones (diamonds), markers are chart-level annotations with a label at the top:

```markdown
:::gantt
label: "Platform Migration"
time-unit: week
time-start: "2026-W14"
time-end: "2026-W30"
markers:

- label: "Go/No-Go"
  date: "2026-W18"
- label: "Phase 1 Sign-Off"
  date: "2026-W26"
  tracks:
- label: "Phase 1 — Foundation"
  depth: 1
  start: "2026-W14"
  end: "2026-W24"
  status: active
- label: "Phase 2 — Integration"
  depth: 1
  start: "2026-W25"
  end: "2026-W30"
  status: planned
  :::
```

Markers are **not** subject to `max-depth` or `max-tracks` — they always render if their date is within the axis range. A marker whose date falls outside the axis produces a build-time warning and is silently omitted.

Labels default to the right of the line. Near the right edge of the chart (~85%+), labels automatically flip to the left. Keep labels short (~20 chars) — longer text is truncated with ellipsis.

## Truncation with `max-tracks`

For slides, cap the visible rows to avoid overflow:

```markdown
:::gantt
label: "Regional Deployment"
time-unit: month
time-start: "2026-01"
time-end: "2026-12"
max-tracks: 4
tracks:

- label: "North America"
  depth: 1
  start: "2026-01"
  end: "2026-04"
  status: complete
- label: "Europe"
  depth: 1
  start: "2026-03"
  end: "2026-06"
  status: active
- label: "Asia Pacific"
  depth: 1
  start: "2026-05"
  end: "2026-09"
  status: planned
- label: "Latin America"
  depth: 1
  start: "2026-07"
  end: "2026-10"
  status: planned
- label: "Middle East"
  depth: 1
  start: "2026-09"
  end: "2026-12"
  status: planned
  :::
```

Rows 5+ are hidden and replaced with a "+1 more" indicator. `max-tracks` applies after `max-depth` filtering.

## Cross-year ranges

Both week and month mode handle year boundaries. The axis shows the year at transitions:

```markdown
:::gantt
label: "Multi-Year Program"
time-unit: month
time-start: "2026-10"
time-end: "2027-06"
tracks:

- label: "Phase 3 — Consolidation"
  depth: 1
  start: "2026-10"
  end: "2027-01"
  status: active
- label: "Phase 4 — Expansion"
  depth: 1
  start: "2027-02"
  end: "2027-06"
  status: planned
  :::
```

## Today marker

The `today` parameter draws a vertical dashed line. Useful when set by a generator to the build date:

```markdown
:::gantt
time-unit: week
time-start: "2026-W20"
time-end: "2026-W32"
today: "2026-W26"
tracks:

- label: "Current Sprint"
  depth: 1
  start: "2026-W24"
  end: "2026-W28"
  status: active
  :::
```

## Data-driven usage

Generators can emit `:::gantt` blocks as snippets. The template author places them without understanding the data model:

```yaml
# In a data file (e.g., data/rollout.yaml)
snippets:
  - slot: "rollout-summary"
    content: ":::gantt\ntime-unit: week\ntime-start: \"2026-W18\"\ntime-end: \"2026-W40\"\nmax-depth: 1\ntracks:\n  - label: \"Wave 1\"\n    depth: 1\n    start: \"2026-W20\"\n    end: \"2026-W30\"\n    status: active\n:::"
```

```markdown
<!-- In a markdown file -->

## Rollout Timeline

{{ snippet:rollout-summary }}
```

## Milestones vs markers

Both are point-in-time features — here's when to use which:

|                              | Milestones (`milestones:`)                      | Markers (`markers:`)                             |
| ---------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| **What it draws**            | Diamond icon in a single row                    | Vertical line spanning the full chart            |
| **Where the label goes**     | Left column (same as tracks)                    | Above the axis, next to the line                 |
| **Has depth?**               | Yes — subject to `max-depth`                    | No — always visible                              |
| **Counted by `max-tracks`?** | Yes                                             | No                                               |
| **Use for**                  | Per-track events: "Acme go-live", "QA sign-off" | Chart-wide gates: "Go/No-Go", "Funding deadline" |

Rule of thumb: if it belongs to a specific track or wave, use a milestone. If it's a date the whole chart cares about, use a marker.

## Edge cases and errors

Kitfly validates `:::gantt` blocks at build time. If something is wrong, `bun run build` (or `bun run dev`) fails fast with an error pointing to the file and line.

**Build errors** (block will not render):

| What you wrote                                             | Error                     | Fix                                        |
| ---------------------------------------------------------- | ------------------------- | ------------------------------------------ |
| Missing `time-unit`, `time-start`, `time-end`, or `tracks` | Required field missing    | Add the field                              |
| `time-unit: weeks` (plural)                                | Invalid time-unit         | Use `week` or `month`                      |
| `2026-14` with `time-unit: week`                           | Invalid time-start format | Use `2026-W14` (capital W, two-digit week) |
| `2026-4` with `time-unit: month`                           | Invalid time-start format | Use `2026-04` (two-digit month)            |
| Week date with `time-unit: month` (or vice versa)          | Format mismatch           | All dates must match the `time-unit`       |
| `time-start` after `time-end`                              | Range error               | Swap them                                  |
| Track with `start` after `end`                             | Range error               | Swap them                                  |
| Track missing `label`, `depth`, `start`, or `end`          | Required field missing    | Add the field                              |
| Milestone missing `label` or `date`                        | Required field missing    | Add the field                              |
| Marker missing `label` or `date`                           | Required field missing    | Add the field                              |

**Build warnings** (block renders, but something may look wrong):

| What you wrote                        | Warning                                           | What happens                  |
| ------------------------------------- | ------------------------------------------------- | ----------------------------- |
| Track extends outside the axis range  | "Track range is outside axis and will be clipped" | Bar clips to the visible axis |
| Milestone date outside the axis range | "Milestone date is outside axis"                  | Diamond not rendered          |
| Marker date outside the axis range    | "Marker date is outside axis"                     | Line and label not rendered   |

**Silent defaults** (no error, no warning):

| What you wrote                                    | What happens                 |
| ------------------------------------------------- | ---------------------------- |
| Omit `status` on a track                          | Defaults to `planned` (gray) |
| Omit `depth` on a milestone                       | Defaults to 1                |
| Omit `max-depth`                                  | All depths rendered          |
| Omit `max-tracks`                                 | All rows rendered            |
| Omit `milestones`, `markers`, `today`, or `label` | Feature simply absent        |
| Unknown `status` value (e.g., `status: done`)     | Treated as `planned`         |

For the full fence contract (indentation rules, block shape, supported types), see [Plugins — planning-visuals](plugins.md#triple-colon-fence-contract-planning-visuals).

## Quick reference

| What you want          | How                                         |
| ---------------------- | ------------------------------------------- |
| Week axis              | `time-unit: week`, dates as `YYYY-Www`      |
| Month axis             | `time-unit: month`, dates as `YYYY-MM`      |
| Title above chart      | `label: "My Title"`                         |
| Executive summary      | `max-depth: 1`                              |
| Detail view            | `max-depth: 2` (or omit for all)            |
| Cap rows for slides    | `max-tracks: 6`                             |
| Progress marker        | `today: "2026-W26"`                         |
| Done bar (green)       | `status: complete`                          |
| In-progress bar (blue) | `status: active`                            |
| At-risk bar (amber)    | `status: blocked`                           |
| Not started (gray)     | `status: planned` (or omit)                 |
| Point-in-time marker   | Use `milestones:` list with `date:`         |
| Chart-level gate line  | Use `markers:` list with `label:` + `date:` |
