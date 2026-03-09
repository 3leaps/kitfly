<p align="center">
  <img src="assets/brand/kitfly-logo-512.png" alt="Kitfly" width="180">
</p>

<h1 align="center">Kitfly</h1>

<p align="center"><strong>Turn your writing into a website.</strong></p>

<p align="center">~500 lines of code. One dependency. Zero config required.</p>

<p align="center">No SaaS subscriptions. No 500MB node_modules. Just your docs, rendered clean.</p>

---

## Install

Kitfly requires [Bun](https://bun.sh) as its runtime.

```bash
# Install Bun (if you don't have it)
curl -fsSL https://bun.sh/install | bash

# Install Kitfly globally (from npm)
bun add -g kitfly

# Verify
kitfly --version
```

Alternative: `npm install -g kitfly` (still requires Bun, because the CLI runs with Bun).

No global install: `bunx kitfly --version`

Note: `bun`/`npm` installs the latest published release. If you're reading `main` before a release is cut, clone this repo for the newest features.

**Don't need the CLI?** `kitfly init` creates a [standalone site](#create-a-standalone-site-recommended) that runs with just Bun — no kitfly binary required after setup.

For contributor/development setup, see [docs/development.md](docs/development.md).

---

## What's a Kitsite?

Any site created or managed by kitfly is a **kitsite** — a self-contained workspace with your content, configuration, and (optionally) build scripts. A kitsite can operate in different **modes**:

| Mode     | What it produces                  | Created with                          |
| -------- | --------------------------------- | ------------------------------------- |
| `docs`   | Documentation site (default)      | `kitfly init my-docs`                 |
| `slides` | Fixed-aspect slide deck (v0.2.0+) | `kitfly init my-deck --template deck` |

Every kitsite has the same structure: a `content/` directory with your markdown, a `site.yaml` for configuration, and static output you can host anywhere or bundle into a single HTML file. Standalone kitsites (created with `kitfly init`) include their own build scripts and run with just Bun — no kitfly CLI required after setup.

---

## Three Ways to Use Kitfly

| Approach                  | Best For      | What You Get                                      |
| ------------------------- | ------------- | ------------------------------------------------- |
| **`kitfly init`**         | New projects  | Standalone kitsite with your own copy of the code |
| **`kitfly dev ./folder`** | Existing docs | Quick preview without changing anything           |
| **Clone this repo**       | Contributors  | The kitfly engine itself                          |

### Create a Standalone Kitsite (Recommended)

```bash
kitfly init my-docs
cd my-docs
bun install
bun run dev
```

Or start a slide deck:

```bash
kitfly init my-deck --template deck
cd my-deck
bun install
bun run dev
```

You get a complete, self-contained kitsite: rendering code, template, styles, config. It's yours — modify it, version it, own it. No kitfly CLI required after setup.

### Preview Existing Docs

```bash
kitfly dev ./path/to/markdown
kitfly build ./docs --out ./dist
kitfly bundle ./docs --name docs.html
```

Render any folder of markdown instantly. Great for docs that live in another repo.

### Clone for Development

```bash
git clone https://github.com/3leaps/kitfly
cd kitfly
bun install
bun run dev
```

The `content/` folder is the actual kitfly documentation. What you see is what you get.

For full contributor setup (toolchain, bootstrap, local CLI), see [docs/development.md](docs/development.md). For the product overview, see [Kitfly Overview](content/guide/kitfly-overview.md).

---

## Two Ways to Share

**Send it** — Single HTML file you can email, Slack, or drop in a shared drive. Works offline.

**Host it** — Static site you deploy to GitHub Pages, Netlify, S3, anywhere.

---

## What You Get

| Feature             | How                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Hot reload          | Edit markdown, see changes instantly                                                             |
| Navigation          | Auto-generated from folder structure                                                             |
| Table of contents   | Extracted from headings                                                                          |
| Dark mode           | System preference + toggle                                                                       |
| Slides mode         | `mode: slides` for fixed-aspect decks (v0.2.0+)                                                  |
| Gantt charts        | Wave-based planning with `max-depth` filtering — one dataset, summary and detail views (v0.2.4+) |
| Plugins             | Optional add-ons via `kitfly.plugins.yaml` (pinned + integrity-checked)                          |
| Diagrams            | Mermaid via CDN                                                                                  |
| Syntax highlighting | Prism.js via CDN                                                                                 |
| Embedded docs       | `kitfly docs list` and `kitfly docs show <slug>` — offline CLI reference (v0.2.4+)               |
| Offline-ready       | Static HTML, no server required                                                                  |

## What You Don't Get

- Component libraries
- Client-side routing
- Build pipelines to learn
- Framework lock-in
- Subscription fees

If you need those features, use [Astro](https://astro.build), [VitePress](https://vitepress.dev), or [Docusaurus](https://docusaurus.io). They're excellent. Kitfly is for when you don't.

---

## Configuration

Create `site.yaml` (optional):

```yaml
docroot: "content"
title: "My Documentation"
home: "index.md"
mode: "docs" # or "slides" (v0.2.0+)

brand:
  name: "My Project"
  url: "/"

sections:
  - name: "Guide"
    path: "guide"
  - name: "Reference"
    path: "reference"
```

Or just drop markdown files in `content/` — sections auto-discover.

## Plugins

Plugins are optional CSS/JS add-ons (kept out of core) that you enable per-kitsite.

- Config: `kitfly.plugins.yaml`
- Versions are pinned (`name@x.y.z`)
- Assets are integrity-checked (sha256)

See `content/reference/plugins.md` for the contract and examples.

---

## Philosophy

> **Rule of thumb**: If it can't be done with CSS, vanilla JS under 50 lines, or a marked plugin, it doesn't belong here.

Kitfly is intentionally limited. The goal is a kitsite that stays simple and maintainable. When you outgrow it, migrate — your content is just markdown.

---

## Name

**Kit** + **Fly**

- **Kit**: Your handbook, runbook, notebook — a collection of docs
- **Fly**: Fast, instant, launching to the web

_Pack your docs. Watch them fly._

---

**License:** MIT

Made by [3 Leaps](https://3leaps.net)
