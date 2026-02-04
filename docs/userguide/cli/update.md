# kitfly update

Update standalone site code.

## Usage

```bash
kitfly update [version] [options]
```

## Description

Updates the kitfly rendering code in a standalone site to a newer version. Preserves your content and configuration while upgrading the engine.

> **Note**: This command is planned for v0.2.0 and may not be fully implemented yet.

## Arguments

| Argument | Description |
|----------|-------------|
| `version` | Target version (default: latest) |

## Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes without applying |
| `--force` | Update even if local modifications detected |

## Examples

### Basic usage

```bash
# Update to latest version
kitfly update

# Update to specific version
kitfly update 0.2.0

# Preview changes first
kitfly update --dry-run
```

## What Gets Updated

- `scripts/dev.ts`, `scripts/build.ts`, `scripts/bundle.ts`
- `src/engine.ts`, `src/theme.ts`
- `src/site/template.html`, `src/site/styles.css`
- Schema files in `schemas/`

## What Is Preserved

- `content/` - Your documentation
- `site.yaml` - Site configuration
- `theme.yaml` - Theme customization
- Custom modifications (with warning)

## Modification Detection

Kitfly tracks file checksums to detect local modifications. If you've customized engine files:
1. Update will warn about modifications
2. Use `--force` to overwrite
3. Or manually merge changes

## Version Compatibility

Updates follow semantic versioning:
- **Patch** (0.1.x): Safe, backward-compatible fixes
- **Minor** (0.x.0): New features, may need config updates
- **Major** (x.0.0): Breaking changes, migration may be required

## See Also

- [kitfly init](init.md) - Create new project
- [kitfly version](version.md) - Check current version
