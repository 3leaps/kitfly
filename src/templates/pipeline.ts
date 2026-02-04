/**
 * Pipeline Template
 *
 * Extends minimal with structured sections for data pipeline operations.
 * Sections: Pipeline, Sources, Destinations, Operations, Troubleshooting, Reference
 */

import type { TemplateContext, TemplateDef } from "./schema.ts";

export const pipeline: TemplateDef = {
	id: "pipeline",
	name: "Pipeline",
	description: "Data pipeline operations with stages, sources, destinations, and manifests",
	version: 1,
	extends: "minimal",
	sections: [
		{
			name: "Pipeline",
			path: "content/pipeline",
			description: "Pipeline stage documentation — the core dataflow",
		},
		{
			name: "Sources",
			path: "content/sources",
			description: "Source data systems, schemas, auth profiles",
		},
		{
			name: "Destinations",
			path: "content/destinations",
			description: "Target structures, layout conventions",
		},
		{
			name: "Operations",
			path: "content/operations",
			description: "Run procedures, schedules, checklists",
		},
		{
			name: "Troubleshooting",
			path: "content/troubleshooting",
			description: "Problem → solution guides",
		},
		{
			name: "Reference",
			path: "content/reference",
			description: "Manifests, field mappings, metrics, contacts",
		},
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
  - name: "Pipeline"
    path: "content/pipeline"
  - name: "Sources"
    path: "content/sources"
  - name: "Destinations"
    path: "content/destinations"
  - name: "Operations"
    path: "content/operations"
  - name: "Troubleshooting"
    path: "content/troubleshooting"
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
description: ${ctx.branding.siteName} - Data Pipeline Operations
---

# ${ctx.branding.siteName}

Data pipeline operations for ${ctx.branding.brandName}.

## Pipeline Status

| Stage | Description | Status |
|-------|-------------|--------|
| Index | Build searchable catalog of source data | — |
| Extract | Derive routing fields from content | — |
| Transfer | Copy/reorganize to destination structure | — |
| Validate | Verify completeness and correctness | — |

## Quick Links

### [Pipeline Overview](/content/pipeline/overview)
End-to-end dataflow: stages, dependencies, and execution order.

### [Run a Pipeline](/content/operations/run-pipeline)
Step-by-step execution procedure with checkpoints.

### [Source Systems](/content/sources/)
Source data systems, schemas, and authentication profiles.

### [Troubleshooting](/content/troubleshooting/common-issues)
Diagnose and resolve common pipeline issues.

---

*Last updated: ${new Date().toISOString().split("T")[0]}*
`,
		},
		// Pipeline section
		{
			path: "content/pipeline/overview.md",
			content: (ctx: TemplateContext) => `---
title: Pipeline Overview
description: End-to-end dataflow for ${ctx.branding.brandName}
---

# Pipeline Overview

<!-- ← CUSTOMIZE: Describe your specific pipeline -->

## Dataflow

Source → Index → Extract → Transfer → Validate → Destination

## Stages

### 1. Index Build

Build searchable catalog of source objects for efficient querying.

- Input: Source bucket/path scope
- Output: Index database with object metadata
- See: [Index Build](/content/pipeline/index-build)

### 2. Content Extraction

Inspect file content to derive routing fields (dates, IDs, categories).

- Input: Indexed objects
- Output: Enriched metadata with extracted fields
- See: [Content Extraction](/content/pipeline/extract)

### 3. Transfer / Reflow

Copy objects from source to destination with key rewriting based on extracted fields.

- Input: Enriched index with routing decisions
- Output: Files in destination structure
- See: [Transfer](/content/pipeline/transfer)

### 4. Validation

Verify completeness, deduplication, and data quality.

- Input: Destination state + source index
- Output: Validation report
- See: [Validation](/content/pipeline/validate)
`,
		},
		{
			path: "content/pipeline/index-build.md",
			content: (_ctx: TemplateContext) => `---
title: Index Build
description: Build searchable index of source objects
---

# Index Build

<!-- ← CUSTOMIZE: Replace with your index build process -->

## Objective

Build a searchable index of source objects for a defined scope.

## Prerequisites

- [ ] Source credentials configured
- [ ] Scope defined (sites, date range)
- [ ] Manifest prepared

## Procedure

1. Prepare manifest YAML
2. Run index build
3. Verify object count
4. Query to validate coverage

## Manifests

See [Manifest Templates](/content/reference/manifests/) for examples.

## Verification

\`\`\`bash
# Check index count
# ← CUSTOMIZE: your verification command
\`\`\`

Expected: object count matches source scope.
`,
		},
		{
			path: "content/pipeline/extract.md",
			content: (_ctx: TemplateContext) => `---
title: Content Extraction
description: Derive routing fields from file content
---

# Content Extraction

<!-- ← CUSTOMIZE: Replace with your extraction rules -->

## Objective

Derive routing fields from file content to enable correct placement.

## Configuration

<!-- Extraction rules: XPath, regex, JSON path -->

| Field | Source | Extraction Method |
|-------|--------|-------------------|
| date | File content | Regex / XPath |
| entity_id | Filename or content | Pattern match |
| category | Content analysis | Rules engine |

## Procedure

1. Prepare extraction config
2. Run content probe
3. Verify extracted fields
4. Feed results to transfer stage

## Verification

\`\`\`bash
# Spot-check extracted fields
# ← CUSTOMIZE: your verification command
\`\`\`
`,
		},
		{
			path: "content/pipeline/transfer.md",
			content: (_ctx: TemplateContext) => `---
title: Transfer / Reflow
description: Copy objects from source to destination with key rewriting
---

# Transfer / Reflow

<!-- ← CUSTOMIZE: Replace with your transfer configuration -->

## Objective

Copy objects from source to destination with key rewriting.

## Configuration

- Source and destination profiles
- Rewrite templates
- Collision policy
- Checkpoint/resume settings

## Procedure

1. Prepare reflow command
2. Dry-run first
3. Execute with checkpoint
4. Verify landing structure

## Dry Run

\`\`\`bash
# ← CUSTOMIZE: your dry-run command
\`\`\`

**Verify**: Output shows expected file count and destination paths.

## Execute

\`\`\`bash
# ← CUSTOMIZE: your transfer command with checkpoint
\`\`\`

## Resume from Checkpoint

If interrupted:

\`\`\`bash
# ← CUSTOMIZE: your resume command
\`\`\`
`,
		},
		{
			path: "content/pipeline/validate.md",
			content: (_ctx: TemplateContext) => `---
title: Validation
description: Verify pipeline output is complete and correct
---

# Validation

<!-- ← CUSTOMIZE: Replace with your validation checks -->

## Objective

Verify pipeline output is complete and correct.

## Checks

- [ ] Object count matches expected
- [ ] No duplicate files in destination
- [ ] Routing fields match destination paths
- [ ] No error records in output

## Procedure

1. Run validation report
2. Compare source count vs destination count
3. Check for duplicates
4. Verify sample of routing decisions

## Validation Report

\`\`\`bash
# ← CUSTOMIZE: your validation command
\`\`\`

## Common Issues

| Issue | Cause | Resolution |
|-------|-------|------------|
| Count mismatch | Filtered items or errors | Check error log |
| Duplicates | Collision policy | Review collision settings |
| Wrong paths | Extraction rules | Verify field mappings |
`,
		},
		// Sources section
		{
			path: "content/sources/index.md",
			content: (ctx: TemplateContext) => `---
title: Source Systems
description: Source data systems for ${ctx.branding.brandName}
---

# Source Systems

<!-- ← CUSTOMIZE: Add your source systems -->

| Source | Type | Auth | Documentation |
|--------|------|------|---------------|
| *source-name* | S3 / GCS / file | Profile / keys | [Details](./source-name) |

## Adding a New Source

1. Create a file in \`content/sources/\` describing the system
2. Document: connection details, auth profile, data format, schema
3. Update this index table
`,
		},
		// Destinations section
		{
			path: "content/destinations/index.md",
			content: (ctx: TemplateContext) => `---
title: Destinations
description: Target structures for ${ctx.branding.brandName}
---

# Destinations

<!-- ← CUSTOMIZE: Add your destination systems -->

| Destination | Type | Structure | Documentation |
|-------------|------|-----------|---------------|
| *dest-name* | S3 / GCS / file | date-first / entity-first | [Details](./dest-name) |

## Path Structure

<!-- ← CUSTOMIZE: Document your target path layout -->

\`\`\`
destination-root/
├── {year}/
│   ├── {month}/
│   │   ├── {entity-id}/
│   │   │   └── {filename}
\`\`\`

## Adding a New Destination

1. Create a file in \`content/destinations/\` describing the target
2. Document: path structure, naming conventions, access controls
3. Update this index table
`,
		},
		// Operations section
		{
			path: "content/operations/run-pipeline.md",
			content: (_ctx: TemplateContext) => `---
title: Run a Pipeline
description: Full pipeline execution procedure
---

# Run a Pipeline

<!-- ← CUSTOMIZE: Replace with your pipeline commands -->

## Prerequisites

- [ ] Source and destination credentials valid
- [ ] Index up to date for target scope
- [ ] Extraction config tested
- [ ] Dry-run completed

## Full Pipeline Execution

### Step 1: Index Build

\`\`\`bash
# ← CUSTOMIZE: your index build command
\`\`\`

**Verify**: Index count matches expected scope.

### Step 2: Content Probe

\`\`\`bash
# ← CUSTOMIZE: your extraction command
\`\`\`

**Verify**: Extracted fields look correct for sample objects.

### Step 3: Transfer Reflow

\`\`\`bash
# ← CUSTOMIZE: your transfer command
\`\`\`

**Verify**: Destination file count and structure.

### Step 4: Validate

\`\`\`bash
# ← CUSTOMIZE: your validation command
\`\`\`

**Verify**: Validation report shows no errors.

## Checkpoint / Resume

If interrupted, resume from checkpoint:

\`\`\`bash
# ← CUSTOMIZE: your resume command
\`\`\`

## Post-Run

- [ ] Review validation report
- [ ] Update pipeline status table in [Home](/)
- [ ] Log run in [Schedules](/content/operations/schedules)
`,
		},
		{
			path: "content/operations/schedules.md",
			content: (_ctx: TemplateContext) => `---
title: Schedules
description: Pipeline execution schedules
---

# Schedules

<!-- ← CUSTOMIZE: Add your pipeline schedules -->

| Pipeline | Frequency | Scope | Notes |
|----------|-----------|-------|-------|
| *pipeline-name* | Daily / Weekly / Ad hoc | *scope* | *notes* |

## Schedule Management

- Automated pipelines run via cron/scheduler
- Ad hoc runs documented here after execution
- See [Run a Pipeline](/content/operations/run-pipeline) for execution steps
`,
		},
		// Troubleshooting section
		{
			path: "content/troubleshooting/common-issues.md",
			content: (_ctx: TemplateContext) => `---
title: Common Issues
description: Troubleshooting guide for pipeline problems
---

# Common Issues

<!-- ← CUSTOMIZE: Add your pipeline-specific issues -->

## Authentication Expiry Mid-Pipeline

**Symptoms**:
- Pipeline fails partway through with auth errors
- "Access Denied" or "Token expired" in logs
- Partial results in destination

**Possible Causes**:
1. Source credentials expired during long-running job
2. Token refresh not configured
3. Session timeout shorter than pipeline duration

**Resolution**:

1. Check credential expiry:
   \`\`\`bash
   # ← CUSTOMIZE: your credential check command
   \`\`\`

2. Refresh credentials and resume from checkpoint
3. Consider longer-lived tokens for large scopes

**Prevention**: Configure token refresh or use service account credentials.

---

## Index Lock / Corruption

**Symptoms**:
- "Index locked" or "Database is locked" errors
- Index build hangs or returns stale data
- Concurrent pipeline runs fail

**Resolution**:

1. Check for other running pipeline processes
2. Release lock if safe:
   \`\`\`bash
   # ← CUSTOMIZE: your lock release command
   \`\`\`
3. If corrupted, rebuild index from scratch

---

## Duplicate Detection Conflicts

**Symptoms**:
- Validation reports unexpected duplicates
- Same file appears in multiple destination paths
- Object count exceeds expected

**Resolution**:

1. Review extraction rules — are routing fields unique?
2. Check collision policy (overwrite vs skip vs error)
3. Inspect duplicate pairs to find root cause

---

## Destination Collision Handling

**Symptoms**:
- Files overwritten unexpectedly
- "Collision" warnings in transfer log
- Missing files in destination

**Resolution**:

1. Review collision policy setting
2. Check if source contains genuine duplicates
3. Adjust rewrite template to produce unique keys
`,
		},
		// Reference section subdirectories
		{
			path: "content/reference/manifests/job-template.md",
			content: (_ctx: TemplateContext) => `---
title: Job Manifest Template
description: Template for pipeline job manifests
---

# Job Manifest Template

<!-- ← CUSTOMIZE: Replace with your manifest format -->

\`\`\`yaml
# Pipeline Job Manifest
job:
  name: "descriptive-job-name"
  pipeline: "pipeline-id"
  scope:
    # ← CUSTOMIZE: define your scope fields
    sites: []
    date_range:
      start: "YYYY-MM-DD"
      end: "YYYY-MM-DD"
  source:
    profile: "source-profile-name"
  destination:
    profile: "dest-profile-name"
  options:
    dry_run: false
    checkpoint: true
    collision: "skip"  # skip | overwrite | error
\`\`\`

## Fields

| Field | Required | Description |
|-------|----------|-------------|
| \`job.name\` | Yes | Human-readable job identifier |
| \`job.pipeline\` | Yes | Pipeline definition to execute |
| \`job.scope\` | Yes | What data to process |
| \`job.source.profile\` | Yes | Source credential/connection profile |
| \`job.destination.profile\` | Yes | Destination credential/connection profile |
| \`job.options.dry_run\` | No | Preview without writing (default: false) |
| \`job.options.checkpoint\` | No | Enable resume capability (default: true) |
| \`job.options.collision\` | No | How to handle existing files (default: skip) |
`,
		},
		{
			path: "content/reference/field-mappings/mapping-template.md",
			content: (_ctx: TemplateContext) => `---
title: Field Mapping Template
description: Source field → destination field documentation
---

# Field Mapping: [Source System]

<!-- ← CUSTOMIZE: Document your field mappings -->

## Overview

| Source Field | Destination Field | Transform | Notes |
|-------------|-------------------|-----------|-------|
| \`source.field_a\` | \`dest.field_x\` | Direct copy | |
| \`source.field_b\` | \`dest.field_y\` | Date format | YYYY-MM-DD → YYYYMMDD |
| \`source.field_c\` | \`dest.field_z\` | Lookup table | See mapping table below |

## Transform Rules

### Date Formatting

Input: \`2024-03-15\` → Output: \`20240315\`

### Lookup Tables

| Source Value | Destination Value |
|-------------|-------------------|
| \`type_a\` | \`A\` |
| \`type_b\` | \`B\` |
`,
		},
		{
			path: "content/reference/metrics/pipeline-kpis.md",
			content: (_ctx: TemplateContext) => `---
title: Pipeline KPIs
description: Key performance indicators for pipeline operations
---

# Pipeline KPIs

<!-- ← CUSTOMIZE: Add your metrics and dashboard links -->

## Key Metrics

| Metric | Target | Dashboard |
|--------|--------|-----------|
| Pipeline success rate | > 99% | [Link] |
| Average run duration | < X hours | [Link] |
| Object throughput | > X/hour | [Link] |
| Error rate | < 0.1% | [Link] |

## SLAs

| Pipeline | Frequency | Completion Window | Escalation |
|----------|-----------|-------------------|------------|
| *pipeline-name* | Daily | 4 hours | Page on-call |

## Alerting

| Alert | Warning | Critical | Action |
|-------|---------|----------|--------|
| Run duration | > 2x average | > 4x average | Investigate |
| Error count | > 10 | > 100 | Check logs |
| Stale index | > 24h | > 48h | Rebuild |
`,
		},
		{
			path: "content/reference/checklists/pre-run.md",
			content: (_ctx: TemplateContext) => `---
title: Pre-Run Checklist
description: Verification checklist before running a pipeline
---

# Pre-Run Checklist

<!-- ← CUSTOMIZE: Adapt to your pipeline process -->

## Credentials

- [ ] Source credentials valid and not expiring soon
- [ ] Destination credentials valid
- [ ] Service account permissions verified

## Scope

- [ ] Scope definition reviewed (sites, date range)
- [ ] Expected object count estimated
- [ ] No overlapping concurrent runs

## Configuration

- [ ] Manifest YAML validated
- [ ] Extraction rules tested on sample
- [ ] Destination path template verified
- [ ] Collision policy appropriate for this run

## Environment

- [ ] Sufficient disk space for index
- [ ] Network connectivity to source and destination
- [ ] Monitoring and alerting configured

## Go/No-Go

| Criteria | Status |
|----------|--------|
| Credentials valid | ⬜ |
| Scope defined | ⬜ |
| Config tested | ⬜ |
| Dry-run passed | ⬜ |

**Decision**: ⬜ GO / ⬜ NO-GO
`,
		},
		{
			path: "content/reference/contacts/directory.md",
			content: (ctx: TemplateContext) => `---
title: Contact Directory
description: Team and vendor contacts for ${ctx.branding.brandName}
---

# Contact Directory

<!-- ← CUSTOMIZE: Add your team and vendor contacts -->

## Pipeline Team

| Role | Contact | Responsibility |
|------|---------|----------------|
| Pipeline Lead | [Name/Email] | Architecture, operations |
| Data Engineer | [Name/Email] | Source/destination config |
| On-Call | [PagerDuty/Slack] | Incident response |

## Vendor Contacts

| Vendor | Type | Contact |
|--------|------|---------|
| Cloud Provider | Support | [Portal/Email] |
| Data Source | Support | [Portal/Email] |

## Escalation

For pipeline failures during business hours, contact the Pipeline Lead.
For off-hours incidents, page on-call via PagerDuty.
`,
		},
		// CUSTOMIZING.md
		{
			path: "CUSTOMIZING.md",
			content: (ctx: TemplateContext) => `---
template: pipeline
template_version: 1
created: ${new Date().toISOString().split("T")[0]}
---

# Customizing ${ctx.branding.siteName}

This guide helps you (and AI assistants) understand how to customize this pipeline operations site.

## Site Structure

\`\`\`
${ctx.name}/
├── site.yaml              # Site configuration (sections, branding)
├── theme.yaml             # Theme customization (create if needed)
├── index.md               # Home page with pipeline status
├── CUSTOMIZING.md         # This file
├── content/
│   ├── pipeline/          # Pipeline stage documentation
│   ├── sources/           # Source data systems
│   ├── destinations/      # Target structures
│   ├── operations/        # Run procedures, schedules
│   ├── troubleshooting/   # Problem → solution guides
│   └── reference/         # Supporting materials
│       ├── manifests/     # Job manifest templates
│       ├── field-mappings/ # Source → destination mappings
│       ├── metrics/       # KPIs, SLAs, dashboards
│       ├── checklists/    # Pre-run, post-run checklists
│       └── contacts/      # Team contacts, escalation
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
  - name: "Pipeline"
    path: "content/pipeline"
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

## Adding Content

### New Pipeline Stage

1. Create file in \`content/pipeline/\`:
   \`\`\`
   content/pipeline/my-stage.md
   \`\`\`

2. Use the stage format:
   \`\`\`markdown
   ---
   title: Stage Name
   ---

   # Stage Name

   ## Objective
   What this stage accomplishes.

   ## Prerequisites
   - [ ] Required items

   ## Procedure
   1. Step with command
   2. Verification step

   ## Verification
   How to confirm the stage completed correctly.
   \`\`\`

3. Update the overview in \`content/pipeline/overview.md\`

### New Source System

1. Create file in \`content/sources/\`:
   \`\`\`
   content/sources/my-source.md
   \`\`\`

2. Document: connection details, auth profile, data format, schema
3. Update the index table in \`content/sources/index.md\`

### New Destination

1. Create file in \`content/destinations/\`:
   \`\`\`
   content/destinations/my-destination.md
   \`\`\`

2. Document: path structure, naming conventions, access controls
3. Update the index table in \`content/destinations/index.md\`

### Creating Manifest Templates

1. Create in \`content/reference/manifests/\`:
   \`\`\`
   content/reference/manifests/my-job.md
   \`\`\`

2. Include the full YAML template with field descriptions
3. Document required vs optional fields

### New Troubleshooting Guide

Follow the pattern: Symptoms → Causes → Resolution → Prevention

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
See [Pipeline Overview](/content/pipeline/overview) for the full dataflow.
\`\`\`

### External Links

\`\`\`markdown
See [Vendor Documentation](https://vendor.com/docs).
\`\`\`

## Document Conventions

### Pipeline Stages

- Start with Objective (what/why)
- List Prerequisites as checkboxes
- Number steps with verification
- Include expected outputs

### Troubleshooting

- Lead with Symptoms (what user sees)
- List Possible Causes
- Provide step-by-step Resolution
- Include Prevention guidance

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
