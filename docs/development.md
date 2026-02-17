---
title: "Development Setup"
description: "Contributor setup for the Kitfly repo (bootstrap, dev loop, quality gates)"
last_updated: "2026-02-12"
status: "draft"
---

# Development Setup

How to set up a Kitfly development environment from a fresh clone.

## Prerequisites

| Tool                                             | Purpose                                 | Install                                                                                                                          |
| ------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----- |
| [Bun](https://bun.sh)                            | Runtime and package manager             | macOS/Linux: `curl -fsSL https://bun.sh/install \| bash`<br>Windows (PowerShell): `powershell -c "irm https://bun.sh/install.ps1 | iex"` |
| [GNU Make](https://www.gnu.org/software/make/)   | Task runner                             | macOS: included with Xcode CLI tools<br>Linux: `apt install make`<br>Windows: `scoop install make`                               |
| [minisign](https://jedisct1.github.io/minisign/) | Signature verification (used by sfetch) | macOS: `brew install minisign`<br>Linux: `apt install minisign`<br>Windows: `scoop install minisign`                             |
| curl                                             | HTTP client (bootstrap downloads)       | macOS/Linux: usually pre-installed<br>Windows: available in PowerShell (`Invoke-RestMethod`)                                     |

## Windows notes (contributors)

Kitfly works well on Windows, but **shell choice matters** for development.

### Recommended setup

- Use **Git Bash** (or MSYS2) for `make`-based workflows.
- Use **PowerShell** for installing Bun.

### Install Bun (PowerShell)

```powershell
powershell -c "irm https://bun.sh/install.ps1|iex"
```

If VS Code’s default terminal is `cmd.exe`, you may need to restart VS Code (or ensure `C:\Users\<you>\.bun\bin` is on PATH).

### Install prerequisites (Scoop)

If you don’t already have Scoop, install it from https://scoop.sh.

Then install the tools used by `make bootstrap`:

```powershell
scoop install make minisign git
```

### Paths

Kitfly’s bootstrap tools install into `~/.local/bin`.

- In Git Bash, that’s the usual `~/.local/bin`.
- In Windows terms, it’s typically `%USERPROFILE%\.local\bin`.

Ensure that directory is on your PATH in the shell you use.

## Quick Start

```bash
git clone https://github.com/3leaps/kitfly
cd kitfly
make bootstrap
```

`make bootstrap` installs the full toolchain in four steps:

1. **sfetch** — secure download tool (trust anchor)
2. **goneat** — formatting and linting tool (installed via sfetch)
3. **Foundation tools** — standard tooling suite (installed via goneat)
4. **Bun dependencies** — `bun install`

Tools are installed to `~/.local/bin`. Ensure this is on your PATH:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

## Verify

```bash
make tools     # Check all external tools are available
make dev       # Start dev server at http://localhost:3333
```

## Quality gates (before a PR)

```bash
make fmt
make check-all
```

## Daily Commands

| Command          | What it does                                       |
| ---------------- | -------------------------------------------------- |
| `make dev`       | Dev server with hot reload                         |
| `make build`     | Build static site to `dist/`                       |
| `make bundle`    | Build single-file HTML bundle                      |
| `make fmt`       | Format all code (Biome for TS, goneat for YAML/MD) |
| `make test`      | Run test suite                                     |
| `make check-all` | Full quality check (lint + typecheck + test)       |
| `make clean`     | Remove build artifacts                             |

## Local CLI Install

To use the `kitfly` command from anywhere (dogfooding):

```bash
make install
```

On macOS/Linux, this symlinks `src/cli.ts` to `~/.local/bin/kitfly`.

On Windows (Git Bash/MSYS/MINGW), it installs a small launcher script instead of a symlink (symlinks often require admin/Developer Mode).

Remove with `make uninstall`.

## Common gotchas

- If `kitfly` isn’t found after `make install`, ensure `~/.local/bin` is on your `PATH`.
- If port `3333` is already in use, run `kitfly servers` and `kitfly stop 3333` (or use `--port`).

## Project Structure

```
kitfly/
├── src/           # Engine + CLI code
├── scripts/       # Dev/build/bundle scripts (copied to users)
├── content/       # Kitfly's own documentation (NOT copied)
├── schemas/       # JSON schemas (copied to users)
├── docs/          # Repo docs: decisions, this file
├── AGENTS.md      # AI agent guide
└── Makefile       # All task automation
```

See [AGENTS.md](../AGENTS.md) for the full architecture breakdown and coding guidelines.
