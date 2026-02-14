---
title: "Kitfly"
description: "Turn your writing into a website"
last_updated: "2026-02-03"
---

# Welcome to Kitfly

You're looking at a kitfly site. This content is both a demo and the help guide.

## Choose Your Approach

| Approach              | Best For                         | Command                  |
| --------------------- | -------------------------------- | ------------------------ |
| **CLI Init**          | New site root folder             | `kitfly init my-docs`    |
| **Point at Folder**   | Existing markdown, quick preview | `kitfly dev ./my-folder` |
| **Clone & Customize** | Contributors / engine changes    | `git clone ... kitfly`   |

### CLI Init

Creates a **site root** folder with just what you need:

```bash
kitfly init my-handbook
cd my-handbook
kitfly dev
```

You get: `content/`, `site.yaml`, `.gitignore`. Nothing else.

**Good for:** Starting fresh without template clutter.

### Point at Folder

Render any folder of markdown files without setup (great for docs that already live in a repo):

```bash
kitfly dev ./path/to/markdown
kitfly build ./path/to/markdown --out ./dist
kitfly bundle ./path/to/markdown --out ./dist --name docs.html
```

**Good for:** Existing repos with docs, quick previews, experimentation.

### Clone & Customize

This is the **Kitfly engine repo** (what you're reading right now). Most users won't clone it.

Clone this when you want to change the template HTML/CSS, extend rendering behavior, or contribute.

## What's In This Repo

```
kitfly/
├── content/          ← The docs you're reading now (example site)
├── src/              ← Engine code
├── scripts/          ← dev/build/bundle
├── assets/           ← Built-in assets (favicons/logos)
├── site.yaml         ← Config for this example site
└── theme.yaml        ← Theme for this example site
```

The `docroot` setting in `site.yaml` controls what gets rendered.

## Next Steps

- [Approaches](content/guide/approaches.html) - Detailed comparison
- [Getting Started](content/guide/getting-started.html) - Setup instructions
- [Kitfly Overview](content/guide/kitfly-overview.html) - Big picture and workflows
- [Features](content/guide/features.html) - See what kitfly can do
- [Configuration](content/reference/configuration.html) - Customize your site
- [Deployment](content/deployment/index.html) - Publish your site safely
- [Reference](content/reference/index.html) - Concepts, glossary, and lookups
