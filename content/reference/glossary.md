---
title: "Glossary"
description: "Quick definitions for common Kitfly terms"
last_updated: "2026-02-12"
---

# Glossary

If you’re new to static sites or developer tooling, this page is for you. It’s okay to not know this stuff yet.

## Site root

The folder you run Kitfly commands from. It typically contains `site.yaml` and your `docroot` folder.

## `docroot`

The folder Kitfly reads as your documentation source (often `content/`).

## Section

A left-nav grouping in Kitfly. In `site.yaml`, each `sections:` entry becomes a navigation section.

## `dist/`

The output folder created by `kitfly build` (the folder you deploy).

## Build

The `kitfly build` output: a folder of files (`dist/`) intended for hosting on a static site provider.

## Bundle

The `kitfly bundle` output: a single HTML file intended for sending (email/Slack/upload) and offline viewing.

## Dev server

The local server started by `kitfly dev` for authoring and previewing your docs with hot reload.

## Hot reload

When the page refreshes automatically after you edit a file. Kitfly watches your docs and config while the dev server is running.

## Frontmatter

Optional YAML metadata at the top of a Markdown file (between `---` lines). Common fields include `title` and `description`.

## Mode

Kitfly site layout mode.

- `docs` (default): scrolling pages optimized for reading
- `slides` (v0.2.0+): fixed-aspect slides with keyboard navigation

## Aspect ratio

Slides-only setting that controls the shape of the slide frame (for example `16/9` or `4/3`).

## Static hosting

Hosting that serves files (HTML/CSS/JS/images) without running your own backend server.

## Theme

A set of styling choices for your site (colors, typography, layout details), typically configured in `theme.yaml`.

## Template

An optional starting point you can generate with `kitfly init --template ...`. Templates are just folders of Markdown and config you own and can edit.

## Mermaid

A diagram syntax that Kitfly can render in the browser (via CDN) for flowcharts, sequence diagrams, and more.

## Prism

The syntax highlighter Kitfly uses for code blocks (via CDN).

## CDN

Content Delivery Network. A fast way to load shared libraries (like Mermaid/Prism) without bundling them into Kitfly.

## SRI / integrity hash

“Subresource Integrity” hashes help browsers verify a CDN file hasn’t been tampered with. You’ll see these as `integrity="sha384-..."` in some setups.

## Environment variable

A named value provided to commands and apps by your shell or host platform (often used for secrets).

## Secret

A sensitive value (token/key/password) that should not be committed to git and should be stored in a secret manager or environment variable.
