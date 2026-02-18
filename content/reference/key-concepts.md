---
title: "Key Concepts"
description: "Mental models for how Kitfly works"
last_updated: "2026-02-17"
---

# Key Concepts

Kitfly is intentionally small. If you understand these concepts, you understand the whole tool.

## Site root

Your “site root” is the folder you run commands from. It usually contains:

- `site.yaml`
- `content/` (your docs)

When you run `kitfly dev`, `kitfly build`, or `kitfly bundle`, you usually run them from your site root.

## `docroot`

`docroot` is the folder Kitfly renders into a site.

In most projects:

- `docroot: "content"`

Think of `docroot` as “the folder I’m publishing”.

## Sections

Sections are what you see in the left navigation. Each section maps to a folder.

In `site.yaml`, it looks like:

```yaml
sections:
  - name: "Guide"
    path: "guide"
```

If you point `kitfly` at a folder without a `site.yaml`, Kitfly can auto-discover sections from subfolders (handy for quick previews).

## `dist/` (build output)

`kitfly build` produces a static site folder, commonly:

- `dist/`

You deploy by uploading/syncing `dist/` to a static host.

## Build vs Bundle vs Dev

- **Dev** (`kitfly dev`) is for writing: it runs a local server and reloads when files change.
- **Build** (`kitfly build`) is for hosting: it creates a `dist/` folder you can upload.
- **Bundle** (`kitfly bundle`) is for sending: it creates a single HTML file you can email or drop in Slack.

## Build vs Bundle

- **Build**: outputs a folder (`dist/`) with multiple files (HTML + assets).
- **Bundle**: outputs a single HTML file you can email or upload (offline-friendly).

## Markdown + frontmatter

Kitfly renders Markdown files (`.md`). You can optionally add YAML frontmatter at the top of a file:

```yaml
---
title: "My Page"
description: "What this page is about"
---
```

Frontmatter is the easiest way to control titles and add metadata without changing your headings.

## Theme (`theme.yaml`)

Kitfly themes control the look of your site (colors, typography, layout details). The defaults are meant to be clean and readable.

If you don’t want to think about design: don’t touch it.

If you do: `theme.yaml` is your main “make it mine” knob.

## Modes: docs vs slides (v0.2.0+)

Kitfly can render the same Markdown content in two layouts:

- **docs** (default): scrolling pages optimized for reading
- **slides**: fixed-aspect "one page at a time" slides with keyboard navigation

Slides mode is configured in `site.yaml`:

```yaml
mode: slides
aspect: "16/9"
```

In both modes, organizing content into subfolders produces hierarchical sidebar navigation with collapsible groups. In slides mode, the nav links remain `#slide-N` hash anchors — the tree structure is visual grouping only.

## Assets

Kitfly will serve and bundle common “content-adjacent” assets referenced from Markdown, like images and PDFs.

Rule of thumb: if it lives next to your docs, Kitfly tries to do the right thing.

## Content profiles (v0.2.3+)

Profiles let you produce multiple audience-specific outputs from a single kitsite. Tag files with `profile:` in frontmatter and activate a profile via `--profile` flag or `KITFLY_PROFILE` env var.

- Files without `profile:` are always included (the common case).
- Tagged files only appear when their profile is active.
- No active profile = only untagged content.

This is a startup parameter, not a runtime toggle — changing profiles requires restarting the dev server.

## Data bindings (v0.2.3+)

A page can opt into build-time bindings by setting `data:` in frontmatter.

- `{{ key }}` resolves scalar values from a data file.
- `{{ snippet:name }}` injects a named markdown block.
- Formatters like `dollar`, `number`, `percent`, `round(n)`, `upper`, `lower` apply with pipe syntax.

No loops/conditionals are supported in bindings. If you need logic, use a generator script and write data files before render.

## Pre-build hooks (v0.2.3+)

`prebuild:` commands in `site.yaml` run before `dev`, `build`, and `bundle`.

Use hooks for generators (CSV/API/etc. to `data/*.yaml` or `data/*.json`). In dev mode, hook `watch:` patterns can re-run hooks when source files change.

## Provenance

Kitfly can emit provenance information (version/build date/git info) so you can answer “what did we ship?”.

If you see “unversioned”, it usually means your site didn’t set a `version` in `site.yaml` and the current git commit isn’t exactly tagged.

## “Static site” (plain language)

A static site is just files. No server-side database, no login, no runtime code required.

That’s why Kitfly sites are easy to:

- host almost anywhere
- email as an attachment (bundle)
- keep offline
