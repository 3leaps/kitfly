# Kitfly CLI Reference

Command-line interface for kitfly - turn your writing into a website.

## Quick Reference

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `kitfly dev`     | Start development server with hot reload |
| `kitfly build`   | Build static site to dist/               |
| `kitfly bundle`  | Build single-file HTML bundle            |
| `kitfly init`    | Create new project from template         |
| `kitfly update`  | Update standalone site code              |
| `kitfly servers` | List running dev servers                 |
| `kitfly stop`    | Stop dev server(s)                       |
| `kitfly version` | Show version information                 |
| `kitfly help`    | Show help message                        |

## Global Behavior

- All commands read configuration from `site.yaml` if present
- Environment variables can override most options (prefixed with `KITFLY_`)
- Exit codes: 0 = success, 1 = error

## Command Documentation

- [dev](dev.md) - Development server
- [build](build.md) - Static site generation
- [bundle](bundle.md) - Single-file HTML output
- [init](init.md) - Project initialization
- [update](update.md) - Site code updates
- [servers](servers.md) - Server management
- [stop](stop.md) - Stop servers
- [version](version.md) - Version information
