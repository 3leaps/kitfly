---
title: "Recipe: Cloudflare R2"
description: "Advanced: publish `dist/` using Cloudflare storage and edge routing"
last_updated: "2026-02-12"
---

# Recipe: Cloudflare R2

This recipe is intentionally labeled **advanced**.

If you want the simplest Cloudflare experience for a static site, Cloudflare Pages is usually the easiest path. R2 is great when you want object storage as your origin and you’re comfortable wiring edge routing/caching.

## When to use this

- You’re already using Cloudflare (DNS, Workers, caching)
- You want `dist/` stored as objects and served at the edge

## High-level shape

1. Build your site to `dist/`
2. Upload `dist/` to an R2 bucket
3. Serve it via an edge layer (typically a Worker) and attach your domain

Important: R2 is object storage, not “a website host” by itself. You usually need something in front of it to handle requests and return the right file for a path.

## Prerequisites

- A Cloudflare account
- A domain on Cloudflare DNS (recommended)
- A way to upload to R2 (Cloudflare dashboard or `wrangler`)

## Build

```bash
make build
```

## Upload `dist/` to R2

Upload methods vary. Pick one:

- **Dashboard upload**: fine for small sites, manual
- **CLI upload**: best for repeatable deploys

If you use CLI tooling, keep credentials in environment variables and **don’t** commit them. See:
- [Secrets and Environment Variables](content/deployment/secrets-and-env-vars.html)

## Caching (don’t fight it)

Cloudflare will cache aggressively if you ask it to. That’s great for docs sites, but it can confuse first-time deploys.

If you deploy and still see old content:
- hard refresh (Shift+Reload)
- try an incognito window
- wait a minute

## DNS basics

Typical pattern:
- Use a **subdomain** like `docs.example.com`
- Point it at your edge entrypoint (Worker/Pages) using the provider’s instructions

## Verify

- Load the site from your custom domain
- Hard refresh once (caching can make you think deploy didn’t work)
- Click 3–5 pages and confirm assets load

## Rollback

Rollback options:
- re-upload the previous `dist/` objects
- or switch your edge routing back to the prior bucket/prefix

See: [Preflight and Rollback](content/deployment/preflight.html)
