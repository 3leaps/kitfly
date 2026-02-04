---
title: Servicebook Template
description: Professional services catalog with offerings, methodology, and delivery documentation
---

# Servicebook Template

The `servicebook` template creates a documentation site for **professional services practices** — what you sell, how you deliver, and proof of capability. It extends `minimal` with six sections organized around service offerings, delivery methodology, and engagement operations.

## When to Use

- Consulting practices documenting their service portfolio
- Professional services teams standardizing delivery methodology
- Technical assessment or advisory services needing consistent scoping
- Organizations building a body of case studies and industry expertise
- Any situation where the deliverable is expertise, not a product

## What You Get

Everything from `minimal`, plus:

```
my-servicebook/
├── site.yaml              # Configured with 6 sections
├── index.md               # Home page with service catalog summary
├── CUSTOMIZING.md         # How to customize (AI + human friendly)
├── content/
│   ├── offerings/
│   │   ├── overview.md            # Service tiers, engagement models
│   │   └── assess/
│   │       ├── overview.md        # Example: assessment service
│   │       ├── deliverables.md    # What the client receives
│   │       └── scoping.md         # How we scope an engagement
│   ├── methodology/
│   │   ├── phases.md              # Explore → Analyze → Synthesize → Deliver
│   │   ├── tools.md               # Tools used in delivery
│   │   ├── frameworks.md          # Assessment frameworks, scoring models
│   │   └── decisions/
│   │       ├── index.md           # Methodology decision log
│   │       └── mdr-template.md    # Decision record template
│   ├── delivery/
│   │   ├── engagement-lifecycle.md  # End-to-end engagement flow
│   │   ├── client-onboarding.md     # Prerequisites, setup, kickoff
│   │   ├── quality-gates.md         # Checkpoints throughout delivery
│   │   └── templates/
│   │       └── index.md             # Deliverable templates and report shells
│   ├── verticals/
│   │   └── overview.md             # How to document industry context
│   ├── case-studies/
│   │   └── index.md               # Case study catalog with template
│   └── reference/
│       ├── team-expertise.md      # Capabilities, specializations
│       ├── pricing-models.md      # Engagement pricing structures
│       └── contacts/
│           └── directory.md       # Team contacts, escalation
└── ...
```

## Sections

| Section | Purpose | Typical Content |
|---------|---------|-----------------|
| **Offerings** | What we deliver | Service tiers, engagement models, deliverables, scoping |
| **Methodology** | How we do it | Phases, tools, frameworks, methodology decisions |
| **Delivery** | Engagement operations | Lifecycle, onboarding, quality gates, templates |
| **Verticals** | Industry context | Regulations, terminology, common challenges per vertical |
| **Case Studies** | Proof of capability | Past engagements (anonymized), outcomes, lessons learned |
| **Reference** | Look-up material | Team expertise, pricing models, contacts |

## The Methodology Section

This is what makes servicebook different. It captures **how your practice delivers value** — not just what you sell.

For a technical assessment practice, this might hold:
- **Phases**: Explore (stakeholder interviews) → Analyze (gap analysis) → Synthesize (recommendations) → Deliver (presentation)
- **Tools**: Interview frameworks, scoring rubrics, analysis templates
- **Frameworks**: Maturity models, SWOT analysis, weighted scoring for vendor evaluation
- **Decisions**: Why we switched from 3-phase to 4-phase methodology (MDR-001)

For a management consulting practice:
- **Phases**: Current State → Target State → Gap Analysis → Roadmap
- **Tools**: Workshop facilitation tools, benchmarking databases, financial modeling
- **Frameworks**: Operating model canvas, capability mapping, value stream analysis
- **Decisions**: Why we standardized on a specific assessment framework

The methodology section turns "how we work" from oral tradition into documented, repeatable process.

## Usage

```bash
kitfly init consulting-docs --template servicebook
kitfly init consulting-docs --template servicebook --brand "Apex Advisory"

# With AI assistance instrumentation
kitfly init consulting-docs --template servicebook --standalone --ai-assist
```

## Servicebook vs. Other Templates

| Aspect | Productbook | Servicebook | Handbook |
|--------|------------|-------------|---------|
| **Orientation** | What we build | What we sell & deliver | How we work |
| **Assumes** | One product, iterated | Multiple service offerings | Team exists |
| **Key section** | Domain | Methodology | Guides |
| **Audience** | Product team + stakeholders | Delivery team + clients | Team members |
| **Tone** | Analytical | Professional, prescriptive | Explanatory |
| **Lifecycle** | Product releases | Engagement lifecycle | Knowledge updates |

## Growing Your Servicebook

As the practice matures, the sections grow naturally:

**Offerings expand as services are defined** — each service gets its own folder with overview, deliverables, and scoping:
```
content/offerings/
├── overview.md
├── assess/
│   ├── overview.md
│   ├── deliverables.md
│   └── scoping.md
├── advisory/
│   ├── overview.md
│   └── engagement-models.md
└── implement/
    ├── overview.md
    ├── deliverables.md
    └── scoping.md
```

**Verticals deepen with experience** — each industry vertical captures specialized knowledge:
```
content/verticals/
├── overview.md
├── healthcare.md
├── financial-services.md
└── manufacturing.md
```

**Case studies accumulate** — the portfolio of evidence grows with each completed engagement.

**Methodology evolves through decisions** — the MDR log tracks why the practice changed its approach.

## Example Use Cases

**Technical Assessment Practice**
- Offerings: Security assessment, architecture review, cloud readiness evaluation
- Methodology: Discovery interviews, tooling analysis, gap scoring, recommendations
- Delivery: 2-4 week fixed-scope engagements with standardized quality gates
- Verticals: Healthcare (HIPAA), finance (SOC 2), government (FedRAMP)
- Case Studies: Anonymized assessment outcomes with measurable improvements

**Management Consulting Practice**
- Offerings: Strategy advisory, operating model design, transformation planning
- Methodology: Current-state analysis, target operating model, roadmap development
- Delivery: Retainer-based advisory with milestone-based transformation work
- Verticals: Retail, energy, telecommunications
- Case Studies: Transformation outcomes, efficiency gains, capability maturation
