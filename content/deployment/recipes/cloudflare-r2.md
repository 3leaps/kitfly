---
title: "Recipe: Cloudflare R2"
description: "Advanced: publish `dist/` using Cloudflare storage and edge routing"
last_updated: "2026-02-12"
---

# Recipe: Cloudflare R2

This recipe is intentionally labeled **advanced**.

If you want the simplest Cloudflare experience for a static site, Cloudflare Pages is usually the easiest path:

- [Recipe: Cloudflare Pages](cloudflare-pages.html)

R2 is great when you want object storage as your origin and you're comfortable wiring edge routing/caching.

## When to use this

- You're already using Cloudflare (DNS, Workers, caching)
- You want `dist/` stored as objects and served at the edge

## Pages vs R2 (which should I choose?)

### Choose Cloudflare Pages when…

- You want a "deploy and host" product for static sites
- You're fine with "connect a repo and publish `dist/`" as your workflow
- You want custom domains + HTTPS without a lot of plumbing

### Choose Cloudflare R2 when…

- You specifically want object storage as the source of truth for site files
- You already have (or want) a Worker/edge layer in front
- You care about storing and serving lots of assets and want S3-like primitives

## High-level shape

1. Build your site to `dist/`
2. Upload `dist/` to an R2 bucket
3. Serve it via an edge layer (typically a Worker) and attach your domain

Important: R2 is object storage, not "a website host" by itself. You usually need something in front of it to handle requests and return the right file for a path.

## Prerequisites

- A Cloudflare account
- A domain on Cloudflare DNS (recommended)
- `wrangler` CLI installed: `npm i -g wrangler`
- An R2 bucket created (via dashboard or `wrangler r2 bucket create <name>`)

## Build

```bash
make build
```

## Upload `dist/` to R2

### Using wrangler (recommended for CI/CD)

Upload individual files:

```bash
# Upload all files from dist/ to the bucket
for file in $(find dist -type f); do
  key="${file#dist/}"
  wrangler r2 object put "$KITFLY_CF_R2_BUCKET/$key" --file="$file"
done
```

Or if you prefer a sync-like approach, use the rclone tool with R2's S3-compatible endpoint:

```bash
rclone sync dist/ "r2:$KITFLY_CF_R2_BUCKET/" \
  --s3-provider=Cloudflare \
  --s3-access-key-id="$KITFLY_CF_R2_ACCESS_KEY_ID" \
  --s3-secret-access-key="$KITFLY_CF_R2_SECRET_ACCESS_KEY" \
  --s3-endpoint="https://$KITFLY_CF_R2_ACCOUNT_ID.r2.cloudflarestorage.com"
```

### Using the dashboard

Fine for small sites, but manual. Upload files in the R2 bucket view.

## Serving: Worker in front of R2

A minimal Worker to serve files from R2:

```javascript
// wrangler.toml:
// [[r2_buckets]]
// binding = "BUCKET"
// bucket_name = "your-bucket-name"

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let key = url.pathname.slice(1) || "index.html";
    if (key.endsWith("/")) key += "index.html";

    const object = await env.BUCKET.get(key);
    if (!object) return new Response("Not found", { status: 404 });

    const headers = new Headers();
    headers.set(
      "Content-Type",
      object.httpMetadata?.contentType || "text/html",
    );
    return new Response(object.body, { headers });
  },
};
```

Deploy the Worker with `wrangler deploy` and attach your custom domain via the Cloudflare dashboard.

## Secrets

Keep R2 credentials in environment variables and **don't** commit them. See:

- [Secrets and Environment Variables](../secrets-and-env-vars.html)

## Caching (don't fight it)

Cloudflare will cache aggressively if you ask it to. That's great for docs sites, but it can confuse first-time deploys.

If you deploy and still see old content:

- hard refresh (Shift+Reload)
- try an incognito window
- wait a minute
- or purge cache via the Cloudflare dashboard / API (see [Preflight: Cache Invalidation](../preflight.html))

## DNS basics

Typical pattern:

- Use a **subdomain** like `docs.example.com`
- Point it at your Worker using Cloudflare's "Custom Domains for Workers" feature

HTTPS is handled automatically when using Cloudflare DNS.

## Verify

- Load the site from your custom domain
- Hard refresh once (caching can make you think deploy didn't work)
- Click 3–5 pages and confirm assets load
- Confirm the HTTPS lock icon

## Rollback

Rollback options:

- re-upload the previous `dist/` objects
- or switch your Worker routing back to a prior bucket/prefix

See: [Preflight and Rollback](../preflight.html)
