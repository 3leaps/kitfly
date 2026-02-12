---
title: "ADR-0005: Plugin Contract and Distribution Strategy"
description: "Defines plugin contract stability, versioning policy, and in-repo-first distribution with extraction path"
author: "devlead"
supervised_by: "@3leapsdave"
date: "2026-02-11"
status: "proposed"
tags: ["adr", "plugins", "architecture", "versioning", "supply-chain"]
---

# ADR-0005: Plugin Contract and Distribution Strategy

## Status

Proposed

## Context

Kitfly v0.2.0 introduces optional plugin capabilities to support advanced use cases (starting with slides and live-slide extensions) without bloating core site code.

As of M1.1, basic slide **shape primitives** remain core CSS. Plugin scope starts at higher-level figures/widgets and engine integrations where deterministic core CSS stops.

Two operational choices must be explicit:

1. **Contract stability**: plugin authors and site operators need a clear, versioned interface that remains predictable.
2. **Repository strategy**: plugins can live in the main repo or a separate repo; we need a pragmatic default and a low-risk migration path.

## Decision

### 1. Treat plugin contract as versioned API

Kitfly will define a versioned plugin contract (`plugin.schema.json` + hook semantics) as a compatibility boundary.

Contract rules:
- Contract version is explicit (e.g. `contract: "1"`).
- Breaking changes require a new major contract version.
- Backward-compatible additions are allowed within a contract major version.
- Deprecations must include migration guidance before removal.

### 2. Start plugins in-repo for v0.2.0

For v0.2.0 delivery speed, first-party plugins are developed in the main kitfly repository under a dedicated plugin path and registry/config structure.

Why now:
- Faster iteration while contract and hooks are stabilizing.
- Lower coordination overhead across core + plugin changes.
- Simpler QA and dogfooding in a single branch/CI surface.

### 3. Keep extraction path explicit

In-repo is not permanent by requirement. Plugin layout, manifest format, and loader/registry interfaces must remain portable so plugins can move to `kitfly-plugins` later with minimal disruption.

Extraction trigger signals:
- plugin maintenance cadence diverges from core,
- external contribution volume rises,
- plugin release/security pipeline becomes materially heavier.

### 4. Security and policy baseline

Distribution policy applies regardless of repo location:
- version pinning required,
- checksum verification required,
- SRI required for CDN assets,
- untrusted third-party plugins denied by default unless explicit opt-in.

## Consequences

### Positive

- Contract clarity reduces integration breakage and support ambiguity.
- In-repo startup reduces delivery friction for v0.2.0.
- Future repo split remains available without contract rewrite.

### Negative

- Core repo grows in scope and review surface in the short term.
- Requires discipline to prevent plugin internals from leaking into core assumptions.

### Neutral

- Repo location is an implementation detail; contract/API stability is the true long-term commitment.

## Compatibility Policy (Initial)

- Contract v1 supported throughout v0.2.x.
- If contract v2 is introduced, v1 support remains for at least one minor release.
- Compatibility matrix (kitfly version ↔ contract version) must be documented in plugin docs.

## Alternatives Considered

### Separate plugin repo immediately

Pros: cleaner ownership and release boundaries from day one.
Cons: slower early iteration and more cross-repo coordination while contracts are still fluid.

Decision: defer split until signals justify it.

### No formal contract versioning

Rejected: too much ambiguity and high breakage risk once plugins exist in the wild.

## References

- [DDR-0005: Deterministic Layout Boundary](DDR-0005-deterministic-layout-boundary.md)
- [Design Catalog: Shapes and Figures](../../content/reference/design-catalog.md)
- [ADR-0001: Minimalist Site Code](ADR-0001-minimalist-site-code.md)
