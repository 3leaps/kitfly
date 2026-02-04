# Kitfly - AI Agent Guide

## Read First

**Kitfly is minimal by design.** Before making any changes, internalize this:

> One dependency. ~500 lines of core code. Understand in an afternoon.

If a feature can't be implemented in 20-50 lines, it probably doesn't belong here.

See [Kitfly Overview](content/guide/kitfly-overview.md) for the full product vision and [ADR-0001](docs/decisions/ADR-0001-minimalist-site-code.md) for the minimalist philosophy.

## Brand Identity

**Name:** Kitfly = Kit + Fly

- **Kit**: Your handbook, runbook, notebook - a collection of docs
- **Fly**: Fast, instant, launching to the web

**Tagline:** "Turn your writing into a website."
**Voice:** "Pack your docs. Watch them fly."

**Brand Attributes:**
| Attribute | Expression |
|-----------|------------|
| Speed | Instant rendering, hot reload |
| Simplicity | No config required, one dependency |
| Independence | No SaaS, you own your files |
| Professional | Clean output, works offline |
| Approachable | Not intimidating, friendly |

## Philosophy

From the product brief:

> **Rule of thumb**: If it can be done with CSS, vanilla JS under 50 lines, or a marked plugin, it stays minimal.

Kitfly is intentionally limited. When users outgrow it, they migrate - their content is just markdown.

### What We Are

- Markdown folder → shareable HTML
- Single dependency (`marked`)
- Template you clone OR CLI you run
- Offline-first, works without internet
- Easy to understand, easy to customize

### What We Are NOT

- A component library
- A build pipeline to learn
- A SaaS product
- Docusaurus, Hugo, or VitePress (use those if you need their power)

## Dual Delivery Model

**Job 1: Review ("Send it")**
- Single HTML file or small bundle
- Email attachment, Slack upload, shared drive
- Competes with: PDF, Google Docs link

**Job 2: Publish ("Host it")**
- Static site deployed anywhere
- GitHub Pages, Netlify, S3
- Competes with: Obsidian Publish, GitBook

## Product Phases

| Phase | Version | Status | Description |
|-------|---------|--------|-------------|
| CLI + Init | v0.1.x | **NOW** | `kitfly init` creates standalone sites |
| Update command | v0.2.x | Next | `kitfly update` upgrades site code |
| Binary | v0.3.x | Future | Single executable, no runtime |

## Architecture

Kitfly has two parts: **CLI code** (the tool) and **site code** (what users get).

```
kitfly/
├── src/
│   ├── cli.ts              # CLI entry (NOT copied to users)
│   ├── commands/           # init, update (NOT copied)
│   ├── engine.ts           # Path utilities (copied)
│   ├── theme.ts            # Theme loading (copied)
│   └── site/
│       ├── template.html   # HTML template (copied)
│       └── styles.css      # Styles (copied)
├── scripts/
│   ├── dev.ts              # Dev server (copied)
│   ├── build.ts            # Static build (copied)
│   └── bundle.ts           # Single-file bundle (copied)
├── schemas/                # JSON schemas (copied)
├── content/                # Kitfly's own docs (NOT copied)
├── docs/                   # Repo docs, ADRs (NOT copied)
├── .plans/                 # Planning (gitignored)
├── site.yaml               # Site configuration
└── VERSION                 # Semantic version
```

**Site code** (~500 lines target) is what `kitfly init` copies. It must stay minimal.
**CLI code** can grow thoughtfully (more commands, smarter updates).

## Quick Reference

| Task | Command |
|------|---------|
| Dev server | `make dev` or `bun run dev` |
| Build static | `make build` or `bun run build` |
| Format files | `make fmt` |
| Clean dist/ | `make clean` |
| CLI directly | `bun run src/cli.ts <command>` |

## Roles

See `config/agentic/roles/README.md` for the full role catalog.

### Development & Engineering
| Role | Focus | Use When |
|------|-------|----------|
| `devlead` | Implementation, architecture | Building features, fixing bugs |
| `devrev` | Code review, bug finding | Reviewing code changes |
| `qa` | Testing, quality gates | Test design, coverage analysis |
| `secrev` | Security analysis | Security-sensitive review |
| `releng` | Releases, CI/CD | Version bumps, changelogs, releases |
| `uxdev` | UI/UX design | Frontend, templates, styles |

### Documentation & Content
| Role | Focus | Use When |
|------|-------|----------|
| `infoarch` | Documentation structure | Site organization, schemas |
| `prodmktg` | Brand, content, positioning | README, messaging, personas |
| `datavis` | Charts, dashboards | Data visualization, Mermaid diagrams |

### Governance & Coordination
| Role | Focus | Use When |
|------|-------|----------|
| `deliverylead` | Project lifecycle, delivery timelines | Sprint planning, release coordination |

### Strategy & Consulting
| Role | Focus | Use When |
|------|-------|----------|
| `advisor` | Strategic guidance | Stakeholder engagement |
| `analyst` | Research, assessment | Competitive analysis, due diligence |
| `architect` | System design | ADRs, technical decisions |
| `prodstrat` | Product strategy | Roadmaps, prioritization |

**Default to `devlead`** for most implementation work.

## Session Protocol

### Before Starting

1. **Read this file** - Understand the minimal ethos
2. **Check `.plans/`** - Review product-brief.md and any active plans
3. **Run `make dev`** - See the current state
4. **Understand the constraint**: One dependency, ~500 lines target

### Before Committing

1. **Run `make fmt`** - Format all files
2. **Run `make build`** - Verify build works
3. **Test manually** - `make dev` and check the output
4. **Use proper attribution** - See below

## Commit Attribution

```
<type>(<scope>): <subject>

<body - what and why>

Generated by <Model> via <Interface> under supervision of @3leapsdave

Co-Authored-By: <Model> <noreply@3leaps.net>
Role: <role>
Committer-of-Record: Dave Thompson <dave.thompson@3leaps.net> [@3leapsdave]
```

**Example:**

```
feat(cli): add --port flag to dev command

Allow users to specify custom port for dev server instead of
hardcoded 3333.

Generated by Claude Opus 4.5 via Claude Code under supervision of @3leapsdave

Co-Authored-By: Claude Opus 4.5 <noreply@3leaps.net>
Role: devlead
Committer-of-Record: Dave Thompson <dave.thompson@3leaps.net> [@3leapsdave]
```

## Guidelines

### DO

- **Stay minimal in site code** - Question every addition to scripts/, src/site/, src/engine.ts, src/theme.ts
- **Use `marked`** - It's the only dependency in site code
- **Keep CLI simple** - dev, build, bundle, init, update, version, help
- **Test manually** - This isn't a test-heavy project
- **Think "user owns it"** - Site code is copied and becomes theirs
- **Preserve portability** - Output should work offline

### DO NOT

- **Add dependencies to site code** - Unless absolutely unavoidable with justification
- **Over-engineer** - No abstractions for one-time operations
- **Add build complexity** - No webpack, no vite, no bundlers
- **Create SaaS features** - No auth, no analytics, no tracking
- **Break the ~500 line target** - For site code (scripts/ + src/site/ + src/theme.ts + src/engine.ts)
- **Commit `.plans/`** - Planning directory is permanently gitignored

## Target Personas

| Persona | Pain Point | Kitfly Solution |
|---------|------------|-----------------|
| Data scientist | Jupyter isn't for sharing | Narrative alongside notebooks |
| Product manager | Confluence is slow | Own it, professional, shareable |
| DevSecOps | Wikis are ugly | Versioned, auditable, offline |
| Developer | Tired of build tooling | Just render markdown |
| Student | LaTeX is hard | Portfolio-ready, no design skills |

## Key Decisions

1. **TypeScript with Bun** - Don't rewrite working code
2. **Template → CLI → Binary** - Progressive capability
3. **kitfly.app** - Primary domain (available)
4. **MIT License** - Open and permissive
5. **CDN for extras** - Mermaid, Prism.js loaded from CDN, not bundled

## Brand Assets

Brand study and logo concepts in `.plans/brand/`:
- `kitfly-brand-study.md` - Full brand analysis
- `images/kitfly_brand-mark_03.png` - Selected logo direction (needs sizing)

## Contact

- **Maintainer**: @3leapsdave
- **Repository**: https://github.com/3leaps/kitfly
- **Organization**: https://3leaps.net

---

*Pack your docs. Watch them fly.*
