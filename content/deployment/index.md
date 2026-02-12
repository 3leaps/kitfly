---
title: "Deployment"
description: "Publish a Kitfly site safely (with beginner-friendly guardrails)"
last_updated: "2026-02-12"
---

# Deployment

Kitfly builds a static site. Deployment is just “upload the `dist/` folder”.

Before you pick a host, read this once:

## Safety first (please read)

### Do

- Keep secrets out of your repo. Use environment variables or your host’s secret store.
- Use least-privilege credentials (scoped token, minimal permissions).
- Deploy from a clean build: `make build` (or `bun run build`) and upload `dist/`.
- Keep a rollback path: retain the previous `dist/` somewhere you can restore quickly.

### Don’t

- Don’t commit `.env` files or cloud credentials.
- Don’t “just make the bucket public” unless you understand the blast radius.
- Don’t deploy from a random working tree state you can’t reproduce.

Next: read [Secrets and Environment Variables](content/deployment/secrets-and-env-vars.html) and [Preflight](content/deployment/preflight.html).

---

## Build vs bundle (two “shipping” modes)

Kitfly has two ways to get your writing out into the world:

- **Host it**: `kitfly build` → upload the `dist/` folder to a static host (the rest of this section).
- **Send it**: `kitfly bundle` → one HTML file you can email/Slack/upload (offline-friendly).

If you’re not sure which you want, start with **bundle** for internal reviews and **build** when you want a permanent link.

## Which host should I pick?

Use this as a quick menu:

### Easiest (beginner-friendly)

- **Cloudflare Pages** — a clean “static site host” with great CDN + custom domains.  
  Recipe: [Cloudflare Pages](content/deployment/recipes/cloudflare-pages.html)

- **Netlify** — simplest “upload `dist/`” flow, easy custom domains.  
  Recipe: [Netlify](content/deployment/recipes/netlify.html)

- **GitHub Pages** — great if your docs live in GitHub already.  
  Recipe: [GitHub Pages](content/deployment/recipes/github-pages.html)

### If you’re already on a platform

- **AWS S3** — straightforward static hosting; best if your org is already in AWS.  
  Recipe: [AWS S3](content/deployment/recipes/aws-s3.html)

- **Cloudflare R2** — advanced; object storage that you usually put behind Pages/Workers.  
  Recipe: [Cloudflare R2](content/deployment/recipes/cloudflare-r2.html)

### “I want an app host”

- **Fly.io** — good when you want a small always-on service (private/internal, auth, etc.).  
  Recipe: [Fly.io](content/deployment/recipes/fly-io.html)

---

## DNS basics (quick primer)

If you bring your own domain, you’ll do one of these:

- **Subdomain** (`docs.example.com`) → usually a **CNAME** to your host target.
- **Apex/root** (`example.com`) → often **A/AAAA** records, or an “ALIAS/ANAME” feature (varies by DNS provider).

Quick definitions:
- **A** = IPv4 address record
- **AAAA** = IPv6 address record
- **CNAME** = alias one name to another name

Each recipe calls out the common DNS pattern for that host.

---

## Common workflow (host-agnostic)

1. Build: `make build` (outputs `dist/`)
2. Preview locally (optional): open the built site in a browser
3. Deploy: upload/sync `dist/`
4. Verify: load the site, click around, hard refresh
5. Roll back if needed: redeploy the previous `dist/`

If you’re not sure what an environment variable is (or how to set one), see:
- [Reference: Environment Variables](content/reference/environment-variables.html)
