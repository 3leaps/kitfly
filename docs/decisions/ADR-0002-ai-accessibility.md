---
title: "ADR-0002: AI Accessibility for Published Sites"
description: "Standard for making kitfly sites consumable by AI agents"
author: "devlead"
supervised_by: "@3leapsdave"
date: "2026-02-04"
status: "accepted"
tags: ["adr", "architecture", "ai", "accessibility", "llms"]
---

# ADR-0002: AI Accessibility for Published Sites

## Status

Accepted

## Context

Kitfly sites are primarily viewed by humans in browsers. However, AI agents increasingly need to consume documentation:

- Agents browsing deployed sites on cloud storage or intranets
- LLMs researching documentation during coding tasks
- Automated documentation indexing and search

HTML parsing is inefficient for AI agents. They prefer:
- Structured metadata for discovery
- Raw markdown for content consumption
- Predictable paths for programmatic access

## Decision

### Standard Files Generated

Every `kitfly build` generates these AI accessibility files:

#### 1. `content-index.json`

Machine-readable index of all pages:

```json
{
  "version": "0.1.0",
  "generated": "2026-02-04T12:00:00Z",
  "title": "Site Title",
  "baseUrl": "/",
  "rawMarkdownPath": "/_raw",
  "pages": [
    {
      "path": "/guide/getting-started",
      "htmlPath": "/guide/getting-started.html",
      "rawPath": "/_raw/guide/getting-started.md",
      "title": "Getting Started",
      "section": "Guide",
      "source": "content/guide/getting-started.md",
      "description": "Optional description from frontmatter"
    }
  ]
}
```

#### 2. `llms.txt`

Following the emerging [llms.txt convention](https://llmstxt.org/):

```
# llms.txt - AI agent guidance for Site Title
name: Site Title
version: 0.1.0
generated: 2026-02-04T12:00:00Z

content-index: /content-index.json
raw-markdown: /_raw/{path}.md
preferred-format: markdown

sections: Guide, Reference
total-pages: 10
```

#### 3. `_raw/` Directory

Raw markdown files mirroring the site structure:

```
_raw/
├── guide/
│   ├── getting-started.md
│   └── features.md
└── reference/
    └── configuration.md
```

### Bundle Format

Single-file bundles embed accessibility data as hidden JSON:

```html
<script type="application/json" id="kitfly-content-index">
  { ... content index ... }
</script>
<script type="application/json" id="kitfly-raw-markdown">
  { "guide/getting-started": "# Getting Started\n...", ... }
</script>
```

### Opt-Out for Size-Sensitive Use Cases

The `--no-raw` flag disables raw markdown for smaller output:

```bash
kitfly build --no-raw     # No _raw/ directory
kitfly bundle --no-raw    # No embedded raw markdown
```

Content index and llms.txt are always generated (minimal overhead).

## Agent Consumption Pattern

An AI agent discovering a kitfly site:

1. Fetch `/llms.txt` to understand the site
2. Fetch `/content-index.json` for full page inventory
3. Fetch raw markdown from `/_raw/{path}.md` for content
4. Fall back to HTML parsing only if raw unavailable

## Consequences

### Positive

- Agents can efficiently consume kitfly sites
- Raw markdown preserves frontmatter and original formatting
- Structured index enables smart navigation
- Standard paths work across all kitfly sites
- Minimal size overhead (JSON index + optional raw copies)

### Negative

- Slightly larger build output (mitigated by `--no-raw`)
- Raw markdown exposes source (acceptable for docs)

### Neutral

- Agents may still parse HTML for sites without llms.txt
- Convention is emerging, not yet universal

## Compliance

All kitfly builds must generate `content-index.json` and `llms.txt`. Raw markdown is on by default but can be disabled.

## References

- [llms.txt specification](https://llmstxt.org/)
- [ADR-0001: Minimalist Site Code](ADR-0001-minimalist-site-code.md)
