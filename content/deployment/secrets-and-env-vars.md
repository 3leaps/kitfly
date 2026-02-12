---
title: "Secrets and Environment Variables"
description: "How to deploy without leaking credentials"
last_updated: "2026-02-12"
---

# Secrets and Environment Variables

Most Kitfly deployments need **no secrets** because the output is static.

You only need secrets when a _deployment tool_ needs credentials (AWS CLI, Netlify CLI, etc.).

## The one rule

Never commit secrets to git.

That includes:

- `.env` files
- API tokens
- access keys
- private keys

If you already committed something sensitive, treat it as leaked:

- rotate/revoke it
- remove it from git history if needed

## Beginner-friendly pattern

1. Put secret values in environment variables (or your host's secret store).
2. Keep a local `.env` file _only if you must_ — and make sure it is gitignored.
3. Use placeholder examples (`.env.example`) to document required variables.

## What is an environment variable?

An environment variable is a named value your terminal (or hosting platform) provides to a command.

If you want a quick primer with copy-paste commands, see:

- [Reference: Environment Variables](../reference/environment-variables.html)

## Host secret stores (recommended)

If your host offers a "Secrets" UI, use it. It's harder to accidentally leak.

Examples (names vary by provider):

- "Environment variables"
- "Secrets"
- "Build & deploy settings"

## Least privilege (plain language)

Create credentials that can do only what deployment needs.

Examples:

- An AWS IAM user/policy that can only write to one S3 bucket
- A Netlify token that can only deploy to one site (if supported)
- A Cloudflare API token scoped to a single zone or R2 bucket

## Do / Don't

**Do**

- Do keep secrets in a password manager
- Do rotate tokens periodically
- Do prefer scoped tokens over "account owner" tokens

**Don't**

- Don't paste secrets into docs
- Don't put secrets in `site.yaml`
- Don't share secrets in Slack threads
