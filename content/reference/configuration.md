---
title: "Configuration"
description: "Customize your kitfly site"
last_updated: "2026-02-03"
---

# Configuration

Kitfly uses `site.yaml` for configuration. Everything is optional - sensible defaults apply.

## Quick Reference

```yaml
# yaml-language-server: $schema=./schemas/v0/site.schema.json
schemaVersion: "0.1.0"
docroot: "content"
title: "My Documentation"
home: "index.md"

brand:
  name: "My Project"
  url: "https://myproject.com"
  external: true

sections:
  - name: "Guide"
    path: "guide"
  - name: "API"
    path: "api"
```

## Settings

### docroot

**The most important setting.** Controls what folder contains your documentation.

```yaml
docroot: "content"
```

| Value       | Meaning                                    |
| ----------- | ------------------------------------------ |
| `"content"` | Markdown lives in `content/` (recommended) |
| `"docs"`    | Markdown lives in `docs/`                  |
| `"."`       | Markdown lives in repo root                |

**Why it matters:** Only files under `docroot` appear in your built site. Everything else - `src/`, `scripts/`, `README.md`, `package.json` - stays out of `dist/`.

See [Folder Structure](structure.html) for details.

### title

Site title. Appears in browser tab and header.

```yaml
title: "My Documentation"
```

### home

Home page file (relative to docroot). Becomes `index.html`.

```yaml
home: "index.md"
```

If omitted, the first file from the first section is used.

### brand

Header branding:

```yaml
brand:
  name: "My Project" # Text in header
  url: "/" # Logo link
  logo: "assets/brand/my-logo.png" # Sidebar logo image
  favicon: "assets/brand/favicon-32.png" # Browser tab icon
  external: true # Open in new tab (optional)
```

The logo renders inside a bounded slot that preserves aspect ratio:

| Breakpoint | Max Height | Max Width |
|------------|-----------|-----------|
| Desktop | 64px | 180px |
| Tablet (≤1024px) | 56px | 150px |
| Mobile (≤768px) | 48px | 130px |

Both square marks and wide wordmarks fit cleanly. SVG and PNG formats are supported. For SVGs, ensure the `viewBox` is tightly cropped to the artwork — an oversized canvas will render the logo too small.

### sections

Navigation structure. Each section becomes a sidebar group.

```yaml
sections:
  - name: "Guide" # Display name
    path: "guide" # Directory (relative to docroot)
  - name: "Reference"
    path: "reference"
```

**Auto-discovery:** If `files` is omitted, all `.md` files in the directory are included, recursively up to `maxDepth` levels deep.

```yaml
sections:
  - name: "Reference"
    path: "reference"
    maxDepth: 6 # Discover up to 6 levels deep (default: 4, max: 10)
```

| Setting | Default | Range | Effect |
|---------|---------|-------|--------|
| `maxDepth` | 4 | 1–10 | How many directory levels to scan for `.md` files |

Deeper sections produce hierarchical sidebar navigation with collapsible groups. Set a lower `maxDepth` for sections where you want a flatter sidebar.

**Explicit files:** For precise control over which files appear (bypasses auto-discovery):

```yaml
sections:
  - name: "Overview"
    path: "."
    files: ["README.md", "CHANGELOG.md"]
```

## Frontmatter

Each markdown file can have YAML frontmatter:

```yaml
---
title: "Page Title"
description: "Brief description for meta tags"
last_updated: "2026-02-03"
---
# Content starts here
```

| Field          | Purpose                         |
| -------------- | ------------------------------- |
| `title`        | Page title (overrides filename) |
| `description`  | Meta description                |
| `last_updated` | Shown in page footer            |

## No Configuration

If you don't create `site.yaml`, kitfly will:

1. Look for `content/` directory
2. Auto-discover sections from subdirectories
3. Use default title ("Documentation") and branding

This means you can start with just markdown files and add `site.yaml` later.

## Schema Validation

For editor autocomplete and validation, reference the schema:

```yaml
# yaml-language-server: $schema=./schemas/v0/site.schema.json
```

The schema is in `schemas/v0/site.schema.json`.
