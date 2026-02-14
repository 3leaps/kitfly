---
title: "Sharing Your Docs"
description: "How to send, host, and deploy kitfly output"
last_updated: "2026-02-09"
---

# Sharing Your Docs

Kitfly has two export modes that serve different sharing needs.

## Send It — Single HTML File

Use `kitfly bundle` when you need to share docs without hosting.

```bash
kitfly bundle --name my-docs.html
```

This produces one self-contained HTML file with everything inlined: content, styles, images (as base64), syntax highlighting, and diagrams. No server needed — just open the file.

### When to use bundle

| Scenario            | Example                                 |
| ------------------- | --------------------------------------- |
| Email attachment    | Send docs to a client or reviewer       |
| Slack/Teams upload  | Drop into a channel for quick reference |
| Shared drive        | Put on Google Drive, Dropbox, OneDrive  |
| USB/offline handoff | Works without internet                  |
| Review cycle        | Stakeholders open in any browser        |
| Archival            | Point-in-time snapshot of your docs     |

### Bundle tips

- **File size**: Typical docs produce 100KB–1MB bundles. Image-heavy sites will be larger (base64 adds ~33% overhead per image).
- **Custom name**: Use `--name` to give the file a meaningful name for recipients (`--name q1-review.html`).
- **Strip raw markdown**: Use `--no-raw` if you don't want source `.md` accessible inside the bundle.

## Host It — Static Site

Use `kitfly build` when you want to deploy to a web server.

```bash
kitfly build --out ./dist
```

This produces a `dist/` directory with standard HTML, CSS, and assets. Deploy it anywhere that serves static files.

### Deployment targets

| Platform           | How                                                                         |
| ------------------ | --------------------------------------------------------------------------- |
| **GitHub Pages**   | Push `dist/` to `gh-pages` branch or configure Pages to serve from a folder |
| **Netlify**        | Set build command to `kitfly build`, publish directory to `dist`            |
| **Vercel**         | Same pattern — build command + output directory                             |
| **AWS S3**         | Sync `dist/` to an S3 bucket with static hosting enabled                    |
| **Any web server** | Copy `dist/` contents to your server's document root                        |
| **Local preview**  | `open dist/index.html` in your browser                                      |

### Build tips

- **Custom output**: `--out ./public` if your host expects a different directory name.
- **Raw markdown included**: By default, `.md` source files are copied alongside HTML for transparency. Use `--no-raw` to exclude them.
- **AI accessibility**: Build output includes `content-index.json`, `llms.txt`, and a `_raw/` directory so AI agents can read your docs. Use `--no-raw` to opt out.

## Choosing Between Bundle and Build

| Need                          | Use      |
| ----------------------------- | -------- |
| Share with one person         | `bundle` |
| Share with a team (no server) | `bundle` |
| Publish to the web            | `build`  |
| Need search engine indexing   | `build`  |
| Must work offline (no setup)  | `bundle` |
| CI/CD pipeline                | `build`  |
| Email attachment              | `bundle` |
| GitHub Pages / Netlify        | `build`  |

You can use both — `bundle` for quick reviews, `build` for the published site.

## Development Preview

During writing, use the dev server instead of building:

```bash
kitfly dev
```

This starts a local server at `http://localhost:3333` with hot reload. Edit any `.md` file and see changes instantly. When you're ready to share, switch to `bundle` or `build`.

## See Also

- [kitfly build](cli/build.md) — Build command reference
- [kitfly bundle](cli/bundle.md) — Bundle command reference
- [kitfly dev](cli/dev.md) — Development server
