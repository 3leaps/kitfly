---
title: "Deployment"
description: "Publish a Kitfly site safely (with beginner-friendly guardrails)"
last_updated: "2026-02-12"
---

# Deployment

Kitfly builds a static site. Deployment is just "upload the `dist/` folder".

Before you pick a host, read this once:

## Safety first (please read)

### Do

- Keep secrets out of your repo. Use environment variables or your host's secret store.
- Use least-privilege credentials (scoped token, minimal permissions).
- Deploy from a clean build: `make build` (or `bun run build`) and upload `dist/`.
- Keep a rollback path: retain the previous `dist/` somewhere you can restore quickly.
- Verify HTTPS works after your first deploy (most hosts provide it free).

### Don't

- Don't commit `.env` files or cloud credentials.
- Don't "just make the bucket public" unless you understand the blast radius.
- Don't deploy from a random working tree state you can't reproduce.

Next: read [Secrets and Environment Variables](deployment/secrets-and-env-vars.html) and [Preflight](deployment/preflight.html).

---

## Build vs bundle (two "shipping" modes)

Kitfly has two ways to get your writing out into the world:

- **Host it**: `kitfly build` → upload the `dist/` folder to a static host (the rest of this section).
- **Send it**: `kitfly bundle` → one HTML file you can email/Slack/upload (offline-friendly).

If you're not sure which you want, start with **bundle** for internal reviews and **build** when you want a permanent link.

## Which host should I pick?

Use this as a quick menu:

### Easiest (beginner-friendly)

- **Cloudflare Pages** — a clean "static site host" with great CDN + custom domains.
  Recipe: [Cloudflare Pages](deployment/recipes/cloudflare-pages.html)

- **Netlify** — simplest "upload `dist/`" flow, easy custom domains.
  Recipe: [Netlify](deployment/recipes/netlify.html)

- **GitHub Pages** — great if your docs live in GitHub already.
  Recipe: [GitHub Pages](deployment/recipes/github-pages.html)

- **Vercel** — fast CDN, clean UI, good "push to deploy" experience.
  Recipe: [Vercel](deployment/recipes/vercel.html)

### If you're already on a platform

- **AWS S3** — straightforward static hosting; best if your org is already in AWS.
  Recipe: [AWS S3](deployment/recipes/aws-s3.html)

- **Cloudflare R2** — advanced; object storage that you usually put behind Pages/Workers.
  Recipe: [Cloudflare R2](deployment/recipes/cloudflare-r2.html)

### "I want an app host"

- **Fly.io** — good when you want a small always-on service (private/internal, auth, etc.).
  Recipe: [Fly.io](deployment/recipes/fly-io.html)

---

## Base path / subdirectory hosting

Kitfly currently generates sites that assume they are served from the root of a domain (`/`).

If you deploy to a subdirectory path (for example, GitHub Pages project sites serve at `/<repo-name>/`), internal links and asset references may break.

**Workarounds:**

- Use a **custom domain** or **subdomain** (`docs.example.com`) pointed at your host — this avoids the subdirectory issue entirely.
- For GitHub Pages specifically, use a "user/org" site (`<org>.github.io`) which serves at root, or configure a custom domain.

Base path support is being considered for a future release.

---

## DNS basics (quick primer)

If you bring your own domain, you'll do one of these:

- **Subdomain** (`docs.example.com`) → usually a **CNAME** to your host target.
- **Apex/root** (`example.com`) → often **A/AAAA** records, or an "ALIAS/ANAME" feature (varies by DNS provider).

Quick definitions:

- **A** = IPv4 address record
- **AAAA** = IPv6 address record
- **CNAME** = alias one name to another name

Each recipe calls out the common DNS pattern for that host.

---

## HTTPS

Every host in this section provides free HTTPS (via Let's Encrypt or equivalent). After your first deploy:

- Verify HTTPS works: load `https://your-domain.com` and check the lock icon.
- If your host offers "force HTTPS" or "redirect HTTP → HTTPS", enable it.
- Don't serve docs over plain HTTP in production.

---

## Common workflow (host-agnostic)

1. Build: `make build` (outputs `dist/`)
2. Preview locally (optional): open the built site in a browser
3. Deploy: upload/sync `dist/`
4. Verify: load the site, click around, hard refresh
5. Confirm HTTPS works (first deploy)
6. Roll back if needed: redeploy the previous `dist/`

If you're not sure what an environment variable is (or how to set one), see:

- [Reference: Environment Variables](reference/environment-variables.html)
