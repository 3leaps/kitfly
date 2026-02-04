---
title: Runbook Template
description: Operational procedures, troubleshooting, and incident response
---

# Runbook Template

The `runbook` template creates a structured site for operational documentation. It extends `minimal` with sections designed for on-call engineers, SREs, and operations teams.

## When to Use

- Operations documentation
- On-call runbooks
- Incident response procedures
- System administration guides
- Deployment and maintenance checklists
- Any docs that answer "what do I do when..."

## What You Get

Everything from `minimal`, plus:

```
my-runbook/
├── site.yaml              # Configured with ops sections
├── index.md               # Home page with quick links
├── CUSTOMIZING.md         # How to customize this site (AI + human friendly)
├── content/
│   ├── procedures/
│   │   └── deployment.md         # Step-by-step procedures
│   ├── troubleshooting/
│   │   └── common-issues.md      # Problem → solution guides
│   ├── reference/
│   │   ├── interfaces/
│   │   │   └── api-template.md   # Integration/API documentation
│   │   ├── contacts/
│   │   │   └── directory.md      # Team and vendor contacts
│   │   ├── checklists/
│   │   │   └── pre-deploy.md     # Verification checklists
│   │   └── analytics/
│   │       └── dashboards.md     # Metrics and KPI definitions
│   └── incidents/
│       └── escalation.md         # Incident response paths
└── ...
```

## Sections

| Section | Purpose | Typical Content |
|---------|---------|-----------------|
| **Procedures** | How to perform operational tasks | Deployment steps, maintenance tasks, migrations |
| **Troubleshooting** | Diagnose and fix issues | Error codes, symptoms → causes, remediation |
| **Reference** | Look-up information | Interfaces, contacts, checklists, glossary |
| **Incidents** | Emergency response | Escalation paths, severity definitions, post-mortems |

The **Reference** section consolidates supporting materials:

| Subsection | Purpose |
|------------|---------|
| `reference/interfaces/` | API specs, protocol docs, vendor integration details |
| `reference/contacts/` | Team directory, vendor contacts, escalation matrix |
| `reference/checklists/` | Pre/post deployment, audit, maintenance checklists |
| `reference/analytics/` | Dashboard links, KPIs, SLA definitions |

## Usage

```bash
kitfly init ops-docs --template runbook
kitfly init ops-docs --template runbook --brand "Platform Team"
```

## Design Principles

Runbooks differ from handbooks in key ways:

| Aspect | Handbook | Runbook |
|--------|----------|---------|
| **Audience** | Learning | Doing (often urgently) |
| **Reading mode** | Sequential | Jump to specific procedure |
| **Goal** | Understanding | Task completion |
| **Tone** | Explanatory | Direct, imperative |

## Procedure Document Format

Each procedure should follow a consistent structure:

```markdown
# Procedure Name

## Objective
What this procedure accomplishes and when to use it.

## Prerequisites
- [ ] Required access or permissions
- [ ] Tools or systems that must be available
- [ ] Related procedures to complete first

## Steps

1. **First action**
   - Expected output: `what you should see`

2. **Second action**
   - Verification: How to confirm success

## Verification
How to confirm the procedure completed successfully.

## Rollback
If something goes wrong, how to revert.

## Related
- Link to related procedures
- Escalation path if this fails
```

## Growing Your Runbook

As your runbook matures, consider:

**Numbered sections** for ordering (enterprise pattern):
```
content/
├── 00-bootstrap/    # Initial setup, first-run procedures
├── 01-operations/   # Day-to-day operational tasks
├── 02-incidents/    # Emergency response
└── 99-reference/    # Templates, glossaries, checklists
```

**Recipes** - reusable procedures organized by topic:
```
content/procedures/
├── security/
│   ├── rotate-credentials.md
│   └── access-review.md
├── database/
│   ├── backup.md
│   └── restore.md
└── deployment/
    ├── standard-deploy.md
    └── hotfix-deploy.md
```

## The Customizing Guide

Every runbook includes `CUSTOMIZING.md` - a commissioning guide for both humans and AI assistants:

**What it covers:**
- How to add content to each section
- Adding new sections to `site.yaml`
- Conventions used in this runbook
- File linking and cross-references

**Important limitations:**
- Content must live within the site folder (kitfly cannot include files from outside)
- External resources should be linked via URL, not copied
- Binary files (PDFs, images) go in `assets/` and are linked, not rendered

This guide helps onboard team members and ensures AI coding assistants understand the structure when helping maintain the runbook.

## Example Use Cases

**Integration Runbook** (like Blossman/Cargas)
- Procedures: Data sync, batch processing, error recovery
- Troubleshooting: Connection failures, data format errors, timeout issues
- Reference/Interfaces: ERP API specs (extracted from vendor PDF), protocol details
- Reference/Contacts: Vendor support, internal integration team
- Incidents: Sync failure response, data reconciliation

**Platform Runbook**
- Procedures: Deploy service, rotate secrets, scale cluster
- Troubleshooting: High CPU, memory leaks, connection timeouts
- Reference/Checklists: Production deploy, database migration
- Reference/Analytics: SLA dashboard links, key metrics
- Incidents: P1 response, rollback procedure

**Security Operations**
- Procedures: Credential rotation, access reviews, patch deployment
- Troubleshooting: Auth failures, certificate expiry, firewall issues
- Reference/Contacts: Security team, vendor security contacts
- Incidents: Breach response, compromised credentials
