---
title: "Kitfly Overview"
description: "What Kitfly is, how it works, and the philosophy behind it"
last_updated: "2026-02-04"
---

# Kitfly Overview

Kitfly helps people who aren't web developers turn a folder of writing into something shareable:

- A **single-file HTML bundle** you can email or post in Slack
- A **static site folder** you can zip and host anywhere

It is intentionally small: one dependency (`marked`) and a codebase you can understand in an afternoon.

## Mission

Many people have documentation that needs to be shared: runbooks, handbooks, project docs, technical guides. The options are often:

- **Too heavy**: Docusaurus, Hugo, Astro require learning build tooling
- **Too locked**: Notion, Confluence, GitBook require accounts and subscriptions
- **Too ugly**: Raw markdown or PDFs don't look professional

Kitfly sits in the gap: professional output, minimal complexity, no lock-in.

## What Kitfly Is

- A renderer for markdown folders with a clean, professional default layout
- A fast way to preview docs locally (`kitfly dev`)
- A way to ship docs as artifacts (`kitfly bundle`, `kitfly build`)
- A tool that gives you **your own copy** of the rendering code

## What Kitfly Is Not

Kitfly is not trying to replace full static site generators or app frameworks. These are excellent — use them when you need their power:

| Tool                | Strength                        | Use When                |
| ------------------- | ------------------------------- | ----------------------- |
| **Obsidian**        | Personal knowledge, journaling  | You need a second brain |
| **Docusaurus**      | React ecosystem, versioned docs | You have a dev team     |
| **Hugo**            | Speed, themes, flexibility      | You want a powerful SSG |
| **Astro/Starlight** | Modern, component-driven        | You need interactivity  |
| **VitePress**       | Vue ecosystem, great DX         | You're in the Vue world |

Use Kitfly when you don't need those. Your content is just markdown — migration is straightforward when you outgrow it.

## Three Ways to Use Kitfly

### 1. Create a Standalone Site (Primary Path)

```bash
kitfly init my-docs
cd my-docs
bun install
bun run dev
```

This creates a **complete, self-contained site** with:

```
my-docs/
├── .kitfly/              # Provenance metadata
│   └── manifest.json
├── content/              # Your docs go here
├── scripts/              # Rendering code (yours now)
│   ├── dev.ts
│   ├── build.ts
│   └── bundle.ts
├── src/
│   ├── engine.ts
│   ├── theme.ts
│   └── site/
│       ├── template.html
│       └── styles.css
├── schemas/
├── site.yaml
├── package.json          # { "dependencies": { "marked": "^15" } }
└── VERSION               # Provenance: created from kitfly 0.1.0
```

**The site is detached from kitfly.** You own the code. You can:

- Modify the template, styles, rendering logic
- Version control the whole thing (`git init`)
- Never touch kitfly CLI again if you don't want to

**Best for:** New documentation projects, teams who want ownership.

### 2. Point at Existing Docs (Quick Preview)

```bash
kitfly dev ./my-existing-docs
kitfly build ./my-existing-docs --out ./dist
kitfly bundle ./my-existing-docs --name docs.html
```

Renders any folder of markdown without copying anything into it.

**Best for:** Previewing docs that live in another repo, quick experiments.

### 3. Clone the Kitfly Repo (Contributors)

```bash
git clone https://github.com/3leaps/kitfly
cd kitfly
bun install
bun run dev
```

This is the kitfly engine repo. The `content/` folder **is** the kitfly documentation — you're reading it now.

**Best for:** Contributing to kitfly, modifying the CLI, deep customization.

## The "Fly" — How Docs Travel

Kitfly makes docs "fly" by producing artifacts that travel well:

| Command         | Output           | Use Case                   |
| --------------- | ---------------- | -------------------------- |
| `kitfly dev`    | Live preview     | Writing and editing        |
| `kitfly build`  | `dist/` folder   | Deploy to any static host  |
| `kitfly bundle` | Single HTML file | Email, Slack, shared drive |

The bundle is typically 1-2MB and works offline — open it in any browser.

## Philosophy: Minimalist Site Code

The code that `kitfly init` copies to your project follows strict constraints:

| Metric       | Target | Rationale                      |
| ------------ | ------ | ------------------------------ |
| Total lines  | ~500   | Understandable in an afternoon |
| Dependencies | 1      | No supply chain risk           |
| Files        | ~10    | Nothing hidden                 |

> **Rule of thumb**: If it can be done with CSS, vanilla JS under 50 lines, or a marked plugin, it belongs. Otherwise, it doesn't.

This is codified in [ADR-0001: Minimalist Site Code](../../docs/decisions/ADR-0001-minimalist-site-code.md).

Users can modify the code — that's expected. But the starting point should be small enough that modification feels safe, not scary.

## Provenance and Updates

When you run `kitfly init`, the site is stamped with provenance:

```json
// .kitfly/manifest.json
{
  "version": "0.1.0",
  "createdAt": "2026-02-04T12:00:00Z",
  "files": {
    "scripts/dev.ts": { "hash": "a1b2c3", "managed": true },
    ...
  }
}
```

This enables future updates:

```bash
kitfly update        # Upgrade to latest
kitfly update 0.2.0  # Upgrade to specific version
```

The update logic:

1. Read manifest → know current version
2. For each managed file: check if user modified it (hash comparison)
3. Safe to replace → update file
4. User modified → warn, offer merge/skip/force
5. Update manifest with new version

## This Repo Is the Kitfly Docs

The `content/` folder in this repository is the actual kitfly documentation. When you run `kitfly dev .` here, you're seeing our docs rendered by our tool.

This means:

- **No fake showcase pages** — everything you see is real
- **Features are demonstrated by use** — Mermaid diagrams, code fences, theming
- **The docs are always current** — we eat our own cooking

## Architecture Summary

```
kitfly/                          # The tool
├── src/cli.ts                   # CLI entry (not copied to users)
├── src/commands/                # init, update (not copied)
├── content/                     # Kitfly's own docs (not copied)
│
├── scripts/                     # ← Copied to user sites
│   ├── dev.ts
│   ├── build.ts
│   └── bundle.ts
├── src/site/                    # ← Copied to user sites
│   ├── template.html
│   └── styles.css
├── src/engine.ts                # ← Copied
├── src/theme.ts                 # ← Copied
└── schemas/                     # ← Copied
```

**Kitfly the tool** can grow thoughtfully (more CLI commands, smarter updates). **Site code** stays minimal.

## Next Steps

- [Getting Started](getting-started.md) — Set up your first site
- [Features](features.md) — See code highlighting, Mermaid diagrams, theming
- [Configuration](../reference/configuration.md) — Customize `site.yaml` and `theme.yaml`
