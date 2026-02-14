# kitfly dev

Start development server with hot reload.

## Usage

```bash
kitfly dev [folder] [options]
```

## Description

Launches a local development server that renders your markdown files and automatically reloads when content changes. This is the primary command for authoring documentation.

## Arguments

| Argument | Description                                                                      |
| -------- | -------------------------------------------------------------------------------- |
| `folder` | Content folder to serve (default: current directory or `docroot` from site.yaml) |

## Options

| Option           | Environment Variable | Default   | Description                           |
| ---------------- | -------------------- | --------- | ------------------------------------- |
| `--port <n>`     | `KITFLY_DEV_PORT`    | 3333      | Server port                           |
| `--host <h>`     | `KITFLY_DEV_HOST`    | localhost | Server host                           |
| `--daemon`, `-d` | -                    | false     | Run in background, return immediately |
| `--json`         | -                    | false     | Output JSON (implies --daemon)        |
| `--no-open`      | -                    | false     | Don't open browser automatically      |

## Examples

### Basic usage

```bash
# Serve current directory
kitfly dev

# Serve specific folder
kitfly dev ./docs

# Custom port
kitfly dev --port 8080
```

### Background mode

```bash
# Run as daemon
kitfly dev --daemon

# Get JSON output for scripting
kitfly dev --json
```

### Output (JSON mode)

```json
{
  "pid": 12345,
  "port": 3333,
  "url": "http://localhost:3333"
}
```

## Port Conflict Detection

If the specified port is already in use, kitfly will report an error rather than silently choosing another port. Use `kitfly servers` to see what's running.

## Hot Reload

The dev server watches for changes to:

- Markdown files (`.md`)
- Configuration (`site.yaml`, `theme.yaml`)
- Template files

Changes are reflected immediately without manual refresh.

## Plugin validation errors (triple-colon fences)

Some plugins add special block syntax (for example, `slides-visuals` uses `:::` fences).

When a plugin is enabled, kitfly may validate your content before rendering. If validation fails, `kitfly dev` will exit with a clear error message so you can fix the content and restart.

See the exact contract (with examples): `../../../content/reference/plugins.html#triple-colon-fence-contract-slides-visuals`.

## See Also

- [kitfly build](build.md) - Build static site
- [kitfly servers](servers.md) - List running servers
- [kitfly stop](stop.md) - Stop servers
