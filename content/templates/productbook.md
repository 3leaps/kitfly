---
title: Productbook Template
description: Product and domain documentation for complex greenfield engagements
---

# Productbook Template

The `productbook` template creates a documentation site that captures both **product definition** and **business domain knowledge**. It extends `minimal` with six sections designed for greenfield engagements where the product operates in a complex business domain.

## When to Use

- Greenfield product development in complex business domains
- Client engagements that need to capture domain expertise alongside product specs
- Products with regulatory, industry, or process complexity
- Projects where the team needs a shared reference for "how this business works"
- Any situation where product decisions depend on deep domain understanding

## What You Get

Everything from `minimal`, plus:

```
my-productbook/
├── site.yaml              # Configured with 6 sections
├── index.md               # Home page with product status and quick links
├── CUSTOMIZING.md         # How to customize (AI + human friendly)
├── content/
│   ├── product/
│   │   ├── overview.md            # Vision, users, capabilities
│   │   ├── features/
│   │   │   └── index.md           # Feature catalog
│   │   └── releases/
│   │       └── index.md           # Release log
│   ├── domain/
│   │   ├── overview.md            # Business domain context
│   │   ├── processes/
│   │   │   └── index.md           # Business process catalog
│   │   ├── data-dictionary.md     # Terms and definitions
│   │   └── industry-notes.md      # Regulations and standards
│   ├── planning/
│   │   ├── roadmap.md             # Phases and priorities
│   │   ├── decisions/
│   │   │   ├── index.md           # Decision log (ADR pattern)
│   │   │   └── adr-template.md    # ADR template
│   │   ├── specs/
│   │   │   └── index.md           # Specification index
│   │   └── research/
│   │       └── index.md           # Research index
│   ├── operations/
│   │   ├── environments.md        # Dev, staging, production
│   │   └── deployment.md          # Deployment procedures
│   ├── guides/
│   │   ├── getting-started.md     # Onboarding guide
│   │   └── user-guide.md          # End-user documentation
│   └── reference/
│       ├── architecture/
│       │   └── overview.md        # System architecture
│       ├── integrations/
│       │   └── index.md           # Integration catalog
│       ├── data-models/
│       │   └── overview.md        # Schemas and data flow
│       ├── contacts/
│       │   └── directory.md       # Team and vendor contacts
│       └── metrics/
│           └── overview.md        # KPIs and dashboards
└── ...
```

## Sections

| Section | Purpose | Typical Content |
|---------|---------|-----------------|
| **Product** | What we're building | Vision, features, releases, acceptance criteria |
| **Domain** | The business reality | Processes, terminology, data dictionary, industry context |
| **Planning** | Why and when | Roadmap, ADRs, specifications, research |
| **Operations** | How we run it | Environments, deployment, configuration |
| **Guides** | How to use it | Onboarding, tutorials, user documentation |
| **Reference** | Look-up material | Architecture, integrations, data models, contacts, metrics |

## The Domain Section

This is what makes productbook different from every other template. It captures the **complex business reality** that the product operates in.

For a propane delivery company, this might hold:
- **Processes**: Tank monitoring workflow, delivery scheduling, seasonal demand forecasting
- **Data Dictionary**: What "will-call" vs "automatic" delivery means, ERP entity definitions
- **Industry Notes**: DOT regulations for hazmat transport, state-level propane licensing

For a healthcare platform:
- **Processes**: Claims adjudication, prior authorization, formulary management
- **Data Dictionary**: CPT codes, NDC numbers, explanation of benefits
- **Industry Notes**: HIPAA requirements, CMS guidelines, state insurance mandates

This section is the "context dump" that every new team member and AI agent needs. It turns tribal knowledge into navigable documentation.

## Planning Artifacts

The planning section includes built-in support for common planning patterns:

**Decision Records (ADRs)** — each decision documented with:
- Context: What prompted this decision
- Options: What we considered
- Decision: What we chose and why
- Consequences: What follows from this choice

**Specifications** — feature specs with:
- Problem statement
- Proposed solution
- Acceptance criteria
- Status tracking

**Research** — structured research outputs:
- Market analysis
- User research findings
- Technology assessments

The sidebar organizes these into collapsible groups — decisions, specs, and research each appear as expandable subsections under Planning.

## Usage

```bash
kitfly init client-docs --template productbook
kitfly init client-docs --template productbook --brand "Project Atlas"

# With AI assistance instrumentation
kitfly init client-docs --template productbook --standalone --ai-assist
```

## Productbook vs. Other Templates

| Aspect | Handbook | Runbook | Productbook |
|--------|----------|---------|-------------|
| **Orientation** | How we work | How we keep it running | What we're building and why |
| **Assumes** | Team exists | System exists | Starting from scratch |
| **Key section** | Guides | Procedures | Domain |
| **Audience** | Team members | Operators | Product team + stakeholders |
| **Tone** | Explanatory | Imperative | Analytical |

## Growing Your Productbook

As the engagement matures, the sections grow naturally:

**Domain deepens first** — business process docs accumulate as the team learns the domain:
```
content/domain/processes/
├── index.md
├── order-fulfillment.md
├── returns-processing.md
├── inventory-reconciliation.md
└── seasonal-forecasting.md
```

**Product fills in as features ship** — feature pages link to the domain processes they automate:
```
content/product/features/
├── index.md
├── auto-scheduling.md      # References domain/processes/delivery-scheduling
├── tank-monitoring.md       # References domain/processes/tank-monitoring
└── customer-portal.md
```

**Planning captures decisions over time** — the ADR log becomes a valuable historical record.

## Example Use Cases

**Enterprise SaaS for Complex Industry**
- Product: Platform features, integrations, user workflows
- Domain: Industry processes, regulatory requirements, competitive context
- Planning: Roadmap, ADRs for technology and vendor choices
- Guides: Customer onboarding, admin guides
- Reference: API architecture, third-party integrations, data models

**Client Engagement with Legacy System Modernization**
- Product: New platform capabilities replacing legacy functions
- Domain: Existing business processes, data structures, edge cases the legacy handles
- Planning: Migration specs, cutover decisions, research on replacement options
- Operations: Parallel-run environments, migration deployment procedures
- Reference: Legacy system documentation, data mapping, vendor contacts
