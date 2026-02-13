---
title: "Plugin Schema Notes"
description: "Rationale and validation rules for plugin.yaml and registry/plugins.yaml schemas"
last_updated: "2026-02-12"
status: "draft"
tags:
  - plugins
  - schemas
  - supply-chain
---

# Plugin Schema Notes (v0.2.0)

This note accompanies the draft schemas:

- `schemas/plugin.schema.json` → `schemas/v0/plugin.schema.json` (plugin.yaml)
- `schemas/plugin-registry.schema.json` → `schemas/v0/plugin-registry.schema.json` (registry/plugins.yaml)

## Hook validation rules (plugin.yaml)

The `hooks` block is validated as a strict object:

- Allowed keys: `marked-extension`, `template-head`, `template-body-end`
- Value type: boolean (`true`/`false`) only
- Unknown keys: **invalid** (schema rejects via `additionalProperties: false`)

Rationale: Contract-first + minimal loader. Unknown hooks should be caught at validation time rather than ignored at runtime.

## Supply chain constraints

- `dependencies.cdn[]` requires both `url` and `integrity`.
- `integrity` must be an SRI string (`sha256|sha384|sha512` + base64).
- Registry entries use **per-asset** SHA256 checksums: `assets.assetSha256.js` and/or `assets.assetSha256.css`.

Rationale: The brief mandates SRI on all CDN resources; the schema encodes this as required fields, not optional hints.

Rationale (checksums): Release-time `CHECKSUMS.yaml` is per-asset, and install-time verification should validate each fetched asset independently (JS and CSS can be cached and verified separately). Using an algorithm-specific field name (`assetSha256`) keeps room for future parallel algorithms without overloading a generic `checksums` structure.

## Registry asset types

The registry schema intentionally only supports `assets.js` and `assets.css` in v0.2.0.

Rationale: Keep the contract minimal; add additional asset types only when a concrete plugin requires them.

## Local registries (`baseUrl: ""`)

For offline/local registries that only reference on-disk assets (e.g. `plugins-dist/...`), `baseUrl` may be an empty string.

## Mode allowlisting (`modes`)

Both plugin manifests (`plugin.yaml`) and registry entries may include an optional `modes` field.

Semantics:

- Omitted: allowed in **all** Kitfly modes
- Present with values (e.g. `["docs"]`): allowed only in those modes
- Present but empty (`[]`): blocked in **all** modes (useful for temporarily disabling a plugin without removing it from `kitfly.plugins.yaml`)

Rationale: Kitfly has two primary rendering modes (`docs` and `slides`). Mode allowlisting is an intentionally small mechanism to keep plugins predictable and easy to dogfood across both surfaces.

## Version range validation

The `kitfly` field is required and validated as a simple “space-separated comparator” string (e.g. `>=0.2.0 <1.0.0`).

Rationale: JSON Schema cannot fully validate npm/semver range syntax without embedding a custom parser. This pattern check is intentionally minimal: it enforces “looks like comparator(s) + semver” while leaving exact semantics to the loader.

## Atomic plugins (no plugin-to-plugin dependencies)

The schema defines `dependencies` with `additionalProperties: false` and only allows a `cdn` field.

Rationale: This makes `dependencies.plugins` (or any other dependency category) invalid by construction, matching the “atomic plugins” decision.
