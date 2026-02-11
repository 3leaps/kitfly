# Kitfly v0.1.2

**Release date:** 2026-02-10

## What's new

Kitfly v0.1.2 fixes the footer provenance display, improves sidebar navigation UX, adds configurable sidebar width, and dramatically expands test coverage.

### Provenance fix

The footer previously showed the kitfly engine version (e.g., `v0.1.2`) — every kitfly-powered site displayed the same number. Now it shows **your site's version**:

```yaml
# site.yaml
version: "2.4.1"
```

Resolution order: `site.yaml` version → git tag on HEAD → omit version entirely. The kitfly engine version is no longer displayed in site provenance.

### Sidebar folder indicators

Collapsible folder indicators in the sidebar nav were hard to see (`▸`/`▾` at 70% font size). Replaced with a `›` chevron at 85% size with a smooth 150ms rotation on open/close.

### Configurable sidebar width

Sidebar width is now configurable via `theme.yaml`:

```yaml
# theme.yaml
layout:
  sidebarWidth: "320px"
```

Default remains `280px`. Recommended range: `240px`–`400px`. Works in dev server, static builds, and bundles.

### Test coverage

Major investment in test quality:

| Metric | Before | After |
|--------|-------:|------:|
| Tests | 466 | 1,174 |
| Statement coverage | 56.9% | 68.7% |
| Function coverage | 42.3% | 79.6% |

All five template modules (crucible, pipeline, productbook, runbook, servicebook) now have 100% test coverage.

## Bug fixes

- Footer provenance displayed kitfly engine version instead of site version
- Sidebar folder indicators too small and lacked animation
- Theme test suite used `vi.mock()` causing cross-file mock contamination

## Full changelog

See [CHANGELOG.md](CHANGELOG.md) or [docs/releases/v0.1.2.md](docs/releases/v0.1.2.md) for the complete list.
