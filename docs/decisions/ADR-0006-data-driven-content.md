---
title: "ADR-0006: Data-Driven Content"
description: "Defines the boundary, contract, and constraints for build-time data binding in kitfly"
author: "cxotech"
supervised_by: "@3leapsdave"
date: "2026-02-17"
status: "accepted"
tags: ["adr", "architecture", "data-binding", "pre-build-hooks", "generators"]
---

# ADR-0006: Data-Driven Content

## Status

Accepted (2026-02-17)

## Context

Client engagements surfaced a real pattern: pages driven by structured data. The motivating case is a pricing page where ~15 scalar values appear in prose and ~10 computed tables/diagrams are generated from a 98-line JSON data file by a 368-line Python script.

Today's pipeline:

```
pricing.json → generate-pricing.py → pricing.md (complete page) → kitfly → HTML
```

This works, but it conflates two concerns. The Python generator owns both computation (discount percentages, marginal bracket math, worked examples) and presentation (every paragraph of prose is embedded in string concatenation). Changing a word in a paragraph means editing Python. Changing a rate means regenerating the entire page.

The question is whether kitfly should provide any support for data-driven content, and if so, how much and with what constraints.

### What We Are Not Building

This decision must be read against kitfly's identity. Kitfly is not a composable content framework. It is not Hugo, Eleventy, Astro, or Docusaurus. Those tools have mature data/template systems with loops, conditionals, expression evaluation, inheritance, and plugin hooks. If a project needs that power, it should use those tools.

Kitfly is a minimal markdown renderer. Data-driven content support must remain consistent with that identity: small, predictable, auditable, and bounded.

## Terminology

A **kitsite** is the workspace that kitfly renders — the directory tree containing `site.yaml`, `content/`, `data/`, and optionally `scripts/`. A kitsite may be a documentation site, a slide deck, or any other kitfly output mode. It is typically a git repository but does not have to be. A kitsite created by `kitfly init` is standalone: it builds with `bun run build` and requires no kitfly CLI after setup.

A **generator** is any program that writes data files into a kitsite's data directory. Generators are user code, not kitfly code. They may live inside the kitsite (as a pre-build hook script) or outside it (as a separate service, CI step, or pipeline stage).

## Decision

### 1. Build-time string substitution with a file-based contract

Kitfly will support resolving `{{ key }}` placeholders in markdown to string values from YAML or JSON data files, and `{{ snippet:name }}` placeholders to pre-rendered markdown blocks. Resolution happens before markdown rendering. Output is deterministic: same data + same markdown = same HTML.

The contract between kitfly and the outside world is the **data file** — not a code interface, not an import, not an API. A generator (in any language) writes a file into the kitsite. Kitfly reads and validates it. This is the entire integration surface.

### 2. The boundary: substitution yes, logic no

Kitfly handles:

| Capability                | Example                                                     | Nature                    |
| ------------------------- | ----------------------------------------------------------- | ------------------------- |
| Scalar value substitution | `{{ baseline_rate \| dollar }}`                             | Lookup + format           |
| Snippet injection         | `{{ snippet:pricing-table }}`                               | Named block insertion     |
| Built-in formatters       | `dollar`, `number`, `percent`, `round(n)`, `upper`, `lower` | Pure display transforms   |
| Formatter chaining        | `{{ key \| round(0) \| dollar }}`                           | Left-to-right composition |
| Schema validation         | `data/pricing.schema.json`                                  | JSON Schema 2020-12       |
| Error on missing values   | Unresolved `{{ key }}` = build error                        | Fail loud, never silent   |

Kitfly does not handle:

| Excluded                              | Why                                                  |
| ------------------------------------- | ---------------------------------------------------- |
| Loops (`{% for %}`)                   | Template engine territory                            |
| Conditionals (`{% if %}`)             | Template engine territory                            |
| Expression evaluation (`{{ x * y }}`) | Computation belongs in generators                    |
| User-defined formatters               | Extensibility risk; closed set keeps contract stable |
| Object/array iteration                | Pre-build hook territory                             |
| Data fetching (HTTP, DB)              | Network I/O in builds violates determinism           |

This boundary is the core architectural decision. Everything above the line is kitfly. Everything below the line is user code, triggered by pre-build hooks. The line does not move.

### 3. Formatters are deterministic, declarative, and closed

Every formatter is a pure function: `y = f(x)`. String in, string out. No side effects, no data access, no branching, no state.

Chaining composes left to right: `{{ key | round(2) | dollar }}` is `dollar(round(2, key))`. Each stage receives a string and returns a string. The pipeline is deterministic and testable in isolation.

The formatter set is closed. Adding a formatter requires a kitfly code change, review, and release. There are no user-defined formatters, no plugin hooks into the binding layer, no runtime extension points. This constraint is deliberate: it keeps the substitution layer auditable and prevents kitfly from becoming a template engine through accumulation.

### 4. No code interface for generators

Kitfly does not provide a TypeScript interface, base class, or SDK for generator scripts. The contract is:

| Convention      | Requirement                                                                          |
| --------------- | ------------------------------------------------------------------------------------ |
| Output location | Write to `data/` with a path matching the page's `data:` frontmatter                 |
| Output format   | YAML or JSON, conforming to schema if one exists                                     |
| Exit code       | 0 on success, non-zero on failure                                                    |
| Idempotency     | Same input should produce same output                                                |
| Language        | Any (TypeScript recommended if kitfly-managed; Python, Go, shell all valid)          |
| Check mode      | Generators SHOULD support `--check` to verify output is current without regenerating |

This is a file-based contract. The generator writes a file; kitfly reads it. No imports, no extends, no implements. The schema is the type system. The file system is the integration bus.

**Rationale:** A code interface would couple user code to kitfly internals, exclude non-TypeScript generators, and create a dependency direction that doesn't exist today. The Unix pattern — programs communicate through files and exit codes — is more aligned with kitfly's philosophy and more portable.

### 5. Pre-build hooks pass environment context

When kitfly runs a pre-build hook, it sets environment variables so the generator can discover its context without hardcoding paths:

| Variable            | Value                           | Example                     |
| ------------------- | ------------------------------- | --------------------------- |
| `KITFLY_SITE_ROOT`  | Absolute path to site root      | `/Users/me/my-docs`         |
| `KITFLY_DATA_DIR`   | Data directory relative to root | `data/`                     |
| `KITFLY_BUILD_MODE` | Current build mode              | `dev`, `build`, or `bundle` |
| `KITFLY_PROFILE`    | Active content profile (if any) | `internal`                  |

Generators use these or ignore them. Most simple generators (like the pricing case) won't need them — they know their own paths. The env vars exist for the case where a generator serves multiple sites or adapts to build context.

### 6. Generators are a first-class concern — outside kitfly core

The generator — the code that transforms external business data into kitfly's data file contract — is where real-world friction lives. Kitfly's binding layer is ~90 lines of bounded substitution. The generator that turns "pricing spreadsheet managed by a VP of Sales" into `data/pricing.yaml` is the actual work.

**Data rarely belongs in the repo.** In-repo JSON or YAML is a development convenience. In production, business data lives in:

- Spreadsheets (Excel, Google Sheets) maintained by business stakeholders
- Headless CMS platforms (Directus, Strapi, Sanity)
- SaaS APIs (Airtable, Notion databases, internal services)
- Backend-as-a-Service or configuration stores
- CI/CD secrets or environment-specific config

The generator bridges that gap. Kitfly does not own generator code, but kitfly has a responsibility to make the generator's job clear and achievable.

**What kitfly provides for generators:**

| Layer              | Kitfly's contribution                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------- |
| Contract           | The data file schema — what shape the output must take                                      |
| Validation         | Schema enforcement at build time — generators get clear error messages when output is wrong |
| Environment        | `KITFLY_*` env vars so generators can discover site context                                 |
| Conventions        | Documented patterns for exit codes, idempotency, `--check` mode                             |
| Reference examples | Documented, tested generator patterns for common data sources (CSV, API, spreadsheet)       |

**What kitfly does not provide:**

| Layer                        | Why not                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------- |
| Generator SDK / base class   | Would couple user code to kitfly internals and exclude non-TypeScript generators |
| Data source connectors       | Network I/O, auth, pagination — these are generator concerns, not build concerns |
| Generator hosting / registry | Generators are site-local scripts, not distributable packages                    |

**Future consideration: `kitflygen` tooling.** As the generator pattern matures, there may be value in a separate tool or package that scaffolds generators for common data sources: `kitflygen init --source airtable`, `kitflygen init --source csv`. This is a v0.3+ concern and a separate domain — but the data file contract defined here is designed to be stable enough to support it. Naming it now prevents us from accidentally making architectural choices that foreclose it.

### 7. The control plane pattern is supported, not owned

A common architecture uses site generators as build steps in a signal-driven pipeline. Kitfly supports this pattern at two levels of complexity, depending on where the generator lives.

**Simple: generator inside the kitsite (pre-build hook)**

```
External signal → CI checks out kitsite → prebuild hook runs generator → data.yaml → kitfly build → deploy
```

The generator is a script in `scripts/`, declared as a `prebuild:` command in site.yaml. It runs in the kitsite's environment, fetches or transforms data, and writes to `data/`. This is the default pattern for teams whose data acquisition is straightforward (single API call, CSV download, config lookup).

**Advanced: generator outside the kitsite (separate pipeline stage)**

```
External signal → data pipeline runs generator → writes data files into kitsite → kitfly build → deploy
```

The generator lives in its own repository, service, or CI job. It has its own dependencies, credentials, and error handling. Its only interaction with the kitsite is writing schema-conforming data files into the data directory. The kitsite doesn't need to know how the data arrived — it validates and builds.

This model is appropriate when:

- The generator has complex dependencies (database drivers, API clients, ML models) that don't belong in a kitsite
- Multiple kitsites consume output from the same generator
- Data acquisition requires credentials or network access that shouldn't be in the kitsite's environment
- The generator runs on a schedule independent of site builds

**What kitfly provides for both models:**

- Data files are validated against schemas (the contract holds regardless of data source)
- Builds are deterministic (same data.yaml = same HTML, always)
- Exit codes propagate (pre-build hook failure = build failure)
- Missing or malformed data files are build errors, not silent omissions

**What kitfly does not own:** signal routing (that's CI/CD), data acquisition (that's the generator), deployment (that's infrastructure), and generator lifecycle (that's the team's engineering concern). Kitfly is a reliable, predictable build step in someone else's pipeline. This is the right scope.

The important implication: **a kitsite can be "live" without being dynamic.** A site that rebuilds on webhook from a headless CMS delivers fresh content without client-side JavaScript, without a runtime server, without a database connection. The content is always static HTML. The pipeline is what makes it responsive to change.

### 8. Data lives inside the kitsite — no tree escaping

Data files in their final, schema-conforming form must reside within the kitsite workspace. The data directory (default `data/`, configurable via `dataroot:` in site.yaml) is relative to site root and must resolve within the kitsite's directory tree.

**Containment rules:**

| Rule                                  | Rationale                                                                |
| ------------------------------------- | ------------------------------------------------------------------------ |
| Data paths are relative to site root  | Portability — the kitsite works on any machine                           |
| No `../` traversal out of the kitsite | Security and containment — builds are self-contained                     |
| No absolute paths                     | Portability — no machine-specific assumptions                            |
| No symlinks to external locations     | The kitsite is the boundary; dependencies must be materialized inside it |
| No URI schemes (`s3://`, `https://`)  | Data fetching belongs in generators, not in kitfly's path resolution     |

**The source data can be anything, anywhere.** An Excel sheet on SharePoint. An Airtable base. A Directus collection. A REST API. A database query. Kitfly doesn't know and doesn't care. The generator is the adapter that bridges external data into the kitsite's data directory in a form that conforms to the schema.

**The generator can live anywhere too.** It may be a script inside the kitsite (the simple case: `scripts/generate-pricing-data.ts` run as a pre-build hook). Or it may live in a completely separate environment — a CI pipeline step, a scheduled job, a microservice that writes data files into a mounted volume or committed checkout. Kitfly's only requirement is that by build time, the data files exist inside the kitsite and pass schema validation.

**`dataroot:` configuration.** The data directory name defaults to `data/` but can be overridden in site.yaml for teams that prefer `_data/`, `src/data/`, or another convention. The same containment rules apply — the path must resolve within the kitsite.

**Typical layout — generator with external data source:**

```
my-kitsite/
├── site.yaml
├── data/
│   ├── pricing.yaml          # OUTPUT of generator (committed or .gitignored)
│   └── pricing.schema.json   # validates generator output
├── content/
│   └── product/
│       └── pricing.md        # uses {{ key }} bindings
└── scripts/
    └── generate-pricing-data.ts  # pre-build hook — fetches from API/CSV/CMS
```

**Simpler layout — hand-authored data (DRY / small sites):**

```
my-kitsite/
├── site.yaml
├── data/
│   └── team.yaml             # hand-maintained, values reused across pages
└── content/
    ├── about.md              # {{ lead_name }}, {{ team_size }}
    └── contact.md            # {{ lead_email }}
```

**Automated layout — generator lives outside the kitsite:**

```
# The kitsite (deployed, built by CI)
my-kitsite/
├── site.yaml
├── data/
│   └── pricing.yaml          # written by external pipeline before build
├── content/
│   └── product/
│       └── pricing.md

# Separate repo / service (not part of the kitsite)
data-pipeline/
├── generators/
│   └── pricing-generator.ts  # fetches from Airtable, writes to kitsite/data/
└── config/
    └── sources.yaml          # data source credentials and endpoints
```

Whether `data/pricing.yaml` is committed (reproducible builds without generator) or `.gitignored` (always regenerated) is a team decision. Both patterns are valid. The schema validates the shape regardless of provenance.

### 9. Error handling: fail loud, never silent

| Condition                 | Behavior                                   |
| ------------------------- | ------------------------------------------ |
| Data file not found       | Build error with path context              |
| Unresolved `{{ key }}`    | Build error — never silently empty         |
| Unknown snippet slot      | Build error with file and slot name        |
| Formatter parse failure   | Build error (e.g., `dollar` on `"hello"`)  |
| Unknown formatter         | Build error with formatter name            |
| Schema validation failure | Build error with field path and constraint |

This is non-negotiable for data-driven content. A pricing page with a missing value means publishing wrong numbers. A report with an empty `{{ revenue }}` is worse than a build failure. The system must refuse to produce output when data is incomplete.

## Constraints

These constraints are guardrails, not limitations. They keep kitfly honest about what it is.

1. **~90 lines of site code.** The binding resolution layer (load data, resolve values, resolve snippets, formatters) must fit within kitfly's line budget. If it can't be implemented in ~90 lines, the design is too complex.

2. **No new dependencies.** YAML parsing uses the existing parser in `shared.ts`. JSON Schema validation uses built-in `Bun` APIs or stays under 50 lines of hand-written validation. No ajv, no yaml library, no template engine.

3. **No syntax beyond `{{ key }}` and `{{ snippet:name }}`.** No block tags, no comment directives, no frontmatter-driven conditionals. If you need logic, write a generator.

4. **Formatters are the only "logic."** And they are pure functions on single values. If a formatter needs to read data, branch on conditions, or access context — it doesn't belong in the formatter set.

5. **The file-based contract is the only integration surface.** No TypeScript interfaces for generators. No kitfly SDK. No plugin hooks into the binding layer. The schema validates the shape. The file system carries the data.

6. **Data values are strings.** Formatters handle display concerns. There is no type system, no coercion rules, no typed objects in the binding layer.

## Consequences

### Positive

- **Separation of concerns.** Prose lives in markdown files that humans can read and edit. Computation lives in generator scripts. Data lives in validated YAML/JSON. Each layer does what it's good at.
- **The pricing page becomes maintainable.** Changing a word in a paragraph means editing markdown. Changing a rate means editing a data file. Changing computation logic means editing a TypeScript generator. No single file owns everything.
- **Python dependency eliminated.** The generator migrates to TypeScript (same ecosystem as kitfly). Not a hard requirement — the contract is language-agnostic — but a practical win for teams already using Bun.
- **Hot reload path.** Pre-build hooks + data watching means: edit data → hook runs → data.yaml updates → kitfly resolves bindings → page rebuilds. No manual generator step during development.
- **CI/CD composability.** Kitfly is a predictable build step. Signal-driven rebuild pipelines (webhook → generator → kitfly build → deploy) work without kitfly owning the orchestration.
- **Data externalization is a documented path.** Teams are guided toward keeping business data in business systems (spreadsheets, CMS, APIs) and using generators to bridge the gap — rather than embedding data in the repo as a default.

### Negative

- **Two-stage debugging.** When a value looks wrong, you debug across two layers: is the generator producing the right data? Or is the binding resolving correctly? Mitigation: clear error messages with file, line, and key context. The `--check` convention helps CI catch stale data.
- **Snippet-heavy data files are awkward.** A data file with 10 pre-rendered markdown tables is a serialized markdown artifact stored in YAML. It's generated output in a data format. This is structurally sound but aesthetically uncomfortable. Documentation should distinguish between values (simple key-value) and fragments (pre-rendered blocks).
- **The 80/20 split favors generators.** For a pricing page, ~80% of content is computed (tables, diagrams, worked examples). Data bindings handle the ~20% that's scalar values in prose. Teams must understand that data bindings complement generators — they don't replace them.
- **Generator guidance is a commitment.** Acknowledging generators as a first-class concern means maintaining reference patterns and documentation for common data sources. This is a content and support obligation, not a code obligation — but it's real work.

### Neutral

- **"Can kitfly do X?" has a clear answer.** Lookup + format = yes. Logic + iteration = no, use a generator. The boundary is documented and stable.
- **Migration path is unchanged.** Teams that outgrow this pattern — needing loops, conditionals, component composition — should migrate to Astro, Eleventy, or Hugo. Their content is still markdown. Their data files are still YAML/JSON. The migration cost is in build tooling, not content.

## Alternatives Considered

### Embed a template engine (Nunjucks, Liquid, Handlebars)

Rejected. Any general-purpose template engine violates kitfly's minimalist philosophy, adds a dependency, and creates a second rendering pipeline alongside marked. The incremental value over `{{ key }}` substitution is loops and conditionals — which belong in generator scripts, not in kitfly's rendering path.

### Dot-path access into nested objects (`{{ pricing.user_license.rate }}`)

Deferred. The merged proposal uses flat strings with globals + page-level inject. Dot-path access adds syntax complexity (array indices, `.length`, edge cases with missing intermediate keys). If flat strings + generators cover the real-world cases, nested access isn't needed. Can revisit based on feedback.

### User-defined formatters

Rejected. Extensible formatters turn kitfly into a plugin-hosting platform for display logic. The closed set (dollar, number, percent, round, upper, lower) covers the documented use cases. Adding a formatter is a kitfly code change — intentional friction that prevents scope creep.

### TypeScript interface/SDK for generators

Rejected (see Decision §4). The file-based contract is more portable, more Unix-aligned, and doesn't create coupling between user code and kitfly internals. The schema is the type system. The file system is the integration bus.

### Data fetching in the build pipeline (`data: https://api.example.com/pricing`)

Rejected. Network I/O in builds violates determinism and introduces failure modes kitfly cannot control (timeouts, auth, rate limits, changed APIs). Generators handle data acquisition. Kitfly handles data consumption. The boundary is the file.

### Symlinks to external data directories

Rejected. Symlinks that escape the kitsite break containment, create invisible dependencies on external paths, and make the kitsite non-portable. If data lives outside the kitsite, the generator materializes it inside the kitsite before build. The data directory contains real files, not references to files.

### Arbitrary / absolute data paths

Rejected. Allowing `data: /opt/shared/pricing.yaml` or `data: ../other-repo/data/pricing.yaml` breaks portability (the kitsite doesn't clone/deploy correctly on another machine) and containment (the build depends on state outside its control). The `dataroot:` config allows naming flexibility within the kitsite; generators handle externalization.

## Compliance

All changes to the data binding layer in `src/shared.ts`, and all pre-build hook integration in `scripts/dev.ts`, `scripts/build.ts`, and `scripts/bundle.ts`, must conform to this ADR.

Feature requests that would expand the substitution syntax beyond `{{ key }}` and `{{ snippet:name }}`, or that would add logic to the binding layer, require a new ADR and explicit review.

## References

- [ADR-0001: Minimalist Site Code](ADR-0001-minimalist-site-code.md) — Line budget and feature evaluation
- [ADR-0005: Plugin Contract and Distribution](ADR-0005-plugin-contract-and-distribution.md) — Precedent for versioned contracts
- `.plans/active/v0.2.3/explorations/data-driven-merged-proposal.md` — Merged proposal (deliverylead + entarch)
- `.plans/active/v0.2.3/explorations/data-driven-content-schema.md` — Initial schema exploration
- `generate-pricing.py` (Epiphany client site) — Motivating real-world case
