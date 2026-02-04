# kitfly bundle

Build single-file HTML bundle.

## Usage

```bash
kitfly bundle [folder] [options]
```

## Description

Creates a single, self-contained HTML file with all content, styles, and navigation embedded. Perfect for sharing via email, Slack, or file sharing services.

## Arguments

| Argument | Description |
|----------|-------------|
| `folder` | Content folder to bundle (default: current directory or `docroot` from site.yaml) |

## Options

| Option | Environment Variable | Default | Description |
|--------|---------------------|---------|-------------|
| `--out <dir>` | `KITFLY_BUILD_OUT` | dist | Output directory |
| `--name <file>` | - | bundle.html | Output filename |
| `--raw` | `KITFLY_BUILD_RAW` | true | Include raw markdown in bundle |
| `--no-raw` | - | - | Don't include raw markdown |

## Examples

### Basic usage

```bash
# Create bundle.html in dist/
kitfly bundle

# Custom filename
kitfly bundle --name my-docs.html

# Custom output location
kitfly bundle --out ./release --name handbook.html
```

## Output

A single HTML file containing:
- All page content with images inlined as base64 data URIs
- Embedded CSS styles
- Syntax highlighting (Prism.js, inlined)
- Diagram rendering (Mermaid, inlined)
- Navigation and table of contents
- Dark mode support
- Brand logo and favicon (inlined)
- No external dependencies (works fully offline)

## Use Cases

- **Email attachment**: Share documentation without hosting
- **Offline reading**: Works without internet connection
- **Review cycles**: Send to stakeholders for feedback
- **Archival**: Single-file snapshot of documentation
- **Client handoff**: Portable single-file deliverable with all images embedded

## File Size

Bundle size depends on content volume and images. Typical documentation sites produce bundles of 100KB-1MB. Sites with many images will be larger due to base64 encoding (~33% overhead per image).

## See Also

- [kitfly build](build.md) - Multi-file static build
- [kitfly dev](dev.md) - Development server
