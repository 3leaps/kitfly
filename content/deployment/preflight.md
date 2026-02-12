---
title: "Preflight and Rollback"
description: "A beginner-safe checklist before you publish"
last_updated: "2026-02-12"
---

# Preflight and Rollback

This page is intentionally simple. The goal is: publish safely, and be able to undo a bad deploy fast.

## Preflight checklist

### 1) Confirm what you’re deploying

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
- Keep “apex/root” (`example.com`) for your main marketing site unless you have a reason.

### 5) Confirm secrets handling (if any)

Kitfly build output is static. Most deployments need **no secrets**.

If your deployment uses credentials (AWS keys, Netlify token, etc.):
- store them in environment variables or your host’s secret store
- keep them out of git

See: [Secrets and Environment Variables](content/deployment/secrets-and-env-vars.html)

---

## Rollback plan (simple and reliable)

Pick one of these before you deploy:

### Option A: Keep the previous `dist/` folder

- Copy `dist/` to a dated folder before deploying:
  - `dist-backup-YYYY-MM-DD/`
- If something breaks, deploy the backup folder again.

### Option B: Use a “previous” deployment on your host

Many hosts keep deploy history. If they do:
- confirm you can re-promote a prior deploy
- confirm how long deploy history is retained

---

## Common failure modes

- **Wrong folder uploaded** (not `dist/`)
- **Old build** (you forgot to rebuild after edits)
- **DNS not updated** (domain points somewhere else)
- **Aggressive caching** (you deployed, but the browser/CDN serves old content)

If you suspect caching:
- hard refresh (Shift+Reload)
- try a private/incognito window
- wait a few minutes (some CDNs take time)

