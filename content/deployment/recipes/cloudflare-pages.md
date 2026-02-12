---
title: "Recipe: Cloudflare Pages"
description: "Beginner-friendly Cloudflare hosting for static `dist/` output"
last_updated: "2026-02-12"
---

# Recipe: Cloudflare Pages

Cloudflare Pages is a strong default if you want Cloudflare to “just host the static site” with CDN performance and a simple custom domain story.

If you were looking at Cloudflare R2: Pages is usually easier. R2 is object storage and is best treated as an advanced building block.

See also:
- [Recipe: Cloudflare R2](content/deployment/recipes/cloudflare-r2.html)

## Prerequisites

- A Cloudflare account
- (Recommended) Your domain on Cloudflare DNS

## Build

```bash
make build
```

Your deployable output is the `dist/` folder.

## Deploy (two common workflows)

### Option A: Connect a Git repo (repeatable)

1. Create a new Pages project in Cloudflare
2. Connect your repo
3. Set build command: `make build`
4. Set output/publish directory: `dist`

Now “push to main” becomes “deploy the site”.

### Option B: Upload static output (quick)

If you just want a link quickly:
1. Build locally (`make build`)
2. Upload the `dist/` output in the Pages UI

## Custom domain (DNS basics)

Typical pattern:
- `docs.example.com` → **CNAME** to the Pages target Cloudflare provides

If you use Cloudflare DNS, Pages will usually guide you through the exact record to create.

## Verify + Rollback

- Verify: load the site, click a few pages, hard refresh
- Rollback: redeploy the previous build (or revert the commit if you deploy from git)

See: [Preflight and Rollback](content/deployment/preflight.html)

