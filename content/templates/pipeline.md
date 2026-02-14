---
title: Pipeline Template
description: Data pipeline operations with stages, sources, destinations, and manifests
---

# Pipeline Template

The `pipeline` template creates a structured site for data pipeline operations. It extends `minimal` with sections designed for teams that build, run, and maintain data pipelines — index builds, content extraction, transfer/reflow, and validation.

## When to Use

- Data pipeline operational documentation
- ETL/ELT process runbooks
- Data migration projects
- Batch processing operations
- Any workflow with sequential stages moving data from sources to destinations

## What You Get

Everything from `minimal`, plus:

```
my-pipeline/
├── site.yaml              # Configured with pipeline sections
├── index.md               # Pipeline status dashboard with quick links
├── CUSTOMIZING.md         # How to customize (AI + human friendly)
├── content/
│   ├── pipeline/
│   │   ├── overview.md          # End-to-end dataflow
│   │   ├── index-build.md       # Index build stage
│   │   ├── extract.md           # Content extraction stage
│   │   ├── transfer.md          # Transfer / reflow stage
│   │   └── validate.md          # Validation stage
│   ├── sources/
│   │   └── index.md             # Source system catalog
│   ├── destinations/
│   │   └── index.md             # Destination catalog
│   ├── operations/
│   │   ├── run-pipeline.md      # Full execution procedure
│   │   └── schedules.md         # Pipeline schedule table
│   ├── troubleshooting/
│   │   └── common-issues.md     # Pipeline-specific issues
│   └── reference/
│       ├── manifests/
│       │   └── index.md         # Job manifest YAML templates
│       ├── field-mappings/
│       │   └── index.md         # Source → destination mappings
│       ├── metrics/
│       │   └── index.md         # Pipeline KPIs and SLAs
│       ├── checklists/
│       │   └── pre-run.md       # Pre-run verification
│       └── contacts/
│           └── directory.md     # Team contacts and escalation
└── ...
```

## Sections

| Section             | Purpose                     | Typical Content                                                   |
| ------------------- | --------------------------- | ----------------------------------------------------------------- |
| **Pipeline**        | Core dataflow documentation | Stage definitions, data movement, processing logic                |
| **Sources**         | Input systems               | Connection details, schemas, auth profiles, data formats          |
| **Destinations**    | Output systems              | Target structures, path layouts, landing zones                    |
| **Operations**      | Run procedures              | Execution steps, schedules, checkpoint/resume                     |
| **Troubleshooting** | Problem resolution          | Auth expiry, index locks, duplicate conflicts, collision handling |
| **Reference**       | Supporting materials        | Manifests, field mappings, metrics, checklists, contacts          |

### Pipeline vs. Runbook

Both are operational templates, but they serve different shapes of work:

| Aspect              | Runbook                          | Pipeline                                 |
| ------------------- | -------------------------------- | ---------------------------------------- |
| **Focus**           | Service operations               | Data movement                            |
| **Structure**       | Procedures + incidents           | Sequential stages + sources/destinations |
| **Key question**    | "What do I do when X breaks?"    | "How does data flow from A to B?"        |
| **Reference model** | Interfaces, contacts, checklists | Manifests, field mappings, metrics       |

## Usage

```bash
kitfly init data-ops --template pipeline
kitfly init data-ops --template pipeline --brand "Data Platform"

# With AI assistance instrumentation
kitfly init data-ops --template pipeline --standalone --ai-assist
```

## The Pipeline Section

The core of this template. Each stage is documented with:

- **Objective** — what the stage accomplishes
- **Prerequisites** — what must be in place before running
- **Procedure** — step-by-step execution
- **Verification** — how to confirm success

The default stages follow a common data pipeline pattern:

```
Source → Index Build → Content Extraction → Transfer/Reflow → Validation → Destination
```

Adapt these to your actual pipeline. Add, remove, or rename stages as needed.

## Growing Your Pipeline Docs

As your pipeline matures, consider expanding:

**Multiple pipelines** — add subdirectories under `content/pipeline/`:

```
content/pipeline/
├── overview.md
├── daily-sync/
│   ├── index.md
│   ├── extract.md
│   └── validate.md
└── quarterly-migration/
    ├── index.md
    └── stages.md
```

The sidebar automatically organizes these into collapsible groups — each subdirectory becomes an expandable section in the navigation.

**Multiple sources/destinations** — add a page per system:

```
content/sources/
├── index.md           # Catalog table
├── salesforce.md      # Source details
└── data-warehouse.md  # Source details
```

## Example Use Cases

**Cloud Data Migration**

- Pipeline: S3 scan → content probe → key rewrite → validation
- Sources: AWS S3 buckets with legacy key structure
- Destinations: GCS with date-partitioned layout
- Operations: Weekly full sync, daily incremental
- Reference/Manifests: Job definitions per source bucket

**ETL for Analytics**

- Pipeline: Extract from APIs → transform/enrich → load to warehouse
- Sources: REST APIs, SFTP drops, webhook events
- Destinations: Snowflake tables, Parquet files in S3
- Troubleshooting: Rate limits, schema drift, partial loads
- Reference/Metrics: Row counts, freshness SLAs, error rates
