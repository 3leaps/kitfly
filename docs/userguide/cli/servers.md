# kitfly servers

List running dev servers.

## Usage

```bash
kitfly servers [options]
```

## Description

Displays all kitfly dev servers currently running on this machine. Useful for managing multiple documentation projects or finding orphaned servers.

## Options

| Option   | Description    |
| -------- | -------------- |
| `--json` | Output as JSON |

## Examples

### Basic usage

```bash
$ kitfly servers
PORT   PID    PROJECT
3333   12345  /Users/me/docs/handbook
3340   12346  /Users/me/docs/runbook
```

### JSON output

```bash
$ kitfly servers --json
[
  {"port": 3333, "pid": 12345, "project": "/Users/me/docs/handbook"},
  {"port": 3340, "pid": 12346, "project": "/Users/me/docs/runbook"}
]
```

### No servers running

```bash
$ kitfly servers
No kitfly servers running
```

## Output Fields

| Field     | Description            |
| --------- | ---------------------- |
| `PORT`    | Server port number     |
| `PID`     | Process ID             |
| `PROJECT` | Project directory path |

## Server Registry

Kitfly maintains a registry of running servers at:

- macOS/Linux: `~/.kitfly/servers.json`
- Windows: `%USERPROFILE%\.kitfly\servers.json`

The registry is automatically cleaned up when servers stop normally.

## See Also

- [kitfly dev](dev.md) - Start a server
- [kitfly stop](stop.md) - Stop servers
