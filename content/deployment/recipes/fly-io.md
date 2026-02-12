---
title: "Recipe: Fly.io"
description: "Host your built site as a tiny app (Docker-based)"
last_updated: "2026-02-12"
---

# Recipe: Fly.io

Fly.io is best when you want your Kitfly site hosted like an “app” (for example: private/internal access, custom headers, or a future path to auth).

This recipe assumes you’re comfortable with a small amount of Docker.

If all you want is public static hosting with a custom domain, Netlify or GitHub Pages is usually simpler.

## Prerequisites

- Fly.io account
- `flyctl` installed and authenticated

## Build

```bash
make build
```

## Create a tiny static container (nginx)

In your project root, create a `Dockerfile` like this:

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
```

Then:

```bash
flyctl launch
flyctl deploy
```

If `flyctl launch` asks for a port, you typically want `80` for a static nginx container.

## DNS basics

Typical pattern:
- `docs.example.com` → **CNAME** to the Fly-provided hostname

## Rollback

Fly retains release history. You can usually roll back by promoting a previous release.

See: [Preflight and Rollback](content/deployment/preflight.html)
