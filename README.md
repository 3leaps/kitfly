<p align="center">
  <img src="assets/brand/kitfly-logo-512.png" alt="Kitfly" width="180">
</p>

<h1 align="center">Kitfly</h1>

<p align="center"><strong>Turn your writing into a website.</strong></p>

<p align="center">~500 lines of code. One dependency. Zero config required.</p>

<p align="center">No SaaS subscriptions. No 500MB node_modules. Just your docs, rendered clean.</p>

---

## Three Ways to Use Kitfly

| Approach | Best For | What You Get |
|----------|----------|--------------|
| **`kitfly init`** | New projects | Standalone site with your own copy of the code |
| **`kitfly dev ./folder`** | Existing docs | Quick preview without changing anything |
| **Clone this repo** | Contributors | The kitfly engine itself |

### Create a Standalone Site (Recommended)

```bash
kitfly init my-docs
cd my-docs
bun install
bun run dev
```

You get a complete, self-contained site: rendering code, template, styles, config. It's yours — modify it, version it, own it. No kitfly CLI required after setup.

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

See [Kitfly Overview](content/guide/kitfly-overview.md) for the full picture.

---

## Two Ways to Share

**Send it** — Single HTML file you can email, Slack, or drop in a shared drive. Works offline.

**Host it** — Static site you deploy to GitHub Pages, Netlify, S3, anywhere.

---

## What You Get

| Feature | How |
|---------|-----|
| Hot reload | Edit markdown, see changes instantly |
| Navigation | Auto-generated from folder structure |
| Table of contents | Extracted from headings |
| Dark mode | System preference + toggle |
| Diagrams | Mermaid via CDN |
| Syntax highlighting | Prism.js via CDN |
| Offline-ready | Static HTML, no server required |

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

---

## Philosophy

> **Rule of thumb**: If it can't be done with CSS, vanilla JS under 50 lines, or a marked plugin, it doesn't belong here.

Kitfly is intentionally limited. The goal is a doc site that stays simple and maintainable. When you outgrow it, migrate — your content is just markdown.

---

## Name

**Kit** + **Fly**

- **Kit**: Your handbook, runbook, notebook — a collection of docs
- **Fly**: Fast, instant, launching to the web

*Pack your docs. Watch them fly.*

---

**License:** MIT

Made by [3 Leaps](https://3leaps.net)
