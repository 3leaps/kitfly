---
title: "Recipe: GitHub Pages"
description: "Publish `dist/` on GitHub Pages"
last_updated: "2026-02-12"
---

# Recipe: GitHub Pages

GitHub Pages is a good choice when your docs already live in GitHub.

There are many ways to do Pages. This recipe focuses on a beginner-friendly approach first, then a more automated path.

If you’re new to deployment: start with Option A. It’s not “perfect”, but it is simple and reliable.

## Prerequisites

- A GitHub repository

## Build

```bash
make build
```

## Option A (simplest): commit the built site

1. Copy `dist/` into a folder GitHub Pages can serve, commonly `docs/`
2. Commit and push
3. In GitHub repo settings → Pages:
   - Source: “Deploy from a branch”
   - Folder: `docs/` (or whatever you chose)

Notes:
- This is easy, but it means build artifacts live in git.

## Option B (recommended later): build via GitHub Actions

If you prefer not to commit build artifacts:
- use a workflow that runs `make build` and publishes `dist/` as the Pages artifact

If you want a copy-paste starting point, this is the shape:

1. Build on every push to `main`
2. Upload the `dist/` folder as the Pages artifact
3. Deploy it

We keep this page light on YAML because GitHub Actions details drift over time. If you’d like, we can add a versioned workflow snippet once v0.2.0 dogfood confirms the final build output contract.

## Custom domain (DNS basics)

Typical pattern:
- `docs.example.com` → **CNAME** to your `*.github.io` Pages domain

## Verify + Rollback

- Verify: load the site, click a few pages, hard refresh
- Rollback: redeploy a prior commit (Option A) or a prior workflow run (Option B)

See: [Preflight and Rollback](content/deployment/preflight.html)
