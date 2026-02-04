# kitfly version

Show version information.

## Usage

```bash
kitfly version [extended]
kitfly version --extended
kitfly --version
kitfly -v
```

## Description

Displays the current kitfly version. Use `extended` for detailed provenance information useful for debugging and support.

## Options

| Option | Description |
|--------|-------------|
| `extended` | Show extended version with git and platform info |
| `--extended` | Same as `extended` subcommand |

## Output

### Basic Version

```bash
$ kitfly version
0.1.0
```

### Extended Version

```bash
$ kitfly version extended
kitfly 0.1.0
Git commit: b95c6a8
Git branch: main
Git status: clean
Bun: 1.3.7
Platform: darwin/arm64
```

## Extended Output Fields

| Field | Description |
|-------|-------------|
| `kitfly` | Current version from VERSION file |
| `Git commit` | Short SHA of current commit |
| `Git branch` | Current git branch name |
| `Git status` | "clean" or "dirty (uncommitted changes)" |
| `Bun` | Bun runtime version |
| `Platform` | OS and architecture (e.g., darwin/arm64, linux/x64) |

## Use Cases

- **Bug reports**: Include `kitfly version extended` output
- **Debugging**: Verify which version and commit is running
- **Support**: Confirm runtime environment

## See Also

- [kitfly help](README.md)
