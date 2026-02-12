---
title: "Recipe: Cloudflare Pages"
description: "Beginner-friendly Cloudflare hosting for static `dist/` output"
last_updated: "2026-02-12"
---

# Recipe: Cloudflare Pages

Cloudflare Pages is a strong default if you want Cloudflare to "just host the static site" with CDN performance and a simple custom domain story.

If you were looking at Cloudflare R2: Pages is usually easier. R2 is object storage and is best treated as an advanced building block.

See also:

- [Recipe: Cloudflare R2](cloudflare-r2.html)

## Prerequisites

- A Cloudflare account
- (Recommended) Your domain on Cloudflare DNS
- (For CLI deploys) `wrangler` installed: `npm i -g wrangler`

## Build

```bash
make build
```

Your deployable output is the `dist/` folder.

## Deploy (three common workflows)

### Option A: Connect a Git repo (repeatable)

1. Create a new Pages project in Cloudflare
2. Connect your repo
3. Set build command: `make build`
4. Set output/publish directory: `dist`

Now "push to main" becomes "deploy the site".

Note: Cloudflare's build environment may not have Bun pre-installed. If the build fails, set the environment variable `BUN_VERSION=1` in the Pages project settings, or use Option B/C instead.

### Option B: Upload static output (quick, via dashboard)

If you just want a link quickly:

1. Build locally (`make build`)
2. Upload the `dist/` output in the Pages UI

### Option C: Deploy via CLI (repeatable, no git integration)

```bash
make build
npx wrangler pages deploy dist/ --project-name=your-project-name
```

This is useful for CI/CD pipelines or when you don't want to connect a git repo.

## Custom domain (DNS basics)

Typical pattern:

- `docs.example.com` → **CNAME** to the Pages target Cloudflare provides

If you use Cloudflare DNS, Pages will usually guide you through the exact record to create. HTTPS is provisioned automatically.

## Verify + Rollback

- Verify: load the site, click a few pages, hard refresh, confirm HTTPS lock icon
- Rollback: redeploy the previous build from Pages dashboard (or revert the commit if you deploy from git)

See: [Preflight and Rollback](../preflight.html)
