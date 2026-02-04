/**
 * Servicebook Template
 *
 * Extends minimal with structured sections for professional services documentation.
 * Designed for consulting practices, technical assessments, and service delivery.
 * Sections: Offerings, Methodology, Delivery, Verticals, Case Studies, Reference
 */

import type { TemplateContext, TemplateDef } from "./schema.ts";

export const servicebook: TemplateDef = {
	id: "servicebook",
	name: "Servicebook",
	description:
		"Professional services catalog with offerings, methodology, and delivery documentation",
	version: 1,
	extends: "minimal",
	sections: [
		{
			name: "Offerings",
			path: "content/offerings",
			description: "Service tiers, engagement models, per-service deliverables and scoping",
		},
		{
			name: "Methodology",
			path: "content/methodology",
			description: "Phases, tools, frameworks, and decisions (ADRs)",
		},
		{
			name: "Delivery",
			path: "content/delivery",
			description: "Engagement lifecycle, onboarding, quality gates, deliverable templates",
		},
		{
			name: "Verticals",
			path: "content/verticals",
			description: "Industry context — client domains, regulations, competitive landscape",
		},
		{
			name: "Case Studies",
			path: "content/case-studies",
			description: "Past engagements, anonymized — proof of capability",
		},
		{
			name: "Reference",
			path: "content/reference",
			description: "Team expertise, pricing models, contacts",
		},
	],
	files: [
		{
			path: "site.yaml",
			content: (ctx: TemplateContext) => `# ${ctx.branding.siteName} - Site Configuration
# Documentation: https://github.com/3leaps/kitfly

title: "${ctx.branding.siteName}"

# \u2190 CUSTOMIZE: Your brand settings
brand:
  name: "${ctx.branding.brandName}"
  url: "${ctx.branding.brandUrl}"
  # external: false  # Set true if brand URL is external

# Content sections
sections:
  - name: "Offerings"
    path: "content/offerings"
  - name: "Methodology"
    path: "content/methodology"
  - name: "Delivery"
    path: "content/delivery"
  - name: "Verticals"
    path: "content/verticals"
  - name: "Case Studies"
    path: "content/case-studies"
  - name: "Reference"
    path: "content/reference"

# Home page
home: "index.md"
`,
		},
		{
			path: "index.md",
			content: (ctx: TemplateContext) => `---
title: Home
description: ${ctx.branding.siteName} - Professional Services Catalog
---

# ${ctx.branding.siteName}

Professional services catalog and delivery documentation for ${ctx.branding.brandName}.

## Service Offerings

| Service | Engagement Model | Typical Duration | Status |
|---------|-----------------|------------------|--------|
| Assessment | Fixed-scope | 2\u20134 weeks | Active |
| Advisory | Retainer | Ongoing | Active |
| Implementation | Milestone-based | 8\u201316 weeks | Active |

## Quick Links

### [Service Catalog](/content/offerings/overview)
What we deliver \u2014 service tiers, engagement models, and scoping.

### [Our Methodology](/content/methodology/phases)
How we work \u2014 phases, tools, and frameworks.

### [Engagement Lifecycle](/content/delivery/engagement-lifecycle)
End-to-end delivery from kickoff to close-out.

### [Case Studies](/content/case-studies/)
Past engagements and proven results.

---

*Last updated: ${new Date().toISOString().split("T")[0]}*
`,
		},
		// ---------------------------------------------------------------
		// Offerings section
		// ---------------------------------------------------------------
		{
			path: "content/offerings/overview.md",
			content: (ctx: TemplateContext) => `---
title: Service Catalog
description: Service offerings for ${ctx.branding.brandName}
---

# Service Catalog

<!-- \u2190 CUSTOMIZE: Replace with your service offerings -->

## Service Tiers

| Tier | Description | Typical Client | Duration |
|------|-------------|----------------|----------|
| Assessment | Evaluate current state, identify gaps, recommend actions | New clients, scoping | 2\u20134 weeks |
| Advisory | Ongoing strategic guidance and decision support | Established clients | Retainer |
| Implementation | Hands-on delivery of solutions and capabilities | Clients with defined scope | 8\u201316 weeks |

## Engagement Models

### Fixed-Scope

Defined deliverables, timeline, and price. Best for assessments and well-defined projects.

### Time & Materials

Flexible scope with regular check-ins. Best for advisory and evolving requirements.

### Milestone-Based

Payments tied to deliverable acceptance. Best for implementation engagements.

## Pricing Approach

See [Pricing Models](/content/reference/pricing-models) for engagement pricing structures.

## Service Details

| Service | Details |
|---------|---------|
| [Assessment](/content/offerings/assess/overview) | Current-state evaluation with recommendations |

## Related

- [Methodology](/content/methodology/phases) \u2014 how we deliver
- [Delivery Lifecycle](/content/delivery/engagement-lifecycle) \u2014 engagement operations
- [Pricing Models](/content/reference/pricing-models) \u2014 commercial structures
`,
		},
		{
			path: "content/offerings/assess/overview.md",
			content: (_ctx: TemplateContext) => `---
title: Assessment Service
description: Current-state evaluation and recommendations
---

# Assessment Service

<!-- \u2190 CUSTOMIZE: Replace with your assessment service details -->

## What It Is

A structured evaluation of a client\u2019s current state against best practices, producing prioritized recommendations and a roadmap.

## Client Problem

<!-- What problem does this service solve for the client? -->

Clients need an objective, expert evaluation when:
- Starting a new initiative and unsure where to focus
- Existing approaches aren\u2019t delivering expected results
- Regulatory or market changes require reassessment

## Deliverables

| Deliverable | Format | Description |
|-------------|--------|-------------|
| Current-State Report | Document | Findings from discovery and analysis |
| Gap Analysis | Matrix | Current vs desired state with severity |
| Recommendations | Prioritized list | Actions ranked by impact and feasibility |
| Roadmap | Timeline | Phased implementation plan |

## Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| Discovery | Week 1 | Stakeholder interviews, data collection |
| Analysis | Week 2 | Gap analysis, benchmarking |
| Synthesis | Week 3 | Recommendations, roadmap development |
| Delivery | Week 4 | Report presentation, Q&A |

## Scoping

See [Assessment Scoping](/content/offerings/assess/scoping) for how we scope this engagement.

## Related

- [Deliverables](/content/offerings/assess/deliverables) \u2014 what the client receives
- [Scoping](/content/offerings/assess/scoping) \u2014 how we scope an engagement
- [Methodology Phases](/content/methodology/phases) \u2014 our delivery approach
`,
		},
		{
			path: "content/offerings/assess/deliverables.md",
			content: (_ctx: TemplateContext) => `---
title: Assessment Deliverables
description: What the client receives from an assessment engagement
---

# Assessment Deliverables

<!-- \u2190 CUSTOMIZE: Replace with your actual deliverable descriptions -->

## Current-State Report

A comprehensive document capturing findings from discovery:

- Executive summary (1\u20132 pages)
- Detailed findings organized by area
- Evidence and data supporting each finding
- Stakeholder interview summaries (anonymized)

## Gap Analysis

A structured comparison of current state vs desired state:

| Area | Current State | Desired State | Gap Severity | Notes |
|------|--------------|---------------|-------------|-------|
| <!-- area --> | <!-- description --> | <!-- target --> | High / Medium / Low | <!-- context --> |

## Recommendations

Prioritized actions ranked by:
- **Impact**: How much improvement this delivers
- **Feasibility**: How practical to implement
- **Dependencies**: What else must happen first

## Roadmap

Phased implementation plan showing:
- Quick wins (0\u201330 days)
- Medium-term initiatives (1\u20133 months)
- Strategic investments (3\u201312 months)

## Deliverable Templates

See [Deliverable Templates](/content/delivery/templates/) for report shells and formats.
`,
		},
		{
			path: "content/offerings/assess/scoping.md",
			content: (_ctx: TemplateContext) => `---
title: Assessment Scoping
description: How we scope an assessment engagement
---

# Assessment Scoping

<!-- \u2190 CUSTOMIZE: Replace with your scoping approach -->

## Scoping Criteria

| Factor | Questions | Impact on Scope |
|--------|-----------|----------------|
| Organization size | How many teams/departments? | Number of stakeholder interviews |
| Geographic spread | Single site or distributed? | Discovery logistics |
| Domain complexity | Regulated industry? Legacy systems? | Analysis depth |
| Prior assessments | Has this been evaluated before? | Baseline availability |
| Decision timeline | When do they need results? | Compression vs thoroughness |

## Scoping Process

### 1. Discovery Call

30\u201360 minute call to understand:
- Client context and goals
- Scope boundaries (what\u2019s in, what\u2019s out)
- Key stakeholders to interview
- Timeline constraints
- Budget parameters

### 2. Scope Document

Written scope including:
- Objectives and success criteria
- Areas included and excluded
- Number and type of interviews
- Deliverables and timeline
- Assumptions and dependencies

### 3. Client Approval

Scope document signed before engagement begins.

## Scope Variables

| Variable | Small | Medium | Large |
|----------|-------|--------|-------|
| Stakeholder interviews | 3\u20135 | 6\u201310 | 11\u201320 |
| Areas evaluated | 2\u20133 | 4\u20136 | 7\u201310 |
| Report pages | 15\u201325 | 30\u201350 | 60\u2013100 |
| Duration | 2 weeks | 3 weeks | 4\u20136 weeks |
`,
		},
		// ---------------------------------------------------------------
		// Methodology section
		// ---------------------------------------------------------------
		{
			path: "content/methodology/phases.md",
			content: (ctx: TemplateContext) => `---
title: Methodology Phases
description: Delivery methodology for ${ctx.branding.brandName}
---

# Methodology Phases

<!-- \u2190 CUSTOMIZE: Replace with your methodology -->

## Overview

Our delivery follows a structured methodology adapted to engagement type and client context.

## Phases

### 1. Explore

**Purpose**: Understand the client\u2019s current state, goals, and constraints.

| Input | Activities | Output |
|-------|-----------|--------|
| Client brief | Stakeholder interviews | Discovery findings |
| Existing documentation | Data collection | Stakeholder map |
| | Environment access | Current-state inventory |

### 2. Analyze

**Purpose**: Identify gaps, patterns, and opportunities.

| Input | Activities | Output |
|-------|-----------|--------|
| Discovery findings | Gap analysis | Gap matrix |
| Industry benchmarks | Pattern identification | Insight catalog |
| | Root cause analysis | Problem statements |

### 3. Synthesize

**Purpose**: Develop recommendations and a path forward.

| Input | Activities | Output |
|-------|-----------|--------|
| Gap matrix | Recommendation development | Prioritized recommendations |
| Insight catalog | Roadmap planning | Implementation roadmap |
| | Deliverable authoring | Final report |

### 4. Deliver

**Purpose**: Present findings, transfer knowledge, and support next steps.

| Input | Activities | Output |
|-------|-----------|--------|
| Final report | Presentation to stakeholders | Accepted deliverables |
| Roadmap | Q&A session | Client action plan |
| | Knowledge transfer | Handoff documentation |

## Phase Adaptation

Not every engagement uses every phase at the same depth:

| Engagement Type | Explore | Analyze | Synthesize | Deliver |
|----------------|---------|---------|-----------|---------|
| Assessment | Deep | Deep | Medium | Standard |
| Advisory | Light | Medium | Light | Ongoing |
| Implementation | Medium | Light | Light | Deep |

## Related

- [Tools](/content/methodology/tools) \u2014 tools used in delivery
- [Frameworks](/content/methodology/frameworks) \u2014 assessment and scoring models
- [Decisions](/content/methodology/decisions/) \u2014 methodology decision records
`,
		},
		{
			path: "content/methodology/tools.md",
			content: (_ctx: TemplateContext) => `---
title: Tools
description: Tools used in service delivery
---

# Tools

<!-- \u2190 CUSTOMIZE: Replace with your delivery tools -->

## Discovery Tools

| Tool | Purpose | When Used |
|------|---------|-----------|
| <!-- tool --> | <!-- capability --> | <!-- phase/context --> |

## Analysis Tools

| Tool | Purpose | When Used |
|------|---------|-----------|
| <!-- tool --> | <!-- capability --> | <!-- phase/context --> |

## Documentation Tools

| Tool | Purpose | When Used |
|------|---------|-----------|
| <!-- tool --> | <!-- capability --> | <!-- phase/context --> |

## Collaboration Tools

| Tool | Purpose | When Used |
|------|---------|-----------|
| <!-- tool --> | <!-- capability --> | <!-- phase/context --> |

## Tool Selection Criteria

When adding a new tool to the methodology:
1. Does it solve a real problem in delivery?
2. Can the team learn it quickly?
3. Does it work for the client\u2019s environment?
4. Is it maintainable long-term?
`,
		},
		{
			path: "content/methodology/frameworks.md",
			content: (_ctx: TemplateContext) => `---
title: Frameworks
description: Assessment frameworks and scoring models
---

# Frameworks

<!-- \u2190 CUSTOMIZE: Replace with your assessment frameworks -->

## Maturity Model

Use maturity models to assess client capabilities across dimensions.

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Initial | Ad hoc, undocumented, person-dependent |
| 2 | Developing | Some documentation, inconsistent execution |
| 3 | Defined | Documented processes, consistent execution |
| 4 | Managed | Measured, controlled, data-driven improvement |
| 5 | Optimized | Continuous improvement, industry-leading |

## Scoring Template

| Dimension | Current Level | Target Level | Gap | Priority |
|-----------|--------------|-------------|-----|----------|
| <!-- dimension --> | <!-- 1\u20135 --> | <!-- 1\u20135 --> | <!-- delta --> | High / Medium / Low |

## Framework Selection

| Framework | Best For | Limitations |
|-----------|---------|-------------|
| Maturity Model | Capability assessment | Can oversimplify |
| SWOT | Strategic context | Subjective |
| Risk Matrix | Risk assessment | Requires calibration |
| Weighted Scoring | Vendor evaluation | Criteria selection bias |

## Custom Frameworks

Document engagement-specific frameworks in the relevant [Case Study](/content/case-studies/).
`,
		},
		{
			path: "content/methodology/decisions/index.md",
			content: (_ctx: TemplateContext) => `---
title: Methodology Decisions
description: Decision records for methodology and delivery approach
---

# Methodology Decisions

<!-- \u2190 CUSTOMIZE: Record decisions about how you deliver services -->

| ID | Decision | Date | Status |
|----|----------|------|--------|
| MDR-001 | <!-- decision title --> | <!-- date --> | Proposed / Accepted / Superseded |

## When to Record a Decision

A methodology decision is worth recording when:
- It changes how we deliver services
- It affects client experience or deliverable quality
- Multiple valid approaches were considered
- Future team members will ask \u201cwhy do we do it this way?\u201d

## Using the Template

Use the [MDR Template](./mdr-template) for each decision.
`,
		},
		{
			path: "content/methodology/decisions/mdr-template.md",
			content: (_ctx: TemplateContext) => `---
title: "MDR-000: Decision Template"
description: Template for methodology decision records
---

# MDR-000: [Decision Title]

## Status

Proposed | Accepted | Deprecated | Superseded by [MDR-XXX]

## Context

<!-- What prompted this decision about our methodology?
     What forces are at play \u2014 client feedback, delivery challenges, market changes? -->

## Options Considered

### Option A: [Name]

- **Pros**: ...
- **Cons**: ...

### Option B: [Name]

- **Pros**: ...
- **Cons**: ...

## Decision

<!-- What was decided and why. Be specific about the change to methodology. -->

## Consequences

### Positive

- <!-- benefit to delivery quality, client experience, team efficiency -->

### Negative

- <!-- trade-off, additional overhead, training needed -->

### Risks

- <!-- risk and mitigation -->
`,
		},
		// ---------------------------------------------------------------
		// Delivery section
		// ---------------------------------------------------------------
		{
			path: "content/delivery/engagement-lifecycle.md",
			content: (ctx: TemplateContext) => `---
title: Engagement Lifecycle
description: End-to-end engagement flow for ${ctx.branding.brandName}
---

# Engagement Lifecycle

<!-- \u2190 CUSTOMIZE: Replace with your engagement lifecycle -->

## Overview

Every engagement follows a lifecycle from initial contact to close-out.

\`\`\`
Qualify \u2192 Scope \u2192 Kickoff \u2192 Deliver \u2192 Review \u2192 Close
\`\`\`

## Stages

### 1. Qualify

Determine if the engagement is a good fit.

- Client need aligns with our offerings
- We have capacity and expertise
- Commercial terms are viable
- **Gate**: Qualify decision (proceed / decline / defer)

### 2. Scope

Define what we\u2019ll deliver and how.

- Discovery call with stakeholders
- Scope document drafted and approved
- Timeline and milestones agreed
- **Gate**: Scope sign-off

### 3. Kickoff

Mobilize the team and align with the client.

- Client onboarding completed
- Team introductions
- Working agreements established
- Access and logistics confirmed
- **Gate**: Kickoff checklist complete

### 4. Deliver

Execute the engagement methodology.

- Phase execution per [Methodology](/content/methodology/phases)
- Regular check-ins with client
- Quality gates at each milestone
- **Gate**: Deliverable acceptance at each milestone

### 5. Review

Assess outcomes and gather feedback.

- Deliverables accepted by client
- Client satisfaction survey
- Internal retrospective
- Lessons learned captured
- **Gate**: Review complete

### 6. Close

Formally end the engagement.

- Final invoice processed
- Knowledge transfer complete
- Case study drafted (if approved)
- Follow-up opportunities identified
- **Gate**: Engagement closed

## Related

- [Client Onboarding](/content/delivery/client-onboarding) \u2014 kickoff prerequisites
- [Quality Gates](/content/delivery/quality-gates) \u2014 checkpoints throughout delivery
`,
		},
		{
			path: "content/delivery/client-onboarding.md",
			content: (_ctx: TemplateContext) => `---
title: Client Onboarding
description: Client prerequisites, setup, and kickoff
---

# Client Onboarding

<!-- \u2190 CUSTOMIZE: Replace with your onboarding process -->

## Pre-Engagement Checklist

- [ ] Scope document signed
- [ ] Commercial terms agreed
- [ ] Primary client contact identified
- [ ] Stakeholder list confirmed
- [ ] NDA and legal requirements met

## Access & Logistics

- [ ] Meeting cadence established (e.g., weekly check-in)
- [ ] Communication channel set up (email, Slack, Teams)
- [ ] Document sharing established (shared drive, portal)
- [ ] System access provisioned (if needed)
- [ ] Travel logistics confirmed (if on-site)

## Kickoff Meeting Agenda

1. Introductions \u2014 team members and roles
2. Engagement overview \u2014 objectives, scope, timeline
3. Working agreements \u2014 communication, escalation, decisions
4. Logistics \u2014 schedules, access, tools
5. Questions and next steps

## Working Agreements

| Topic | Agreement |
|-------|-----------|
| Check-in frequency | <!-- e.g., weekly --> |
| Status reporting | <!-- e.g., written update every Friday --> |
| Decision authority | <!-- who can approve scope changes --> |
| Escalation path | <!-- primary \u2192 engagement lead \u2192 partner --> |
| Deliverable review | <!-- turnaround time for client feedback --> |

## Onboarding for the Delivery Team

1. Read the scope document
2. Review relevant [Vertical](/content/verticals/overview) context
3. Check [Methodology Phases](/content/methodology/phases) for engagement type
4. Familiarize with deliverable templates in [Delivery Templates](/content/delivery/templates/)
`,
		},
		{
			path: "content/delivery/quality-gates.md",
			content: (_ctx: TemplateContext) => `---
title: Quality Gates
description: Quality checkpoints throughout delivery
---

# Quality Gates

<!-- \u2190 CUSTOMIZE: Replace with your quality checkpoints -->

## Purpose

Quality gates are checkpoints that ensure deliverable quality and client alignment before proceeding to the next phase.

## Gate Definitions

### G1: Scope Approval

**When**: Before engagement begins
**Criteria**:
- [ ] Scope document complete and specific
- [ ] Client has reviewed and signed
- [ ] Team assigned and briefed
- [ ] Timeline realistic given scope

### G2: Discovery Complete

**When**: End of Explore phase
**Criteria**:
- [ ] All planned interviews completed
- [ ] Data collection finished
- [ ] Findings documented
- [ ] No critical gaps in understanding

### G3: Analysis Reviewed

**When**: Before Synthesize phase
**Criteria**:
- [ ] Gap analysis complete
- [ ] Findings validated with client
- [ ] No surprises \u2014 client aware of emerging themes
- [ ] Ready to develop recommendations

### G4: Deliverable Review

**When**: Before final delivery to client
**Criteria**:
- [ ] Internal peer review completed
- [ ] Deliverables match scope commitments
- [ ] Recommendations are actionable and prioritized
- [ ] Presentation materials ready

### G5: Client Acceptance

**When**: After delivery presentation
**Criteria**:
- [ ] Client has received all deliverables
- [ ] Questions addressed
- [ ] Formal acceptance received
- [ ] Follow-up actions documented

## Gate Process

1. Engagement lead prepares gate checklist
2. Peer reviewer validates criteria
3. Gate decision: **Pass** / **Conditional pass** / **Hold**
4. Document outcome and any conditions
`,
		},
		{
			path: "content/delivery/templates/index.md",
			content: (_ctx: TemplateContext) => `---
title: Deliverable Templates
description: Report shells and deliverable formats
---

# Deliverable Templates

<!-- \u2190 CUSTOMIZE: Add your deliverable templates -->

## Available Templates

| Template | Used For | Format |
|----------|---------|--------|
| Assessment Report | Assessment engagements | Document |
| Gap Analysis Matrix | All engagements | Spreadsheet |
| Roadmap | Assessment, advisory | Document + visual |
| Status Update | All engagements | Email / document |
| Final Presentation | All engagements | Slides |

## Template Conventions

- Use consistent branding (client or our brand as appropriate)
- Include document metadata: version, date, author, status
- Mark sections as Draft / Review / Final
- Store completed deliverables in the engagement repository

## Creating a New Template

1. Create a file in \`content/delivery/templates/\`
2. Document: purpose, audience, structure, examples
3. Update this index table
4. Link from relevant [Offering](/content/offerings/overview)
`,
		},
		// ---------------------------------------------------------------
		// Verticals section
		// ---------------------------------------------------------------
		{
			path: "content/verticals/overview.md",
			content: (_ctx: TemplateContext) => `---
title: Verticals Overview
description: Industry context for client engagements
---

# Verticals

<!-- \u2190 CUSTOMIZE: Document industry verticals where you deliver services -->

## Purpose

Vertical documentation captures **industry-specific context** that shapes how we scope, deliver, and advise clients. Understanding the client\u2019s industry is essential for credible, relevant service delivery.

## Documented Verticals

| Vertical | Key Characteristics | Our Experience |
|----------|-------------------|----------------|
| <!-- industry --> | <!-- what makes it distinct --> | <!-- our track record --> |

## What to Capture Per Vertical

### Regulatory Environment

Regulations, compliance requirements, certifications, and reporting obligations that affect how clients operate.

### Industry Terminology

Domain-specific terms that differ from general usage. Essential for credible client communication.

### Common Challenges

Recurring problems and patterns we see across clients in this vertical.

### Competitive Landscape

Key players, industry trends, and market dynamics that inform our advisory.

## Adding a Vertical

1. Create a file in \`content/verticals/\`:
   \`\`\`
   content/verticals/healthcare.md
   \`\`\`
2. Include: regulatory environment, terminology, common challenges, competitive landscape
3. Update this overview table
4. Link from relevant [Case Studies](/content/case-studies/)
`,
		},
		// ---------------------------------------------------------------
		// Case Studies section
		// ---------------------------------------------------------------
		{
			path: "content/case-studies/index.md",
			content: (_ctx: TemplateContext) => `---
title: Case Studies
description: Past engagements and proven results
---

# Case Studies

<!-- \u2190 CUSTOMIZE: Add case studies as engagements complete -->

| Case Study | Vertical | Service | Outcome |
|-----------|----------|---------|---------|
| <!-- title --> | <!-- industry --> | <!-- service type --> | <!-- key result --> |

## Why Document Case Studies

- Demonstrate capability to prospective clients
- Capture lessons learned for the team
- Build institutional knowledge across verticals
- Support proposals with evidence of past success

## Case Study Template

Each case study should include:

### Context
- Client industry and size (anonymized if needed)
- Problem or opportunity that prompted the engagement
- Constraints and complexities

### Approach
- Service type and engagement model
- Methodology phases used
- Team composition
- Timeline

### Deliverables
- What we produced
- Key findings or recommendations

### Outcomes
- Measurable results (quantified where possible)
- Client feedback
- Follow-on work (if any)

### Lessons Learned
- What worked well
- What we\u2019d do differently
- Insights applicable to future engagements

## Anonymization Guidelines

- Replace client name with descriptor (e.g., \u201cMid-market healthcare provider\u201d)
- Remove specific financial figures unless approved
- Generalize technology names if identifying
- Get client approval before publishing externally
`,
		},
		// ---------------------------------------------------------------
		// Reference section
		// ---------------------------------------------------------------
		{
			path: "content/reference/team-expertise.md",
			content: (_ctx: TemplateContext) => `---
title: Team Expertise
description: Team capabilities and specializations
---

# Team Expertise

<!-- \u2190 CUSTOMIZE: Document your team\u2019s capabilities -->

## Capability Matrix

| Capability | Team Members | Depth | Verticals |
|-----------|-------------|-------|-----------|
| <!-- capability --> | <!-- who --> | Expert / Proficient / Developing | <!-- industries --> |

## Specializations

### <!-- Specialization Name -->

<!-- Description, experience, notable engagements -->

## Certifications & Credentials

| Person | Certification | Issuer | Expiry |
|--------|-------------|--------|--------|
| <!-- name --> | <!-- cert --> | <!-- issuer --> | <!-- date --> |

## Capacity Planning

| Team Member | Current Engagement | Availability |
|------------|-------------------|-------------|
| <!-- name --> | <!-- engagement --> | <!-- date available --> |

## Professional Development

- Areas where the team is investing in new capabilities
- Training in progress or planned
- Conference participation
`,
		},
		{
			path: "content/reference/pricing-models.md",
			content: (_ctx: TemplateContext) => `---
title: Pricing Models
description: Engagement pricing structures
---

# Pricing Models

<!-- \u2190 CUSTOMIZE: Document your pricing approach -->

## Engagement Types

### Fixed-Price

| Component | Description |
|-----------|-------------|
| Basis | Defined scope and deliverables |
| Risk | Provider absorbs scope risk |
| Best for | Assessments, well-defined projects |
| Client benefit | Budget certainty |

### Time & Materials

| Component | Description |
|-----------|-------------|
| Basis | Hourly/daily rates for actual effort |
| Risk | Client absorbs scope variability |
| Best for | Advisory, evolving requirements |
| Client benefit | Flexibility |

### Milestone-Based

| Component | Description |
|-----------|-------------|
| Basis | Payments tied to deliverable acceptance |
| Risk | Shared between client and provider |
| Best for | Implementation engagements |
| Client benefit | Payment aligned with value delivered |

## Rate Structure

<!-- \u2190 CUSTOMIZE: Define your rate tiers (internal reference) -->

| Role | Rate Range | Notes |
|------|-----------|-------|
| <!-- role --> | <!-- range --> | <!-- context --> |

## Discount & Adjustment Policies

<!-- Volume discounts, non-profit rates, retainer discounts, etc. -->

## Proposal Templates

Link to standard proposal templates and commercial terms.
`,
		},
		{
			path: "content/reference/contacts/directory.md",
			content: (ctx: TemplateContext) => `---
title: Contact Directory
description: Team contacts and escalation for ${ctx.branding.brandName}
---

# Contact Directory

<!-- \u2190 CUSTOMIZE: Add your team and partner contacts -->

## Delivery Team

| Role | Contact | Responsibility |
|------|---------|----------------|
| Practice Lead | <!-- name/email --> | Service strategy, client relationships |
| Engagement Lead | <!-- name/email --> | Delivery oversight, quality assurance |
| Senior Consultant | <!-- name/email --> | Analysis, recommendations |
| Analyst | <!-- name/email --> | Research, data collection |

## Partners & Subcontractors

| Partner | Specialty | Contact |
|---------|----------|---------|
| <!-- partner --> | <!-- what they provide --> | <!-- contact --> |

## Escalation Path

1. **Engagement Lead** \u2014 day-to-day delivery issues
2. **Practice Lead** \u2014 scope changes, client concerns
3. **Managing Partner** \u2014 commercial disputes, strategic issues

## Client Communication

| Channel | Purpose | Response Time |
|---------|---------|--------------|
| Email | Formal communication, deliverables | 24 hours |
| Slack/Teams | Day-to-day coordination | 4 hours |
| Phone | Urgent issues | Immediate |
`,
		},
		// ---------------------------------------------------------------
		// CUSTOMIZING.md
		// ---------------------------------------------------------------
		{
			path: "CUSTOMIZING.md",
			content: (ctx: TemplateContext) => `---
template: servicebook
template_version: 1
created: ${new Date().toISOString().split("T")[0]}
---

# Customizing ${ctx.branding.siteName}

This guide helps you (and AI assistants) understand how to customize this servicebook.

## Site Structure

\`\`\`
${ctx.name}/
\u251c\u2500\u2500 site.yaml              # Site configuration (sections, branding)
\u251c\u2500\u2500 theme.yaml             # Theme customization (create if needed)
\u251c\u2500\u2500 index.md               # Home page with service catalog summary
\u251c\u2500\u2500 CUSTOMIZING.md         # This file
\u251c\u2500\u2500 content/
\u2502   \u251c\u2500\u2500 offerings/         # Service definitions
\u2502   \u2502   \u2514\u2500\u2500 assess/        # Example: assessment service
\u2502   \u251c\u2500\u2500 methodology/       # How we deliver
\u2502   \u2502   \u2514\u2500\u2500 decisions/     # Methodology decision records
\u2502   \u251c\u2500\u2500 delivery/          # Engagement operations
\u2502   \u2502   \u2514\u2500\u2500 templates/     # Deliverable templates
\u2502   \u251c\u2500\u2500 verticals/         # Industry context
\u2502   \u251c\u2500\u2500 case-studies/      # Past engagements
\u2502   \u2514\u2500\u2500 reference/         # Supporting materials
\u2502       \u2514\u2500\u2500 contacts/      # Team contacts, escalation
\u2514\u2500\u2500 assets/
    \u2514\u2500\u2500 brand/             # Logo, favicon
\`\`\`

## Configuration Files

### site.yaml - Site Configuration

\`\`\`yaml
title: "${ctx.branding.siteName}"

brand:
  name: "${ctx.branding.brandName}"     # Shown in header
  url: "/"                              # Logo link destination

sections:
  - name: "Offerings"
    path: "content/offerings"
  # Add or modify sections here
\`\`\`

### theme.yaml - Visual Customization (optional)

Create \`theme.yaml\` to customize colors and typography:

\`\`\`yaml
colors:
  primary: "#2563eb"
  background: "#ffffff"
  text: "#1f2937"

footer:
  text: "\u00a9 ${ctx.year} ${ctx.branding.brandName}"
\`\`\`

## Adding Content

### New Service Offering

1. Create a folder in \`content/offerings/\`:
   \`\`\`
   content/offerings/my-service/overview.md
   content/offerings/my-service/deliverables.md
   content/offerings/my-service/scoping.md
   \`\`\`
2. Include: client problem, deliverables, scoping criteria, timeline
3. Update the service catalog in \`content/offerings/overview.md\`

### Documenting a Methodology Change

1. Copy the [MDR Template](/content/methodology/decisions/mdr-template) to a new file:
   \`\`\`
   content/methodology/decisions/mdr-001-my-decision.md
   \`\`\`
2. Fill in: context, options, decision, consequences
3. Update the index in \`content/methodology/decisions/index.md\`

### Adding a Case Study

1. Create a file in \`content/case-studies/\`:
   \`\`\`
   content/case-studies/healthcare-assessment-2025.md
   \`\`\`
2. Follow the template: Context, Approach, Deliverables, Outcomes, Lessons Learned
3. Anonymize per guidelines in the [Case Studies index](/content/case-studies/)
4. Update the case studies index table

### Adding a Vertical

1. Create a file in \`content/verticals/\`:
   \`\`\`
   content/verticals/healthcare.md
   \`\`\`
2. Include: regulatory environment, terminology, common challenges, competitive landscape
3. Update the verticals overview table

### New Section

1. Create folder: \`content/newsection/\`
2. Add to \`site.yaml\`:
   \`\`\`yaml
   sections:
     - name: "New Section"
       path: "content/newsection"
   \`\`\`
3. Add at least one markdown file

## Document Conventions

### Offerings (services, deliverables, scoping)

- State the client problem before the solution
- Define deliverables with format, content, and audience
- Include scoping criteria so engagements are sized consistently

### Methodology (phases, tools, frameworks)

- Document phases with inputs, activities, and outputs
- Tools should include purpose and when they\u2019re used
- Frameworks need clear scoring criteria and limitations

### Delivery (lifecycle, quality gates)

- Engagement lifecycle needs gates between each stage
- Quality gates need specific, checkable criteria
- Templates should be ready to use, not just described

### Case Studies

- Always anonymize unless client has approved attribution
- Quantify outcomes where possible
- Include lessons learned \u2014 what you\u2019d do differently

## Linking and References

### Internal Links

\`\`\`markdown
See [Service Catalog](/content/offerings/overview) for available services.
\`\`\`

### External Links

\`\`\`markdown
See [Industry Report](https://example.com/report).
\`\`\`

## Getting Help

- [Kitfly Documentation](https://github.com/3leaps/kitfly)
- [Markdown Guide](https://www.markdownguide.org/)
`,
		},
	],
};
