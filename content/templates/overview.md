---
title: Templates Overview
description: How kitfly templates work and the layering model
---

# Templates

Templates provide starting points for new kitfly sites. Each template creates a folder structure, configuration, and starter content appropriate for a specific use case.

## The Layering Model

Templates follow a simple inheritance pattern:

```
minimal (base)
   ├── handbook    (team documentation)
   ├── runbook     (operational procedures)
   ├── pipeline    (data pipeline operations)
   ├── productbook (product & domain knowledge)
   ├── servicebook (professional services catalog)
   └── crucible    (information architecture SSOT)
```

Every template **extends `minimal`**, which provides the essential files every site needs. Specialized templates add sections and starter content on top.

## What Templates Create

When you run `kitfly init`, the template generates:

| Component | Source | Purpose |
|-----------|--------|---------|
| `site.yaml` | Template | Site configuration with sections defined |
| `index.md` | Template | Home page with navigation to sections |
| `content/` | Template | Folder structure with starter files |
| `.gitignore` | `minimal` | Standard ignores for builds, deps, OS files |
| `README.md` | `minimal` | Project readme with dev commands |
| `CUSTOMIZING.md` | Specialized templates | How to customize (AI + human friendly) |
| `assets/brand/` | `minimal` | Placeholder for logo, favicon |

### The Customizing Guide

Specialized templates include `CUSTOMIZING.md` — an onboarding document that helps both humans and AI assistants understand:

- **Structure**: What each section is for, naming conventions
- **Adding content**: Where to put new files, how to create sections
- **Linking**: How to cross-reference within the site
- **Limitations**: Content must live in the site folder; external files linked via URL

### Provenance Record

Every generated site includes provenance metadata (in `CUSTOMIZING.md` header):

```yaml
---
template: runbook
template_version: 1
created: 2026-02-04
kitfly_version: 0.1.0
---
```

This tracks:
- **template**: Which template was used
- **template_version**: Version of that template's structure
- **created**: When the site was initialized
- **kitfly_version**: Kitfly version at creation time

Provenance helps when upgrading sites or understanding what conventions were in place at creation time.

## The `.kitfly/` Metadata Folder

Sites can have a `.kitfly/` folder for kitfly-specific metadata (gitignored by default).

### All Sites: `manifest.json`

Every site gets a manifest tracking creation metadata:

```json
{
  "template": "runbook",
  "templateVersion": 1,
  "created": "2026-02-04T14:30:00Z",
  "kitflyVersion": "0.1.0",
  "standalone": false
}
```

### Standalone Sites: `provenance.json`

Standalone sites additionally track copied files with SHA256 hashes:

```json
{
  "kitflyVersion": "0.1.0",
  "createdAt": "2026-02-04T14:30:00Z",
  "template": "runbook",
  "files": [
    { "path": "scripts/dev.ts", "sourceHash": "a1b2c3..." },
    { "path": "src/engine.ts", "sourceHash": "d4e5f6..." }
  ]
}
```

**Why hashes?** For future `kitfly update` support:
- Compare hashes to detect user modifications
- Safely update unmodified files
- Warn before overwriting customized code
- Track version gaps that need bridging

### Future: `updates.json`

When `kitfly update` ships (v0.2.x), we'll track update history:

```json
{
  "updates": [
    {
      "date": "2026-03-15T10:00:00Z",
      "fromVersion": "0.1.0",
      "toVersion": "0.2.0",
      "filesUpdated": ["scripts/dev.ts", "src/theme.ts"],
      "filesSkipped": ["scripts/build.ts"]
    }
  ]
}
```

This enables rollback awareness and audit trails for managed sites.

## Choosing a Template

| Template | Best For | Sections |
|----------|----------|----------|
| `minimal` | Custom structures, experimentation | None predefined — you define your own |
| `handbook` | Team docs, onboarding, knowledge bases | Overview, Guides, Reference |
| `runbook` | Operations, procedures, incidents | Procedures, Troubleshooting, Reference, Incidents |
| `pipeline` | Data pipeline operations | Pipeline, Sources, Destinations, Operations, Troubleshooting, Reference |
| `productbook` | Product + domain docs for complex engagements | Product, Domain, Planning, Operations, Guides, Reference |
| `servicebook` | Professional services, consulting catalogs | Offerings, Methodology, Delivery, Verticals, Case Studies, Reference |
| `crucible` | Information architecture SSOT, ecosystem standards | Specs, Schemas, Config, Policies, Guides, Reference |

## Usage

```bash
# Create with default template (minimal)
kitfly init my-site

# Create with specific template
kitfly init my-docs --template handbook

# Add branding
kitfly init my-docs --template handbook --brand "Acme Corp"

# Create standalone (includes kitfly site code)
kitfly init my-docs --template handbook --standalone

# Add AI assistance instrumentation
kitfly init my-docs --template runbook --ai-assist

# Skip git initialization
kitfly init my-docs --template handbook --no-git
```

## Lifecycle Operations

Kitfly focuses on **creation** only:

| Operation | Support | Notes |
|-----------|---------|-------|
| Create | `kitfly init` | Full template system |
| Read | `kitfly dev` | Preview any markdown folder |
| Update | `kitfly update` | Planned for v0.2.x |
| Delete | Not supported | Use `rm -rf` - sites are just folders |

**Why no delete?** Sites are self-contained folders with no external references. Deleting is simply removing the folder. There's no registry or metadata outside the site to clean up.

## Template Details

- [Minimal](minimal) — The base layer every site inherits
- [Handbook](handbook) — Team documentation structure
- [Runbook](runbook) — Operational procedures and checklists
- [Pipeline](pipeline) — Data pipeline stages, sources, and destinations
- [Productbook](productbook) — Product and domain knowledge for greenfield engagements
- [Servicebook](servicebook) — Professional services catalog with methodology and delivery
- [Crucible](crucible) — Information architecture SSOT with specs, schemas, and governance
