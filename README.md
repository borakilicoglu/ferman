# ferman

Inspect and free busy ports instantly.

The hands of AI.

```bash
npx ferman 3000
```

`ferman` is a small DevOps CLI for checking which process is using a port and freeing it safely when needed. It is designed to work well for humans and AI agents with predictable JSON output and exit codes.

## Install

Run without installing:

```bash
npx ferman 3000
```

Install globally:

```bash
npm install -g ferman
ferman 3000
```

Install locally for development:

```bash
npm install
```

## Usage

```bash
ferman <port> [--force] [--dry] [--json]
```

Examples:

```bash
ferman 3000
ferman 3000 --force
ferman 3000 --dry
ferman 3000 --json
```

## JSON Mode

Use `--json` for scripts, CI, and AI agents:

```bash
ferman 3000 --json
```

Example output:

```json
{
  "port": 3000,
  "busy": true,
  "processes": [
    {
      "pid": 1234,
      "name": "node"
    }
  ],
  "action": "killed",
  "message": "Ferman verildi."
}
```

Exit codes:

- `0`: success
- `1`: runtime error
- `2`: invalid input

## Why

Busy ports are a small problem that interrupts real work. `ferman` keeps the fix simple: inspect the port, show the process, and free it when you decide to proceed.

## Local Development

Run in development mode:

```bash
npm run dev -- 3000 --dry
```

Build:

```bash
npm run build
```

Type-check:

```bash
npm run typecheck
```

## Platform Notes

- macOS and Linux use `lsof` and `ps`
- Windows uses `netstat`, `tasklist`, and `taskkill`
- If a required system command is missing, `ferman` exits with an error
