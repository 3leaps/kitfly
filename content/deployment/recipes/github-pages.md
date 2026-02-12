---
title: "Recipe: GitHub Pages"
description: "Publish `dist/` on GitHub Pages"
last_updated: "2026-02-12"
---

# Recipe: GitHub Pages

GitHub Pages is a good choice when your docs already live in GitHub.

There are many ways to do Pages. This recipe focuses on a beginner-friendly approach first, then a more automated path.

If you're new to deployment: start with Option A. It's not "perfect", but it is simple and reliable.

## Prerequisites

- A GitHub repository

## Important: subdirectory paths

GitHub Pages project sites serve at `https://<user>.github.io/<repo-name>/` by default. Kitfly currently assumes root-level hosting, so links may break in subdirectory deployments.

**Recommended fix:** Configure a **custom domain** (e.g., `docs.example.com`) so the site is served at root. Or use a GitHub Pages "user/org" site (`<org>.github.io`) which serves from `/`.

## Build

```bash
make build
```

## Option A (simplest): commit the built site

1. Copy `dist/` into a folder GitHub Pages can serve, commonly `docs/`
2. Commit and push
3. In GitHub repo settings → Pages:
   - Source: "Deploy from a branch"
   - Folder: `docs/` (or whatever you chose)

Notes:

- This is easy, but it means build artifacts live in git.

## Option B (recommended): build via GitHub Actions

This workflow builds on every push to `main` and publishes `dist/` as the Pages artifact.

```yaml
# .github/workflows/deploy-pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - run: bun install

      - run: make build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

To use this workflow:

1. Go to your repo → Settings → Pages → Source: **GitHub Actions**
2. Commit the workflow file above
3. Push to `main`

## Custom domain (DNS basics)

Typical pattern:

- `docs.example.com` → **CNAME** to your `*.github.io` Pages domain

After configuring DNS, add a `CNAME` file inside your `dist/` output (or in a `public/` folder that your build copies to `dist/`) containing your custom domain.

## Verify + Rollback

- Verify: load the site, click a few pages, hard refresh
- Rollback: redeploy a prior commit (Option A) or re-run a prior workflow (Option B)

See: [Preflight and Rollback](../preflight.html)
