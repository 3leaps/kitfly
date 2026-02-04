# kitfly build

Build static site to output directory.

## Usage

```bash
kitfly build [folder] [options]
```

## Description

Generates a complete static HTML site from your markdown files. The output can be deployed to any static hosting service (GitHub Pages, Netlify, S3, etc.).

## Arguments

| Argument | Description |
|----------|-------------|
| `folder` | Content folder to build (default: current directory or `docroot` from site.yaml) |

## Options

| Option | Environment Variable | Default | Description |
|--------|---------------------|---------|-------------|
| `--out <dir>` | `KITFLY_BUILD_OUT` | dist | Output directory |
| `--no-raw` | - | false | Don't include raw markdown files |

## Examples

### Basic usage

```bash
# Build current project
kitfly build

# Build specific folder
kitfly build ./docs

# Custom output directory
kitfly build --out ./public
```

### Without raw markdown

```bash
# HTML only, no .md files in output
kitfly build --no-raw
```

## Output Structure

```
dist/
├── index.html
├── guide/
│   ├── getting-started.html
│   └── getting-started.md    # (if --no-raw not specified)
├── reference/
│   └── ...
└── assets/
    └── ...
```

## Raw Markdown Files

By default, kitfly includes the original `.md` files alongside the generated HTML. This allows:
- Downloading source for offline editing
- Transparency about content source
- Easy content migration

Use `--no-raw` to exclude these files if not needed.

## See Also

- [kitfly dev](dev.md) - Development server
- [kitfly bundle](bundle.md) - Single-file output
