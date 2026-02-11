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
version: "2.4.1"
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

footer:
  copyright: "© 2026 My Project. All rights reserved."
  links:
    - text: "Privacy"
      url: "/privacy"
    - text: "Terms"
      url: "/terms"
  attribution: true
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

### version

Site/content version shown in the footer provenance zone.

```yaml
version: "2.4.1"
```

Version resolution order:

1. `site.yaml` `version`
2. Git tag on `HEAD` (exact match, `v` prefix removed)
3. Omitted from footer provenance if neither is available

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

### footer

Footer has three zones: provenance (left), copyright and links (center), and Kitfly attribution (right). Each field is independent — setting one does not affect the others.

```
v0.1.1 · Published 2026-02-10     © 2026 Acme Inc. · acme.com     Built with Kitfly
← provenance (automatic)          ← copyright + links (configurable) → ← attribution →
```

| Field | Default | What it controls |
|-------|---------|-----------------|
| `copyright` | `© {publish-year} {brand.name}` | The copyright text in the center zone |
| `copyrightUrl` | *(none)* | Makes the copyright text a clickable link |
| `links` | Your `brand.url` shown as a link | Links after the copyright text (max 10) |
| `attribution` | `true` | "Built with Kitfly" on the right |

**Common case: product name differs from copyright holder.** The default copyright uses `brand.name`, which is your product title (shown in the header). If your legal entity is different, override it:

```yaml
# brand.name is "Acme Productbook" — that's the product title
# but the copyright holder is the company
footer:
  copyright: "© 2026 Acme, Inc."
```

This changes only the copyright. The brand URL link and attribution are unaffected.

**Make the copyright clickable:**

```yaml
footer:
  copyright: "© 2026 3 Leaps, LLC"
  copyrightUrl: "https://3leaps.net"
```

When `copyrightUrl` is set, the copyright text becomes a link. When omitted, it renders as plain text.

**Full example with all options:**

```yaml
footer:
  copyright: "© 2026 My Company, Inc."
  copyrightUrl: "https://mycompany.com"
  links:
    - text: "Privacy"
      url: "/privacy"
    - text: "Terms"
      url: "/terms"
  attribution: true
```

When `links` is set, it replaces the default brand URL link. When `links` is omitted, your `brand.url` appears as a link (with the protocol stripped — `https://acme.com` displays as `acme.com`).

Set `footer.attribution: false` to remove the "Built with Kitfly" text from the footer entirely.

### theme layout (`theme.yaml`)

`theme.yaml` can override layout variables, including sidebar width.

```yaml
# theme.yaml
layout:
  sidebarWidth: "320px"
```

This sets `--sidebar-width` and applies to dev server, static builds, and bundles.

Recommended range: `240px` to `400px` depending on logo and nav label length.

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
