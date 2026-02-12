---
title: "Preflight and Rollback"
description: "A beginner-safe checklist before you publish"
last_updated: "2026-02-12"
---

# Preflight and Rollback

This page is intentionally simple. The goal is: publish safely, and be able to undo a bad deploy fast.

## Preflight checklist

### 1) Confirm what you're deploying

- You have a single folder you will deploy: `dist/`
- You know which source folder produced it (your docroot)

### 2) Build clean

From your site root:

```bash
make build
```

Or:

```bash
bun run build
```

Expected: `dist/` exists and contains `index.html` plus assets.

### 3) Sanity check the output

- Open the built site and click 3–5 pages
- Check images load
- Check code blocks render
- Toggle dark mode (if your theme supports it)

### 4) Decide your URL and DNS shape

- If you can, start with a **subdomain** like `docs.example.com` (simpler DNS + easier to move later).
- Keep "apex/root" (`example.com`) for your main marketing site unless you have a reason.
- Avoid subdirectory paths (`example.com/docs/`) — Kitfly currently assumes root-level hosting.

### 5) Verify HTTPS

After your first deploy, confirm:

- The site loads over `https://` (not just `http://`)
- The browser shows a lock icon (valid certificate)
- If your host offers "force HTTPS" or "redirect HTTP → HTTPS", enable it

All hosts in the [deployment recipes](.) provision HTTPS automatically (usually via Let's Encrypt). You just need to verify it's working.

### 6) Confirm secrets handling (if any)

Kitfly build output is static. Most deployments need **no secrets**.

If your deployment uses credentials (AWS keys, Netlify token, etc.):

- store them in environment variables or your host's secret store
- keep them out of git

See: [Secrets and Environment Variables](secrets-and-env-vars.html)

---

## Rollback plan (simple and reliable)

Pick one of these before you deploy:

### Option A: Keep the previous `dist/` folder

- Copy `dist/` to a dated folder before deploying:
  - `dist-backup-YYYY-MM-DD/`
- If something breaks, deploy the backup folder again.

### Option B: Use a "previous" deployment on your host

Many hosts keep deploy history. If they do:

- confirm you can re-promote a prior deploy
- confirm how long deploy history is retained

---

## Common failure modes

- **Wrong folder uploaded** (not `dist/`)
- **Old build** (you forgot to rebuild after edits)
- **DNS not updated** (domain points somewhere else)
- **Aggressive caching** (you deployed, but the browser/CDN serves old content)
- **HTTPS not provisioned yet** (some hosts take a few minutes to issue the cert)

If you suspect caching:

- hard refresh (Shift+Reload)
- try a private/incognito window
- wait a few minutes (some CDNs take time)

---

## Cache invalidation (for CI/CD pipelines)

If you deploy via automation and need to force-clear CDN caches, here are the common commands:

### AWS CloudFront

```bash
aws cloudfront create-invalidation \
  --distribution-id "$KITFLY_AWS_CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"
```

### Cloudflare (Pages or R2 behind Workers)

Cloudflare Pages automatically invalidates on deploy. If you use R2 with a custom Worker and need to purge:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$KITFLY_CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $KITFLY_CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### Netlify

Netlify invalidates automatically on every deploy. No manual purge needed.

### Vercel

Vercel invalidates CDN cache on deploy. No manual purge needed.
