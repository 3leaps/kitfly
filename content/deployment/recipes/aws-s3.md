---
title: "Recipe: AWS S3"
description: "Static hosting on S3 (sync `dist/`)"
last_updated: "2026-02-12"
---

# Recipe: AWS S3

S3 is a solid choice when you’re already in AWS.

If you’re not already on AWS, Netlify or GitHub Pages is usually faster to get right.

## Prerequisites

- An AWS account
- AWS CLI installed (`aws`)
- A bucket to host your site

## Secrets (important)

If you use access keys locally, keep them out of git and prefer least-privilege IAM.

See:
- [Secrets and Environment Variables](content/deployment/secrets-and-env-vars.html)

## Build

```bash
make build
```

## Deploy (sync `dist/`)

```bash
aws s3 sync dist/ "s3://YOUR_BUCKET_NAME/" --delete
```

Tip: `--delete` keeps the bucket from accumulating old files when pages change names.

## DNS basics

Common patterns:
- `docs.example.com` → **CNAME** to your CDN/domain front (recommended)
- Apex/root domains are usually handled via a CDN (CloudFront) or DNS “ALIAS” features

## About “S3 static website hosting”

AWS has an S3 “website hosting” mode. It works, but many teams prefer putting S3 behind CloudFront (better HTTPS/custom domain story, caching controls).

If you’re not sure: start with the simplest approach your org already uses.

## Verify + Rollback

- Verify: load the site, click a few pages, hard refresh
- Rollback: re-sync the previous build output (or use versioning if you enabled it)

See: [Preflight and Rollback](content/deployment/preflight.html)
