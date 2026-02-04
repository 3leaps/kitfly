/**
 * Runbook Template
 *
 * Extends minimal with structured sections for operational documentation.
 * Sections: Procedures, Troubleshooting, Reference, Incidents
 */

import type { TemplateContext, TemplateDef } from "./schema.ts";

export const runbook: TemplateDef = {
	id: "runbook",
	name: "Runbook",
	description: "Operational runbook with procedures, troubleshooting, and incident response",
	version: 1,
	extends: "minimal",
	sections: [
		{
			name: "Procedures",
			path: "content/procedures",
			description: "Step-by-step operational tasks",
		},
		{
			name: "Troubleshooting",
			path: "content/troubleshooting",
			description: "Problem → solution guides",
		},
		{
			name: "Reference",
			path: "content/reference",
			description: "Interfaces, contacts, checklists",
		},
		{ name: "Incidents", path: "content/incidents", description: "Emergency response procedures" },
	],
	files: [
		{
			path: "site.yaml",
			content: (ctx: TemplateContext) => `# ${ctx.branding.siteName} - Site Configuration
# Documentation: https://github.com/3leaps/kitfly

title: "${ctx.branding.siteName}"

# ← CUSTOMIZE: Your brand settings
brand:
  name: "${ctx.branding.brandName}"
  url: "${ctx.branding.brandUrl}"
  # external: false  # Set true if brand URL is external

# Content sections
sections:
  - name: "Procedures"
    path: "content/procedures"
  - name: "Troubleshooting"
    path: "content/troubleshooting"
  - name: "Reference"
    path: "content/reference"
  - name: "Incidents"
    path: "content/incidents"

# Home page
home: "index.md"
`,
		},
		{
			path: "index.md",
			content: (ctx: TemplateContext) => `---
title: Home
description: ${ctx.branding.siteName} - Operational Runbook
---

# ${ctx.branding.siteName}

Operational runbook for ${ctx.branding.brandName}. Use this documentation for procedures, troubleshooting, and incident response.

## Quick Links

### [Procedures](/content/procedures/deployment)
Step-by-step guides for operational tasks: deployments, maintenance, migrations.

### [Troubleshooting](/content/troubleshooting/common-issues)
Diagnose and resolve common issues. Symptoms → causes → solutions.

### [Reference](/content/reference/interfaces/api-template)
Supporting materials: API specs, contacts, checklists, metrics.

### [Incidents](/content/incidents/escalation)
Emergency response procedures and escalation paths.

---

## On-Call Quick Reference

| Severity | Response Time | Escalation |
|----------|---------------|------------|
| P1 - Critical | 15 minutes | Immediate page |
| P2 - High | 1 hour | Business hours |
| P3 - Medium | 4 hours | Next business day |
| P4 - Low | Best effort | Backlog |

See [Escalation](/content/incidents/escalation) for full details.

---

*Last updated: ${new Date().toISOString().split("T")[0]}*
`,
		},
		// Procedures section
		{
			path: "content/procedures/deployment.md",
			content: (ctx: TemplateContext) => `---
title: Deployment Procedure
description: Standard deployment process for ${ctx.branding.brandName}
---

# Deployment Procedure

<!-- ← CUSTOMIZE: Replace with your deployment steps -->

## Objective

Deploy new code to production environment safely and reliably.

## Prerequisites

- [ ] Code reviewed and approved
- [ ] Tests passing in CI
- [ ] Change ticket approved
- [ ] Rollback plan documented

## Steps

### 1. Pre-deployment Checks

\`\`\`bash
# Verify build status
./scripts/check-build-status.sh

# Expected output: "Build #123 - PASSED"
\`\`\`

### 2. Create Deployment

\`\`\`bash
# Trigger deployment
./scripts/deploy.sh --environment production --version v1.2.3
\`\`\`

**Verification**: Deployment dashboard shows "In Progress"

### 3. Monitor Rollout

- Watch error rates in monitoring dashboard
- Check application logs for startup errors
- Verify health check endpoints responding

### 4. Post-deployment Validation

- [ ] Health checks passing
- [ ] Key user flows working
- [ ] Error rates within normal range
- [ ] Performance metrics stable

## Rollback

If issues are detected:

\`\`\`bash
./scripts/rollback.sh --to-version v1.2.2
\`\`\`

## Related

- [Pre-deploy Checklist](/content/reference/checklists/pre-deploy)
- [Incident Escalation](/content/incidents/escalation)
`,
		},
		// Troubleshooting section
		{
			path: "content/troubleshooting/common-issues.md",
			content: (_ctx: TemplateContext) => `---
title: Common Issues
description: Troubleshooting guide for frequent problems
---

# Common Issues

<!-- ← CUSTOMIZE: Add your common issues and solutions -->

## Connection Timeout

**Symptoms**:
- API calls failing with timeout errors
- Dashboard showing "Connection refused"
- Users reporting slow or unresponsive application

**Possible Causes**:
1. Database connection pool exhausted
2. Network connectivity issues
3. Service overloaded

**Resolution**:

1. Check database connections:
   \`\`\`bash
   ./scripts/check-db-connections.sh
   \`\`\`

2. Verify network connectivity:
   \`\`\`bash
   curl -v https://api.example.com/health
   \`\`\`

3. If overloaded, scale up:
   \`\`\`bash
   ./scripts/scale-service.sh --replicas 5
   \`\`\`

**Escalation**: If unresolved after 15 minutes, escalate to [on-call](/content/incidents/escalation).

---

## High Memory Usage

**Symptoms**:
- Memory alerts firing
- OOM kills in container logs
- Degraded performance

**Resolution**:

1. Identify memory-heavy processes:
   \`\`\`bash
   ./scripts/memory-report.sh
   \`\`\`

2. Check for memory leaks in recent deployments
3. Consider rolling restart if immediate relief needed

---

## Authentication Failures

**Symptoms**:
- Users unable to log in
- 401 errors in API responses
- Token validation failures

**Resolution**:

1. Verify auth service status
2. Check certificate expiration
3. Validate configuration

See [Auth Troubleshooting](/content/troubleshooting/auth-issues) for detailed steps.
`,
		},
		// Reference section - Interfaces
		{
			path: "content/reference/interfaces/api-template.md",
			content: (_ctx: TemplateContext) => `---
title: API Integration Template
description: Template for documenting external API integrations
---

# API Integration: [Service Name]

<!-- ← CUSTOMIZE: Copy this template for each integration -->

## Overview

| Field | Value |
|-------|-------|
| **Service** | [Name of external service] |
| **Type** | REST API / GraphQL / SOAP |
| **Environment** | Production / Staging |
| **Documentation** | [Link to vendor docs] |

## Authentication

- **Method**: API Key / OAuth 2.0 / Basic Auth
- **Credentials Location**: Secrets vault path
- **Rotation Schedule**: Quarterly / Annual

## Endpoints

### Primary Endpoint

\`\`\`
POST https://api.vendor.com/v1/resource
Content-Type: application/json
Authorization: Bearer {token}
\`\`\`

**Request**:
\`\`\`json
{
  "field1": "value",
  "field2": 123
}
\`\`\`

**Response** (200 OK):
\`\`\`json
{
  "id": "abc123",
  "status": "success"
}
\`\`\`

## Error Handling

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad request | Check request format |
| 401 | Unauthorized | Refresh credentials |
| 429 | Rate limited | Back off and retry |
| 500 | Server error | Contact vendor |

## Rate Limits

- **Limit**: 1000 requests/minute
- **Throttling**: Automatic retry with exponential backoff

## Vendor Support

- **Support Portal**: [URL]
- **SLA**: 99.9% uptime
- **Contact**: See [Contacts](/content/reference/contacts/directory)
`,
		},
		// Reference section - Contacts
		{
			path: "content/reference/contacts/directory.md",
			content: (ctx: TemplateContext) => `---
title: Contact Directory
description: Team and vendor contacts for ${ctx.branding.brandName}
---

# Contact Directory

<!-- ← CUSTOMIZE: Add your team and vendor contacts -->

## Internal Team

### On-Call

| Role | Contact | Escalation |
|------|---------|------------|
| Primary On-Call | [PagerDuty/Slack] | Automatic rotation |
| Secondary On-Call | [PagerDuty/Slack] | If primary unavailable |
| Engineering Lead | [Name] | For P1 decisions |

### Team Leads

| Area | Contact | Responsibility |
|------|---------|----------------|
| Platform | [Name/Email] | Infrastructure, deployments |
| Backend | [Name/Email] | API, services |
| Frontend | [Name/Email] | UI, client apps |
| Data | [Name/Email] | Database, analytics |

## Vendor Contacts

### [Vendor Name]

| Type | Contact |
|------|---------|
| Support Portal | [URL] |
| Support Email | [email] |
| Account Manager | [Name/Email] |
| Emergency Line | [Phone] |

### Cloud Provider

| Type | Contact |
|------|---------|
| Support | [AWS/GCP/Azure portal] |
| Account Team | [Name/Email] |
| TAM | [Name/Email] |

## Escalation Matrix

See [Escalation Procedures](/content/incidents/escalation) for when and how to escalate.
`,
		},
		// Reference section - Checklists
		{
			path: "content/reference/checklists/pre-deploy.md",
			content: (_ctx: TemplateContext) => `---
title: Pre-Deployment Checklist
description: Verification checklist before deploying to production
---

# Pre-Deployment Checklist

<!-- ← CUSTOMIZE: Adapt to your deployment process -->

## Code Readiness

- [ ] All tests passing in CI
- [ ] Code review approved
- [ ] No critical security findings
- [ ] Documentation updated

## Change Management

- [ ] Change ticket created and approved
- [ ] Stakeholders notified
- [ ] Deployment window confirmed
- [ ] Rollback plan documented

## Environment Verification

- [ ] Target environment healthy
- [ ] Dependencies available
- [ ] Configuration validated
- [ ] Secrets/credentials current

## Monitoring Readiness

- [ ] Dashboards accessible
- [ ] Alerts configured
- [ ] Log aggregation working
- [ ] On-call engineer aware

## Go/No-Go

| Criteria | Status |
|----------|--------|
| Tests passing | ⬜ |
| Approvals complete | ⬜ |
| Environment ready | ⬜ |
| Monitoring ready | ⬜ |
| Rollback tested | ⬜ |

**Decision**: ⬜ GO / ⬜ NO-GO

---

## Post-Deployment

See [Deployment Procedure](/content/procedures/deployment) for execution steps.
`,
		},
		// Reference section - Analytics
		{
			path: "content/reference/analytics/dashboards.md",
			content: (ctx: TemplateContext) => `---
title: Dashboards & Metrics
description: Key metrics and dashboard links for ${ctx.branding.brandName}
---

# Dashboards & Metrics

<!-- ← CUSTOMIZE: Add your monitoring URLs and KPIs -->

## Primary Dashboards

| Dashboard | URL | Purpose |
|-----------|-----|---------|
| System Health | [Grafana/Datadog URL] | Overall system status |
| Application Metrics | [URL] | Request rates, latencies |
| Error Tracking | [Sentry/Rollbar URL] | Exceptions and errors |
| Infrastructure | [URL] | CPU, memory, network |

## Key Performance Indicators

### Availability

| Metric | Target | Current |
|--------|--------|---------|
| Uptime | 99.9% | [Link to metric] |
| Error Rate | < 0.1% | [Link to metric] |
| P95 Latency | < 200ms | [Link to metric] |

### Business Metrics

| Metric | Target | Dashboard |
|--------|--------|-----------|
| Requests/sec | > 1000 | [Link] |
| Active Users | - | [Link] |
| Transaction Success | > 99.5% | [Link] |

## SLA Definitions

| Tier | Availability | Response Time |
|------|--------------|---------------|
| Critical | 99.99% | 15 min |
| Standard | 99.9% | 1 hour |
| Best Effort | 99% | 4 hours |

## Alert Thresholds

| Alert | Warning | Critical | Action |
|-------|---------|----------|--------|
| CPU | > 70% | > 90% | Scale or investigate |
| Memory | > 80% | > 95% | Check for leaks |
| Error Rate | > 1% | > 5% | Investigate immediately |
| Latency P95 | > 500ms | > 1s | Check dependencies |
`,
		},
		// Incidents section
		{
			path: "content/incidents/escalation.md",
			content: (_ctx: TemplateContext) => `---
title: Escalation Procedures
description: When and how to escalate incidents
---

# Escalation Procedures

<!-- ← CUSTOMIZE: Add your escalation paths and contacts -->

## Severity Levels

| Level | Definition | Response Time | Examples |
|-------|------------|---------------|----------|
| **P1** | Critical - Service down | 15 min | Complete outage, data loss |
| **P2** | High - Major degradation | 1 hour | Partial outage, slow response |
| **P3** | Medium - Minor impact | 4 hours | Feature broken, workaround exists |
| **P4** | Low - Minimal impact | Best effort | Cosmetic issues, minor bugs |

## Escalation Matrix

### P1 - Critical

1. **Immediately**: Page on-call engineer
2. **15 minutes**: If no response, page secondary
3. **30 minutes**: Escalate to engineering lead
4. **1 hour**: Notify stakeholders, consider exec briefing

### P2 - High

1. **Immediately**: Notify on-call via Slack/PagerDuty
2. **1 hour**: Escalate if no progress
3. **4 hours**: Engineering lead involvement

### P3/P4 - Medium/Low

1. Create ticket in tracking system
2. Assign to appropriate team
3. Follow normal sprint process

## Communication

### Internal Updates

| Audience | Channel | Frequency |
|----------|---------|-----------|
| Incident Team | War room/Slack | Continuous |
| Engineering | #incidents channel | Every 30 min |
| Leadership | Email/Slack | Hourly for P1 |

### External Communication

For customer-facing incidents:
1. Status page update within 15 minutes
2. Customer support briefed
3. Follow-up communication on resolution

## Post-Incident

1. **Immediate**: Confirm resolution and monitoring
2. **24 hours**: Draft incident report
3. **1 week**: Post-mortem meeting
4. **2 weeks**: Action items assigned and tracked

See [Post-Mortem Template](/content/incidents/post-mortem-template) for documentation format.
`,
		},
		{
			path: "content/incidents/post-mortem-template.md",
			content: (_ctx: TemplateContext) => `---
title: Post-Mortem Template
description: Template for incident post-mortem documentation
---

# Post-Mortem: [Incident Title]

<!-- ← CUSTOMIZE: Copy this template for each incident -->

## Summary

| Field | Value |
|-------|-------|
| **Date** | YYYY-MM-DD |
| **Duration** | X hours Y minutes |
| **Severity** | P1/P2/P3 |
| **Impact** | [Description of user/business impact] |
| **Status** | Draft / Final |

## Timeline

| Time (UTC) | Event |
|------------|-------|
| HH:MM | Issue first detected |
| HH:MM | On-call paged |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Service restored |
| HH:MM | Incident closed |

## Root Cause

[Detailed technical explanation of what caused the incident]

## Contributing Factors

- Factor 1
- Factor 2
- Factor 3

## Resolution

[What was done to resolve the incident]

## Lessons Learned

### What Went Well

- Item 1
- Item 2

### What Could Be Improved

- Item 1
- Item 2

## Action Items

| Item | Owner | Due Date | Status |
|------|-------|----------|--------|
| [Action] | [Name] | [Date] | ⬜ Open |
| [Action] | [Name] | [Date] | ⬜ Open |

## References

- [Link to incident ticket]
- [Link to relevant dashboards]
- [Link to related documentation]
`,
		},
		// CUSTOMIZING.md
		{
			path: "CUSTOMIZING.md",
			content: (ctx: TemplateContext) => `---
template: runbook
template_version: 1
created: ${new Date().toISOString().split("T")[0]}
---

# Customizing ${ctx.branding.siteName}

This guide helps you (and AI assistants) understand how to customize this runbook.

## Site Structure

\`\`\`
${ctx.name}/
├── site.yaml              # Site configuration (sections, branding)
├── theme.yaml             # Theme customization (create if needed)
├── index.md               # Home page with quick links
├── CUSTOMIZING.md         # This file
├── content/
│   ├── procedures/        # Step-by-step operational tasks
│   ├── troubleshooting/   # Problem → solution guides
│   ├── reference/         # Supporting materials
│   │   ├── interfaces/    # API specs, protocol docs
│   │   ├── contacts/      # Team and vendor contacts
│   │   ├── checklists/    # Verification checklists
│   │   └── analytics/     # Dashboards, KPIs, SLAs
│   └── incidents/         # Emergency response
└── assets/
    └── brand/             # Logo, favicon
\`\`\`

## Configuration Files

### site.yaml - Site Configuration

\`\`\`yaml
title: "${ctx.branding.siteName}"

brand:
  name: "${ctx.branding.brandName}"     # Shown in header
  url: "/"                              # Logo link destination

sections:
  - name: "Procedures"
    path: "content/procedures"
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
  text: "© ${ctx.year} ${ctx.branding.brandName}"
\`\`\`

## Header and Footer

- **Header**: Brand name/logo from \`site.yaml\` + section navigation
- **Footer**: Auto-generated copyright, customizable via \`theme.yaml\`

## Brand Assets

| Asset | Location | Recommended Size |
|-------|----------|------------------|
| Logo | \`assets/brand/logo.png\` | 200x50px (or SVG) |
| Favicon | \`assets/brand/favicon.ico\` | 32x32px |

## Adding Content

### New Procedure

1. Create file in \`content/procedures/\`:
   \`\`\`
   content/procedures/my-procedure.md
   \`\`\`

2. Use the procedure format:
   \`\`\`markdown
   ---
   title: Procedure Name
   ---

   # Procedure Name

   ## Objective
   What this accomplishes.

   ## Prerequisites
   - [ ] Required item

   ## Steps
   1. First step
   2. Second step

   ## Verification
   How to confirm success.

   ## Rollback
   How to revert if needed.
   \`\`\`

### New Troubleshooting Guide

Follow the pattern: Symptoms → Causes → Resolution → Escalation

### New Interface/API Doc

Copy \`content/reference/interfaces/api-template.md\` and customize.

### New Section

1. Create folder: \`content/newsection/\`
2. Add to \`site.yaml\`:
   \`\`\`yaml
   sections:
     - name: "New Section"
       path: "content/newsection"
   \`\`\`
3. Add at least one markdown file

## Linking and References

### Internal Links

\`\`\`markdown
See [Deployment](/content/procedures/deployment) procedure.
\`\`\`

### External Links

\`\`\`markdown
See [Vendor Documentation](https://vendor.com/docs).
\`\`\`

### Images

\`\`\`markdown
![Architecture](/assets/images/architecture.png)
\`\`\`

## Important Limitations

- **Content must be inside this folder** - kitfly cannot include external files
- **External resources**: Link via URL rather than copying
- **Binary files** (PDFs): Place in \`assets/\` and link to them
- **No dynamic includes**: This generates static HTML

## Document Conventions

### Procedures

- Start with Objective (what/why)
- List Prerequisites as checkboxes
- Number steps explicitly
- Include expected outputs
- Always have Rollback section

### Troubleshooting

- Lead with Symptoms (what user sees)
- List Possible Causes
- Provide step-by-step Resolution
- Include Escalation path

### Checklists

- Use checkbox format: \`- [ ] Item\`
- Group by phase or category
- Include Go/No-Go decision point

## Getting Help

- [Kitfly Documentation](https://github.com/3leaps/kitfly)
- [Markdown Guide](https://www.markdownguide.org/)
`,
		},
	],
};
