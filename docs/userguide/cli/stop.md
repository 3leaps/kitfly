# kitfly stop

Stop dev server(s).

## Usage

```bash
kitfly stop <port|all> [options]
```

## Description

Stops one or more running kitfly dev servers. Can target a specific port or stop all servers at once.

## Arguments

| Argument | Description                     |
| -------- | ------------------------------- |
| `port`   | Port number of server to stop   |
| `all`    | Stop all running kitfly servers |

## Options

| Option    | Description                              |
| --------- | ---------------------------------------- |
| `--force` | Skip graceful shutdown, kill immediately |

## Examples

### Stop specific server

```bash
# Stop server on port 3333
kitfly stop 3333
```

### Stop all servers

```bash
# Graceful shutdown of all servers
kitfly stop all
```

### Force stop

```bash
# Immediate termination (use if graceful fails)
kitfly stop 3333 --force
kitfly stop all --force
```

## Graceful vs Force Shutdown

**Graceful** (default):

- Sends SIGTERM signal
- Allows server to clean up
- Waits briefly for process to exit

**Force** (`--force`):

- Sends SIGKILL signal
- Immediate termination
- Use when graceful shutdown hangs

## Exit Codes

| Code | Meaning                                           |
| ---- | ------------------------------------------------- |
| 0    | Server(s) stopped successfully                    |
| 1    | Error (server not found, permission denied, etc.) |

## See Also

- [kitfly servers](servers.md) - List running servers
- [kitfly dev](dev.md) - Start a server
