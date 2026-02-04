# Role Catalog

Baseline role prompts for AI agent sessions. Kitfly ships with a curated set of roles for documentation, development, and consulting workflows.

Schema (upstream): `https://schemas.3leaps.dev/agentic/v0/role-prompt.schema.json` (optional)

## Available Roles

### Development & Engineering

| Role | Slug | Category | Purpose |
| --- | --- | --- | --- |
| Development Lead | `devlead` | agentic | Implementation, architecture, and code quality |
| Development Reviewer | `devrev` | review | Code review, bug finding, four-eyes audit |
| Quality Assurance | `qa` | review | Testing, validation, quality gates |
| Security Review | `secrev` | review | Security analysis, vulnerability assessment |
| Release Engineering | `releng` | automation | Version management, releases, CI/CD validation |
| UX Developer | `uxdev` | agentic | UI/UX for web and terminal interfaces |

### Governance & Coordination

| Role | Slug | Category | Purpose |
| --- | --- | --- | --- |
| Delivery Lead | `deliverylead` | governance | Project lifecycle, sprint coordination, delivery timelines |

### Documentation & Content

| Role | Slug | Category | Purpose |
| --- | --- | --- | --- |
| Information Architect | `infoarch` | agentic | Docs, schemas, and information structure |
| Product Marketing | `prodmktg` | marketing | Messaging, positioning, personas |
| Data Visualization | `datavis` | consulting | Charts, dashboards, visual storytelling |

### Strategy & Consulting

| Role | Slug | Category | Purpose |
| --- | --- | --- | --- |
| Strategic Advisor | `advisor` | consulting | Strategic guidance and stakeholder engagement |
| Research Analyst | `analyst` | consulting | Research, assessment, due diligence |
| Technical Architect | `architect` | consulting | System design and technical decisions |
| Product Strategist | `prodstrat` | consulting | Product strategy, roadmaps, prioritization |

## Usage

Reference roles by slug in `AGENTS.md` (or session tooling):

```yaml
roles:
  - slug: devlead
    source: config/agentic/roles/devlead.yaml
  - slug: infoarch
    source: config/agentic/roles/infoarch.yaml
```

## Role Selection Guide

| Task | Recommended Role |
| --- | --- |
| Building features, fixing bugs | `devlead` |
| Reviewing code changes | `devrev` |
| Writing/organizing documentation | `infoarch` |
| Security-sensitive code review | `secrev` |
| Preparing releases, changelogs | `releng` |
| Creating diagrams and charts | `datavis` |
| Competitive analysis, research | `analyst` |
| System design, ADRs | `architect` |
| Product roadmap decisions | `prodstrat` |
| UI/frontend work | `uxdev` |
| Sprint planning, delivery coordination | `deliverylead` |
