---
title: "ADR-0004: Bun Runtime"
description: "Kitfly uses Bun as its runtime instead of Node.js"
author: "deliverylead"
supervised_by: "@3leapsdave"
date: "2026-02-09"
status: "accepted"
tags: ["adr", "runtime", "architecture", "tooling"]
---

# ADR-0004: Bun Runtime

## Status

Accepted

## Context

Kitfly is a TypeScript CLI tool and static site generator. It needs a JavaScript runtime that can:

1. Execute TypeScript directly (no transpilation step)
2. Run fast — dev server startup, build times, and test execution should feel instant
3. Provide a built-in test runner (reduce dev dependencies)
4. Support the Node.js API surface used by kitfly (fs, path, http)

The project has a strict minimalism goal (ADR-0001): single production dependency (`marked`), minimal toolchain complexity.

## Decision

Use **Bun** as the primary runtime for development, testing, and production execution.

### What Bun Provides

| Capability                  | Replaces                                                   |
| --------------------------- | ---------------------------------------------------------- |
| Native TypeScript execution | `tsc` compilation step, `ts-node`, `tsx`                   |
| Built-in test runner        | Separate test framework install (jest/mocha for execution) |
| Fast startup (~25ms)        | Node.js cold start (~100-200ms)                            |
| Built-in package manager    | npm/yarn/pnpm (for install speed)                          |
| `Bun.serve()` HTTP server   | Express, Koa, or manual `http.createServer`                |

### Runtime Boundary

Kitfly's source code uses standard Node.js APIs (`node:fs/promises`, `node:path`, `node:http`) rather than Bun-specific APIs where possible. The main Bun-specific usage is:

- `Bun.serve()` in the dev server (`scripts/dev.ts`)
- `bun run` as the script executor
- `bun test` via vitest (which uses Bun's runtime)

### User Requirement

Users must have Bun installed to run `kitfly`. This is documented in getting-started and enforced at CLI startup. Bun installation is a single command on all major platforms:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Test Runner

Tests use **vitest** running on the Bun runtime. This provides:

- vitest's assertion API and test organization
- Bun's fast execution speed
- Watch mode for development (`bun test:watch`)

## Consequences

### Positive

- **No build step**: TypeScript executes directly — `bun run src/cli.ts` just works
- **Fast iteration**: Dev server starts in under 100ms, full test suite runs in ~500ms (427 tests)
- **Fewer dependencies**: No need for `ts-node`, `tsx`, or a separate transpiler
- **Aligned with minimalism**: Bun's built-in capabilities reduce the toolchain surface

### Negative

- **Bun is a user prerequisite**: Users who only have Node.js installed need to install Bun first
- **Ecosystem maturity**: Bun is newer than Node.js — edge cases in compatibility exist (though kitfly's API surface is well-supported)
- **CI consideration**: CI environments need Bun installed (GitHub Actions: `oven-sh/setup-bun`)

### Neutral

- The standard Node.js API usage means a future port to Node.js (with a TypeScript loader) is feasible if needed
- Bun's package manager is used for `bun install` but `package.json` remains standard — compatible with npm/yarn if users prefer for dependency management

## Alternatives Considered

### Node.js + tsx

Node.js with `tsx` for TypeScript execution. Viable but slower startup, requires additional dev dependency, and doesn't provide a built-in test runner or fast HTTP server.

### Deno

Native TypeScript support and built-in tooling. Rejected because Deno's module resolution (URL imports, import maps) would complicate the project structure and `kitfly init` copy model. Bun's Node.js compatibility is more aligned with kitfly's design.

### Node.js + esbuild compilation

Compile TypeScript to JavaScript, ship compiled output. Rejected because it adds a build step to the development workflow and contradicts the "edit and run" simplicity goal.
