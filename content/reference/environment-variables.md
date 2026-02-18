---
title: "Environment Variables"
description: "A beginner-friendly primer (with copy-paste examples)"
last_updated: "2026-02-17"
---

# Environment Variables

An environment variable is a named value your terminal (or hosting platform) provides to a command.

Examples:

- `PORT=3333`
- `AWS_PROFILE=my-team`
- `NETLIFY_AUTH_TOKEN=...`

## Why they matter for deployment

Kitfly’s output is static. Deployment tools often need credentials, and environment variables are a common way to provide them without putting secrets in files.

Important: don’t commit secrets to git. See:

- [Deployment: Secrets and Environment Variables](../deployment/secrets-and-env-vars.html)

## How to set an environment variable

### macOS / Linux (bash, zsh)

Set for a single command:

```bash
MY_VAR="hello" my-command
```

Set for your current terminal session:

```bash
export MY_VAR="hello"
my-command
```

### Windows (PowerShell)

Set for your current session:

```powershell
$env:MY_VAR = "hello"
my-command
```

## `.env` files (optional)

Some tools can read a `.env` file.

If you use one:

- keep it local-only
- make sure it is gitignored
- consider adding a `.env.example` with placeholder values (safe to commit)

## Kitfly environment variables (v0.2.3+)

### `KITFLY_PROFILE`

Activate a content profile without the `--profile` CLI flag:

```bash
KITFLY_PROFILE=alpha kitfly build ./mysite
```

Equivalent to `kitfly build ./mysite --profile alpha`.

### Pre-build hook variables

Kitfly sets these before running each `prebuild:` hook:

| Variable            | Value                           | Example                     |
| ------------------- | ------------------------------- | --------------------------- |
| `KITFLY_SITE_ROOT`  | Absolute path to kitsite root   | `/Users/me/my-docs`         |
| `KITFLY_DATA_DIR`   | Data directory relative to root | `data/`                     |
| `KITFLY_BUILD_MODE` | Current build mode              | `dev`, `build`, or `bundle` |
| `KITFLY_PROFILE`    | Active content profile (if any) | `alpha`                     |

These allow generators to adapt behavior per build context — for example, a generator might skip expensive API calls in `dev` mode or produce different output per profile.

## Quick troubleshooting

- If a command says a variable is missing, print it:
  - macOS/Linux: `echo "$MY_VAR"`
  - PowerShell: `echo $env:MY_VAR`
- If it prints empty, it’s not set in that shell session.
