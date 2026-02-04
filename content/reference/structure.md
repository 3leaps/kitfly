---
title: "Folder Structure"
description: "What lives where in a kitfly project"
last_updated: "2026-02-03"
---

# Folder Structure

Understanding what's in the template and what ends up in your built site.

## Template Repository

When you clone kitfly, you get:

```
kitfly/
├── content/              # YOUR DOCS
│   ├── index.md          # Home page
│   ├── guide/            # Guide section
│   └── reference/        # Reference section
│
├── src/                  # RENDERING MACHINERY
│   ├── cli.ts            # CLI entry point
│   ├── commands/         # CLI commands
│   └── site/             # HTML template + CSS
│
├── scripts/              # BUILD SCRIPTS
│   ├── dev.ts            # Dev server
│   └── build.ts          # Static build
│
├── assets/               # BRAND ASSETS
│   └── brand/            # Logo, favicon
│
├── dist/                 # BUILD OUTPUT (gitignored)
│
├── .plans/               # PLANNING (gitignored)
│
├── site.yaml             # CONFIGURATION
├── package.json          # Dependencies
├── VERSION               # Version number
├── README.md             # GitHub readme
├── AGENTS.md             # AI agent guide
└── LICENSE               # MIT license
```

## What Gets Built

When you run `bun run build`, **only content from `docroot` goes into `dist/`**:

```
dist/
├── index.html            # From content/index.md
├── guide/
│   ├── index.html        # Redirect to first file
│   ├── approaches.html   # From content/guide/approaches.md
│   ├── getting-started.html
│   └── features.html
├── reference/
│   ├── index.html        # Redirect to first file
│   ├── configuration.html
│   └── structure.html
├── styles.css            # From src/site/styles.css
├── provenance.json       # Build metadata
└── assets/               # Copied from assets/
    └── brand/
```

**Not in dist/:**
- `src/` - rendering code
- `scripts/` - build scripts
- `README.md` - GitHub readme
- `AGENTS.md` - AI guide
- `package.json` - dependencies
- `.plans/` - planning files
- Any other repo files

This separation is intentional. Your built site is just documentation - no tooling artifacts.

## The docroot Setting

In `site.yaml`:

```yaml
docroot: "content"
```

This tells kitfly where to look for markdown files. Options:

| Setting | Effect |
|---------|--------|
| `"content"` | Render from `content/` (recommended) |
| `"docs"` | Render from `docs/` (common in code repos) |
| `"."` | Render from repo root (use with care) |

### Why This Matters

With `docroot: "content"`:
- Your `README.md` stays on GitHub, not in the docs
- Your `package.json` isn't exposed
- You can have code, tests, and docs in the same repo

With `docroot: "."`:
- Everything in the repo root becomes documentation
- Useful for pure documentation repos
- You'll want to configure `sections` explicitly

## Customizing the Template

### The Machinery

If you want to modify how kitfly renders:

- **HTML template:** `src/site/template.html`
- **Styles:** `src/site/styles.css`
- **Dev server:** `scripts/dev.ts`
- **Build script:** `scripts/build.ts`

These are ~500 lines total. Read them, understand them, modify if needed.

### Brand Assets

Replace files in `assets/brand/`:

- `kitfly-logo.svg` - Vector logo (ensure tight viewBox)
- `kitfly-logo-512.png` - Used in README
- `kitfly-logo-128.png` - Sidebar header fallback
- `kitfly-favicon-32.png` - Browser favicon

These are copied to `dist/assets/` during build.

## For Different Use Cases

### Documentation alongside code

```
my-project/
├── src/              # Your code
├── tests/            # Your tests
├── docs/             # Your documentation
│   ├── index.md
│   └── api/
└── site.yaml         # docroot: "docs"
```

### Pure documentation repo

```
my-docs/
├── index.md
├── guides/
├── reference/
└── site.yaml         # docroot: "."
```

### Existing markdown

Point kitfly at any folder:

```bash
kitfly dev ./path/to/markdown
```

No need to restructure anything.
