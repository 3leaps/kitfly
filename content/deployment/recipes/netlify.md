---
title: "Recipe: Netlify"
description: "Beginner-friendly: upload `dist/` and go"
last_updated: "2026-02-12"
---

# Recipe: Netlify

Netlify is a great default for a static Kitfly site because deployment can be as simple as uploading `dist/`.

If you want the "fewest moving parts" setup:

- start with a subdomain like `docs.example.com`
- deploy the built `dist/` output
- don't add redirects or fancy build settings until you need them

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

This is perfect for small internal docs, quick demos, and "send a link" situations.

## Deploy (repeatable: connect to Git)

If your docs live in a repo and you want a predictable "push to deploy" workflow:

1. Connect your GitHub/GitLab repo in Netlify
2. Set build command: `make build`
3. Set publish directory: `dist`

Netlify will run your build and publish the `dist/` output.

Tip: this is often easier than asking everyone on the team to build locally.

## Configuration file (optional)

For config-as-code, add `netlify.toml` to your project root:

```toml
[build]
  command = "make build"
  publish = "dist"

[build.environment]
  # Netlify needs Bun installed for the build
  BUN_VERSION = "1"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

Note: Netlify doesn't ship Bun by default. You may need to add a build plugin or install step. Check Netlify's docs for current Bun support. Alternatively, build locally and use drag-and-drop or the Netlify CLI:

```bash
make build
npx netlify-cli deploy --dir=dist --prod
```

## Custom domain (DNS basics)

Typical pattern:

- `docs.example.com` → **CNAME** to the Netlify target it gives you

If you need an apex/root domain, follow Netlify's UI guidance for apex handling (it varies by DNS provider).

HTTPS is provisioned automatically via Let's Encrypt once DNS is configured.

## Caching (why you might not see changes)

If you deploy and your browser still shows old content:

- hard refresh (Shift+Reload)
- try an incognito window
- wait a minute (some caches take time)

Netlify invalidates its CDN cache on every deploy — if you still see stale content, it's likely browser cache.

## Verify + Rollback

- Verify: load the site, click a few pages, hard refresh, confirm HTTPS lock icon
- Rollback: re-publish the previous deploy from Netlify's deploy history

See: [Preflight and Rollback](../preflight.html)
