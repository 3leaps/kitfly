---
title: "Recipe: Vercel"
description: "Deploy `dist/` to Vercel with CDN and custom domains"
last_updated: "2026-02-12"
---

# Recipe: Vercel

Vercel is a good choice when you want fast global CDN, a clean dashboard, and simple "push to deploy" with zero config.

If you're already using Vercel for other projects, this is an easy add.

## Prerequisites

- A Vercel account
- (For CLI deploys) `vercel` CLI installed: `npm i -g vercel`

## Build

```bash
make build
```

Your deployable output is the `dist/` folder.

## Deploy (simplest: drag-and-drop or CLI)

### Option A: CLI deploy (quick)

From your project root:

```bash
vercel deploy dist/
```

This uploads `dist/` and gives you a preview URL. To deploy to production:

```bash
vercel deploy dist/ --prod
```

### Option B: Connect a Git repo (repeatable)

1. Import your repo in Vercel's dashboard
2. Set the following in project settings:
   - **Build Command**: `make build`
   - **Output Directory**: `dist`
   - **Install Command**: `bun install`

Now every push to `main` triggers a production deploy. Pull requests get preview deploys automatically.

## Configuration file (optional)

If you prefer config-as-code, add `vercel.json` to your project root:

```json
{
  "buildCommand": "make build",
  "outputDirectory": "dist",
  "installCommand": "bun install",
  "framework": null
}
```

Setting `"framework": null` tells Vercel not to auto-detect a framework — Kitfly is not a framework Vercel recognizes, so this avoids unexpected behavior.

## Custom domain (DNS basics)

Typical pattern:

- `docs.example.com` → **CNAME** to `cname.vercel-dns.com`

Vercel's dashboard walks you through adding custom domains. HTTPS is provisioned automatically.

## Caching (why you might not see changes)

If you deploy and your browser still shows old content:

- hard refresh (Shift+Reload)
- try an incognito window
- Vercel CDN cache usually invalidates on deploy, but DNS propagation can take a few minutes

## Verify + Rollback

- Verify: load the site, click a few pages, hard refresh
- Rollback: promote a previous deployment from Vercel's dashboard (Deployments → three-dot menu → Promote to Production)

See: [Preflight and Rollback](../preflight.html)
