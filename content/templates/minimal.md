---
title: Minimal Template
description: The base template that all others extend
---

# Minimal Template

The `minimal` template is the foundation. Every other template extends it, inheriting these core files. Use it when you want complete control over your site's structure.

## When to Use

- You want to define your own sections from scratch
- Your documentation doesn't fit the patterns of handbook, runbook, pipeline, or productbook
- You're prototyping or experimenting with kitfly
- You plan to build a custom structure for a specific domain

## What You Get

```
my-site/
├── site.yaml        # Basic configuration (no sections)
├── index.md         # Simple welcome page
├── .gitignore       # Standard ignores
├── README.md        # Project documentation
├── content/         # Empty, ready for your structure
│   └── .gitkeep
└── assets/brand/    # Placeholder for logo, favicon
    └── .gitkeep
```

## Usage

```bash
kitfly init my-site
# or explicitly:
kitfly init my-site --template minimal
```

## Building Your Own Structure

Creating a custom site from minimal takes three steps:

### 1. Create content folders

Organize your markdown files under `content/` however makes sense for your domain:

```
content/
├── concepts/
│   ├── overview.md
│   └── architecture.md
├── workflows/
│   ├── onboarding.md
│   ├── review-process.md
│   └── advanced/
│       ├── index.md
│       └── custom-pipelines.md
└── api/
    ├── authentication.md
    └── endpoints/
        ├── users.md
        └── projects.md
```

### 2. Define sections in `site.yaml`

Each section maps to a folder. The sidebar builds automatically from your files:

```yaml
title: "My Platform Docs"

brand:
  name: "Platform"
  url: "/"

sections:
  - name: "Concepts"
    path: "content/concepts"
  - name: "Workflows"
    path: "content/workflows"
  - name: "API"
    path: "content/api"
```

### 3. Add markdown files

Write your content. Each `.md` file appears in the sidebar under its section. That's it — no registration step, no config per file.

## Hierarchical Navigation

Kitfly automatically organizes deeper folder structures into collapsible navigation groups. If you nest files inside subdirectories, the sidebar reflects that hierarchy:

```
WORKFLOWS
  onboarding
  review-process
  ▸ advanced          ← click to expand
      custom-pipelines
```

- Subdirectories appear as collapsible groups with expand/collapse indicators
- An `index.md` inside a subdirectory becomes the clickable link on the group label
- Flat sections (no subdirectories) render as simple lists — no extra overhead
- No JavaScript required — this uses native HTML `<details>` elements

This means you can start flat and add depth later without changing any configuration. Just create subdirectories and the sidebar adapts.

## Configuration

The generated `site.yaml` includes commented examples to get you started:

```yaml
title: "My Site"

brand:
  name: "My Brand"
  url: "/"

# Uncomment and customize:
# sections:
#   - name: "Guide"
#     path: "content/guide"
#   - name: "Reference"
#     path: "content/reference"
```

## When to Use a Specialized Template Instead

If your site fits one of these patterns, start with a specialized template — you'll get curated sections, starter content, and a `CUSTOMIZING.md` guide:

| Pattern | Template | Why |
|---------|----------|-----|
| Team knowledge base | `handbook` | Overview / Guides / Reference structure |
| Service operations | `runbook` | Procedures, troubleshooting, incidents |
| Data pipeline ops | `pipeline` | Stages, sources, destinations, manifests |
| Product + business domain | `productbook` | Features, domain processes, planning, ADRs |

You can always restructure later — templates are starting points, not constraints.
