---
title: Handbook Template
description: Team documentation with overview, guides, and reference sections
---

# Handbook Template

The `handbook` template creates a structured documentation site for teams. It extends `minimal` with three predefined sections.

## When to Use

- Team onboarding documentation
- Internal knowledge bases
- Product documentation
- Developer handbooks
- Any docs that explain "what" and "how"

## What You Get

Everything from `minimal`, plus:

```
my-handbook/
├── site.yaml              # Configured with sections
├── index.md               # Home page linking to sections
├── CUSTOMIZING.md         # How to customize this site (AI + human friendly)
├── content/
│   ├── overview/
│   │   └── introduction.md    # High-level concepts
│   ├── guides/
│   │   └── getting-started.md # Step-by-step tutorials
│   └── reference/
│       └── glossary.md        # Terminology and definitions
└── ...
```

## Sections

| Section | Purpose | Typical Content |
|---------|---------|-----------------|
| **Overview** | Big picture, concepts | Architecture, key decisions, principles |
| **Guides** | How to do things | Tutorials, walkthroughs, recipes |
| **Reference** | Look-up information | API docs, glossaries, specifications |

This follows the [Diátaxis](https://diataxis.fr/) documentation framework's distinction between explanation (Overview), how-to guides (Guides), and reference material (Reference).

## Usage

```bash
kitfly init team-docs --template handbook
kitfly init team-docs --template handbook --brand "Engineering"
```

## Customization

After creation, you can:

- **Add sections**: Edit `site.yaml` to add more sections
- **Rename sections**: Change the `name` field in `site.yaml`
- **Restructure**: Move folders and update paths in `site.yaml`
- **Add files**: Create new `.md` files in any section folder

The starter files are placeholders with `<!-- ← CUSTOMIZE -->` comments showing where to add your content.

## Example Use Cases

**Engineering Handbook**
- Overview: Team principles, tech stack decisions
- Guides: Development setup, deployment process, code review
- Reference: API contracts, environment variables, tooling

**Product Documentation**
- Overview: Product vision, target users
- Guides: Getting started, common workflows
- Reference: Feature specs, integration docs

**Onboarding Docs**
- Overview: Company culture, team structure
- Guides: First week checklist, tool setup
- Reference: Glossary, org chart, contacts
