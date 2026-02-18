---
title: "Data-Driven Content"
description: "Use data bindings and generators to build pages from structured data"
last_updated: "2026-02-17"
---

# Data-Driven Content

Some pages are driven by structured data — pricing tables, team rosters, metrics dashboards, product catalogs. Data-driven content lets you separate prose (markdown), computation (generators), and data (YAML/JSON files) so each layer does what it's good at.

## When to use this

Use data bindings when:

- The same values appear in multiple places on a page (DRY)
- A generator computes values that appear in prose (pricing math, discount brackets)
- Tables or blocks are produced by scripts and injected into narrative content

Don't use data bindings when:

- The page is pure prose with no external data
- You need loops, conditionals, or expressions — use a generator to produce the final markdown instead

## How it works

```
raw input → generator → data file → kitfly bindings → markdown → HTML
```

1. A **generator** (any script) reads raw input and writes a data file
2. A **data file** (YAML or JSON) declares globals, per-page values, and snippets
3. **Markdown templates** use `{{ key }}` and `{{ snippet:name }}` placeholders
4. Kitfly resolves bindings at build time, before markdown rendering

## Data file structure

```yaml
# data/pricing.yaml
globals:
  company: "Acme Corp"
  baseline_rate: "200"
  credit_validity: "12"

pages:
  - path: content/product/pricing.md
    inject:
      hero: "Implementation and operating costs"
      discount_range: "5–20%"
    snippets:
      - slot: pricing-table
        content: |
          | Tier | Price | Features |
          |------|-------|----------|
          | Basic | $10/mo | Essentials |
          | Pro | $50/mo | Full access |
```

**Path convention:** `pages[].path` must be relative to site root including the `content/` prefix. Use `content/product/pricing.md`, not `product/pricing.md`. Kitfly's error messages include the expected path if there's a mismatch.

### Resolution order

For `{{ key }}`: page `inject` first, then `globals`. Page-level values shadow globals on key collision.

For `{{ snippet:name }}`: matched by `slot` name from the page's `snippets` array.

## Binding syntax

### Value substitution

```markdown
Implementation rate: **{{ baseline_rate | dollar }}/hour**

Credits valid for {{ credit_validity }} months.
```

### Snippet injection

```markdown
## Pricing Tiers

{{ snippet:pricing-table }}
```

Snippets are injected verbatim as markdown. After all bindings resolve, the full document passes through the markdown renderer as usual.

## Formatters

Apply with pipe syntax. Chaining composes left to right: `{{ key | round(0) | dollar }}`.

| Formatter  | Input       | Output   | Notes                                       |
| ---------- | ----------- | -------- | ------------------------------------------- |
| `dollar`   | `"1500"`    | `$1,500` | USD format; cents only if fractional        |
| `number`   | `"2500"`    | `2,500`  | Comma-separated                             |
| `percent`  | `"0.15"`    | `15%`    | **Input must be a decimal ratio (0.0–1.0)** |
| `round(n)` | `"3.14159"` | `3.14`   | Round to n decimal places                   |
| `upper`    | `"hello"`   | `HELLO`  | Uppercase                                   |
| `lower`    | `"HELLO"`   | `hello`  | Lowercase                                   |

**`percent` expects a decimal ratio.** `"0.15"` becomes `15%`. If your generator already computes integer percentages (like `"5"` for 5%), store them as pre-formatted strings (`"5%"`) and don't pipe through `percent` — that would yield `500%`.

All formatters are pure functions: string in, string out. The set is closed — adding a formatter requires a kitfly code change.

## Error handling

Kitfly fails loud on binding errors. These are build errors, not warnings:

| Condition               | Error message                                            |
| ----------------------- | -------------------------------------------------------- |
| Data file not found     | `data file not found: data/pricing.yaml`                 |
| Unresolved `{{ key }}`  | `unresolved binding "key" in content/product/pricing.md` |
| Unknown snippet slot    | `unknown snippet "name" in content/product/pricing.md`   |
| Formatter parse failure | `dollar formatter: "hello" is not a number ...`          |
| Unknown formatter       | `unknown formatter "custom_fn" ...`                      |
| Path escapes kitsite    | `data path escapes kitsite: ../secrets/data.yaml`        |

## Pre-build hooks

Declare generators in `site.yaml`:

```yaml
prebuild:
  - command: "bun run scripts/generate-pricing-data.ts"
    watch: ["data/raw/pricing-input.json"]
  - command: "bun run scripts/generate-team-data.ts"
```

| Context          | When hooks run                                        |
| ---------------- | ----------------------------------------------------- |
| `bun run dev`    | Once at startup, then again when watched files change |
| `bun run build`  | Once before build starts                              |
| `bun run bundle` | Once before bundle starts                             |

Hooks run sequentially in declared order. A non-zero exit code halts the build with the hook's stderr as error context.

### Watch flow in dev mode

```
watched file changes → re-run matching hook → hook writes to data/ → data/ change triggers rebuild
```

Content changes (edits to markdown) do NOT re-run hooks. Only watched file changes trigger hooks.

## Schema validation (optional)

If `data/pricing.schema.json` exists alongside `data/pricing.yaml`, kitfly validates the data at build time. JSON Schema structural checks cover required fields, value types, and pattern constraints.

Missing schema files are not an error — validation is opt-in.

## Generator best practices

These patterns emerged from real-world usage and apply to any non-trivial generator.

### The template is the contract

Every `{{ snippet:X }}` in a markdown template means the generator must always emit a snippet named `X` in the data file, even if the content is empty. Kitfly treats missing snippets as build errors — by design.

If a section is conditionally relevant (e.g. an implementation-tiers table that only applies to multi-tier configurations), the generator should emit the snippet with empty string content when the section doesn't apply. The blank line in the rendered output is acceptable and avoids conditional logic in the template.

```yaml
# Generator always emits this, even when single-tier
snippets:
  - slot: implementation-tiers
    content: ""
```

### Use JSON for generator output

Generators should write JSON data files. `JSON.stringify` is deterministic in every language, there's no quoting ambiguity, and multiline strings use unambiguous `\n` escapes.

Reserve YAML for hand-authored data files (team rosters, simple config) where human readability matters.

### Separate raw input from kitfly data

Keep generator source files in `data/raw/` and kitfly data files in `data/`:

```
data/
  raw/
    pricing-input.json    ← generator reads this
    team.csv              ← generator reads this
  pricing.json            ← generator writes this (kitfly reads it)
  team.json               ← generator writes this (kitfly reads it)
```

This prevents naming collisions and makes the data flow visible. The `prebuild:` hook `watch:` patterns point at `data/raw/` sources, and kitfly reads the generated files from `data/`.

### Generator language

Generators can be written in any language. Kitfly runs them as shell commands. The motivating use case was a Python generator in an otherwise TypeScript/Bun ecosystem — pre-build hooks eliminate the manual step and integrate it into the dev/build pipeline regardless of language.

## Interaction with content profiles

Data bindings and content profiles are independent features that compose naturally:

- Profile filtering runs first (after file collection, before rendering)
- Data binding resolution runs second (after reading markdown, before markdown rendering)
- A page excluded by profile filtering is never read, so its bindings are never resolved
- `KITFLY_PROFILE` is passed to pre-build hooks so generators can adapt output per profile

## Backwards compatibility

- Pages without `data:` frontmatter: no binding resolution, literal `{{ }}` passes through unchanged
- Sites without `prebuild:` in site.yaml: no hooks run, zero overhead
- Sites without a `data/` directory: no binding resolution, zero overhead
