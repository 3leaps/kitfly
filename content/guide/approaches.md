---
title: "Approaches"
description: "Three ways to use kitfly"
last_updated: "2026-02-03"
---

# Three Ways to Use Kitfly

Kitfly adapts to how you work. Choose the approach that fits your situation.

## 1. Clone & Customize

**What you get:** The Kitfly engine repo (renderer, template HTML/CSS, example content).

```bash
git clone https://github.com/3leaps/kitfly my-docs
cd my-docs
bun install
bun run dev
```

**Directory structure:**

```
my-docs/
├── content/          # Replace this with your docs
│   ├── index.md
│   └── guide/
├── src/              # Rendering code (keep this)
├── scripts/          # Build scripts (keep this)
├── site.yaml         # Edit to customize
├── package.json      # Dependencies
└── ...               # Other template files
```

**When to use:**

- You want to understand or modify how kitfly works
- You plan to customize the HTML template or CSS
- You want version control of the tooling alongside your docs
- You're comfortable with a bit of extra files in your repo

If you're not changing Kitfly itself, prefer `kitfly init` or pointing Kitfly at a folder.

**Trade-offs:**

- More files to manage
- Your docs repo includes rendering code
- Updates require manual merging from upstream

## 2. CLI Init

**What you get:** A clean workspace with minimal structure.

```bash
# Create new site root
kitfly init my-handbook
cd my-handbook
kitfly dev
```

**Directory structure:**

```
my-handbook/
├── content/
│   ├── index.md
│   └── guide/
│       └── getting-started.md
├── site.yaml
└── .gitignore
```

**When to use:**

- You want a clean start without template clutter
- You prefer your docs separate from tooling
- You're starting a new documentation project
- You want the simplest possible structure

**Trade-offs:**

- Requires kitfly installed (binary or via a JS runtime)
- Can't customize the rendering without ejecting
- Depends on kitfly CLI being available

## 3. Point at Folder

**What you get:** Instant rendering of any markdown folder.

```bash
# Preview existing docs
kitfly dev ./docs

# Build to static HTML
kitfly build ./docs --out ./dist

# Custom port
kitfly dev ./docs --port 4000
```

**Directory structure:** Whatever you already have.

```
my-project/
├── docs/             # kitfly renders this
│   ├── README.md
│   ├── api/
│   └── guides/
├── src/              # Your project code (ignored)
└── ...
```

**When to use:**

- You have existing markdown you want to render
- You want to preview docs in another repo
- You're experimenting before committing to a structure
- You need a quick way to share markdown as HTML

**Trade-offs:**

- No `site.yaml` means less control (auto-discovery only)
- Need to create `site.yaml` in the folder for customization
- Requires kitfly installed

## Comparison Table

| Factor           | Clone & Customize | CLI Init     | Point at Folder |
| ---------------- | ----------------- | ------------ | --------------- |
| Setup time       | ~1 min            | ~30 sec      | Instant         |
| Files in repo    | Many              | Few          | None added      |
| Customization    | Full              | Config only  | Config only     |
| Requires install | Bun               | Kitfly CLI   | Kitfly CLI      |
| Updates          | Manual merge      | CLI upgrade  | CLI upgrade     |
| Best for         | Power users       | New projects | Existing docs   |

## Migrating Between Approaches

### From Clone to Point-at-Folder

If you started with the template but want to separate your docs:

1. Copy your `content/` folder to a new location
2. Copy `site.yaml` alongside it
3. Run `kitfly dev ./new-location`

### From Point-at-Folder to A Dedicated Site Root

If you want a clean top-level folder for publishing:

1. Run `kitfly init my-new-site`
2. Copy your docs into `my-new-site/content/`
3. Run `kitfly dev my-new-site`

### From Point-at-Folder to Init

If you want more structure:

1. Run `kitfly init my-new-docs`
2. Copy your markdown into `content/`
3. Configure `site.yaml`

### From Init to Clone

If you need to customize the rendering:

1. Clone the full template
2. Copy your `content/` folder over
3. Preserve your `site.yaml` customizations

## The docroot Concept

Regardless of approach, the `docroot` setting (in `site.yaml`) controls what gets rendered:

```yaml
docroot: "content"  # Only content/ goes in dist/
docroot: "docs"     # Only docs/ goes in dist/
docroot: "."        # Everything in current dir goes in dist/
```

This is how kitfly separates your documentation from other files in your repo. The machinery (`src/`, `scripts/`, `README.md`, etc.) never appears in your built site unless you explicitly configure it.
