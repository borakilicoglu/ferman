<p align="center">
  <img src="./assets/logo.svg" alt="ferman logo" width="132" height="132" />
</p>

<h1 align="center">ferman</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/ferman"><img src="https://img.shields.io/npm/v/ferman.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/ferman"><img src="https://img.shields.io/npm/dt/ferman.svg" alt="npm total downloads" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/ferman.svg" alt="license" /></a>
  <a href="https://borakilicoglu.github.io/ferman/"><img src="https://img.shields.io/badge/docs-github_pages-0b6b57" alt="docs" /></a>
  <a href="https://www.npmjs.com/package/ferman"><img src="https://img.shields.io/node/v/ferman.svg" alt="node version" /></a>
</p>

<p align="center">
  Inspect ports, identify processes, and free busy ports with predictable CLI output.
</p>

<p align="center">
  <strong>The hands of AI.</strong>
</p>

<p align="center">
  <code>npx ferman 3000</code>
</p>

## Overview

`ferman` is a small cross-platform DevOps CLI for identifying which process is using a port and releasing it safely when needed. It is designed for both humans and AI agents, with structured machine output, stable error codes, and predictable exit semantics.

## Install

Use instantly with `npx`:

```bash
npx ferman 3000
```

Install globally for repeated local use:

```bash
npm install -g ferman
ferman 3000
```

Install locally for development:

```bash
npm install
```

Run the local CLI during development:

```bash
npm run dev -- 3000 --dry
```

## Tools

Core commands:

```bash
ferman 3000
ferman 3000 --force
ferman 3000 --dry
ferman 3000 --json
ferman 3000 --toon
ferman 3000 5173 5432 --json
ferman --common --json
ferman --plan --json
ferman --doctor --json
ferman --json-schema
ferman 3000 --watch --json
ferman 3000 --toon
```

Capabilities matrix:

| Capability | Command | Output | Action |
| --- | --- | --- | --- |
| Inspect a port | `ferman 3000` | Human-readable | Finds the process and asks before termination |
| Force release | `ferman 3000 --force` | Human-readable | Finds the process and terminates without confirmation |
| Dry inspection | `ferman 3000 --dry` | Human-readable | Finds the process and does not terminate anything |
| Multi-port support | `ferman 3000 5173 5432 --json` | Machine-readable JSON | Returns batch results and a summary for multiple ports |
| Common-port scan | `ferman --common --json` | Machine-readable JSON | Scans a stable set of common local development ports |
| Plan mode | `ferman 3000 --plan --json` | Machine-readable JSON | Returns a recommendation without terminating processes |
| Doctor mode | `ferman --doctor --json` | Machine-readable JSON | Returns a local development port diagnosis and summary |
| JSON mode | `ferman 3000 --json` | Machine-readable JSON | Returns structured output for scripts, CI, and AI agents |
| JSON Schema | `ferman --json-schema` | Machine-readable JSON | Prints the JSON Schema for structured output consumers |
| Watch mode | `ferman 3000 --watch --json` | JSON event stream | Re-checks ports continuously and emits snapshot events |
| TOON mode | `ferman 3000 --toon` | Machine-readable TOON | Returns compact structured output optimized for LLM-facing workflows |
| Free port no-op | `ferman 3000` | Human-readable | Reports that the port is already free and exits successfully |
| Invalid input handling | `ferman abc`, `ferman abc --json`, `ferman abc --toon` | Error, JSON, or TOON | Rejects invalid port input with a deterministic exit code |

Example JSON output:

```json
{
  "ok": true,
  "code": "PORT_RELEASED",
  "port": 3000,
  "busy": true,
  "processes": [
    {
      "pid": 1234,
      "name": "node"
    }
  ],
  "action": "killed",
  "message": "Port released."
}
```

Example plan output:

```json
{
  "ok": true,
  "code": "PORT_INSPECTED",
  "port": 3000,
  "busy": true,
  "processes": [
    {
      "pid": 1234,
      "name": "node"
    }
  ],
  "action": "inspected",
  "message": "Plan mode active. No processes were terminated.",
  "recommendation": {
    "action": "terminate",
    "reason": "A single process is using the port, so targeted termination is a reasonable next step.",
    "risk": "low"
  }
}
```

Example batch output:

```json
{
  "ok": true,
  "code": "BATCH_COMPLETED",
  "ports": [
    {
      "ok": true,
      "code": "PORT_FREE",
      "port": 3000,
      "busy": false,
      "processes": [],
      "action": "none",
      "message": "Port is already free."
    }
  ],
  "summary": {
    "total": 1,
    "busy": 0,
    "free": 1,
    "released": 0,
    "inspected": 0
  }
}
```

Example TOON output:

```text
ok: true
code: PORT_RELEASED
port: 3000
busy: true
processes[1]{pid,name}:
  1234,node
action: killed
message: Port released.
```

Exit codes:

- `0`: success
- `1`: runtime error
- `2`: invalid input

Machine error codes:

- `INVALID_ARGUMENTS`
- `INVALID_PORT`
- `OUTPUT_MODE_CONFLICT`
- `UNSUPPORTED_PLATFORM`
- `COMMAND_UNAVAILABLE`
- `PERMISSION_DENIED`
- `PROCESS_NOT_FOUND`
- `KILL_FAILED`
- `INSPECTION_FAILED`
- `UNKNOWN_ERROR`

Platform support:

- macOS and Linux: `lsof`, `ps`
- Windows: `netstat`, `tasklist`, `taskkill`

Local tooling:

```bash
npm run lint
npm test
npm run typecheck
npm run build
npm run smoke
npm run release:check
```

## Sponsor

If `ferman` helps you keep local development moving, you can support ongoing maintenance through GitHub Sponsors:

- https://github.com/sponsors/borakilicoglu

## Support

For bugs, regressions, and feature requests, use GitHub Issues:

- https://github.com/borakilicoglu/ferman/issues

## Resources

- Website: https://borakilicoglu.github.io/ferman/
- GitHub repo: https://github.com/borakilicoglu/ferman
- Official npm package: https://www.npmjs.com/package/ferman
- Docs: https://borakilicoglu.github.io/ferman/
- Contributing: https://github.com/borakilicoglu/ferman/blob/main/CONTRIBUTING.md
- Releases: https://github.com/borakilicoglu/ferman/releases
- License: https://github.com/borakilicoglu/ferman/blob/main/LICENSE
