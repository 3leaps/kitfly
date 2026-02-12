---
title: "Recipe: Netlify"
description: "Beginner-friendly: upload `dist/` and go"
last_updated: "2026-02-12"
---

# Recipe: Netlify

Netlify is a great default for a static Kitfly site because deployment can be as simple as uploading `dist/`.

If you want the “fewest moving parts” setup:
- start with a subdomain like `docs.example.com`
- deploy the built `dist/` output
- don’t add redirects or fancy build settings until you need them

## Prerequisites

- A Netlify account

## Build

```bash
make build
```

## Deploy (simplest: drag-and-drop)

1. Go to Netlify
2. Create a new site
3. Drag-and-drop your `dist/` folder

This is perfect for small internal docs, quick demos, and “send a link” situations.

## Deploy (repeatable: connect to Git)

If your docs live in a repo and you want a predictable “push to deploy” workflow:

1. Connect your GitHub/GitLab repo in Netlify
2. Set build command: `make build`
3. Set publish directory: `dist`

Netlify will run your build and publish the `dist/` output.

Tip: this is often easier than asking everyone on the team to build locally.

## Custom domain (DNS basics)

Typical pattern:
- `docs.example.com` → **CNAME** to the Netlify target it gives you

If you need an apex/root domain, follow Netlify’s UI guidance for apex handling (it varies by DNS provider).

## Caching (why you might not see changes)

If you deploy and your browser still shows old content:
- hard refresh (Shift+Reload)
- try an incognito window
- wait a minute (some caches take time)

## Verify + Rollback

- Verify: load the site, click a few pages, hard refresh
- Rollback: re-publish the previous deploy from Netlify’s deploy history

See: [Preflight and Rollback](content/deployment/preflight.html)
