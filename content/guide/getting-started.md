---
title: "Getting Started"
description: "Set up your first kitfly site"
last_updated: "2026-02-03"
---

# Getting Started

Get your documentation site running in under a minute.

## The Site Root Concept

Kitfly always operates on a folder you point it at (the **site root**).

That folder typically contains:

- `content/` (or `docs/` or any folder you choose)
- `site.yaml` (recommended) for nav + branding
- `theme.yaml` (optional) for colors + typography

## Create A New Site Root (Recommended)

```bash
kitfly init my-docs
cd my-docs
kitfly dev
```

Your browser opens to `http://localhost:3333` with hot reload.

## Add Your Content

1. **Delete the sample content:**
   ```bash
   rm -rf content/*
   ```

2. **Add your markdown files:**
   ```bash
   cp -r ~/my-docs/* content/
   ```

3. **Organize into sections:**
   ```
   content/
   ├── index.md           # Home page
   ├── guide/             # Becomes "Guide" section
   │   ├── quickstart.md
   │   └── tutorial.md
   └── reference/         # Becomes "Reference" section
       └── api.md
   ```

4. **Preview:**
   ```bash
   bun run dev
   ```

Subdirectories automatically become navigation sections. Files within them appear in the sidebar.

## Share It

```bash
kitfly build --out dist

# Single-file bundle (easiest to email/Slack)
kitfly bundle --out dist --name my-docs.html
```

Output goes to `dist/`. You can:

- **Open directly:** `open dist/index.html`
- **Deploy anywhere:** GitHub Pages, Netlify, S3, any static host
- **Share as zip:** Compress and email for review

The static HTML works offline - no server required.

## Frontmatter

Add metadata to your markdown files:

```yaml
---
title: "Page Title"
description: "Brief description"
last_updated: "2026-02-03"
---

# Your Content Here
```

- `title` - Appears in browser tab and header
- `description` - For meta tags
- `last_updated` - Shown in page footer

## Next Steps

- [Approaches](approaches.html) - Understand the three ways to use kitfly
- [Kitfly Overview](kitfly-overview.html) - The big picture and workflows
- [Features](features.html) - See code highlighting, diagrams, and more
- [Configuration](../reference/configuration.html) - Customize `site.yaml`

## Running From Source

If you're working on the Kitfly engine itself (this repo), you can run the CLI via Bun:

```bash
bun install
bun run src/cli.ts dev .
```
