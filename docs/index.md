---
layout: home

hero:
  name: "ferman"
  text: "Inspect ports. Free them fast."
  tagline: "A cross-platform CLI for identifying and releasing busy ports with predictable output for humans and AI agents."
  image:
    src: /logo.svg
    alt: ferman logo
  actions:
    - theme: brand
      text: Get Started
      link: /#install
    - theme: alt
      text: GitHub
      link: https://github.com/borakilicoglu/ferman

features:
  - title: Human and agent friendly
    details: Use interactive prompts when you want safety, or use JSON, TOON, and stable exit codes when you need automation.
  - title: Cross-platform
    details: Supports macOS, Linux, and Windows with platform-specific process inspection behind a single CLI interface.
  - title: Release-ready workflow
    details: Ships with linting, tests, smoke checks, trusted publishing, and GitHub Pages docs.
---

## Overview

`ferman` is a small cross-platform DevOps CLI for identifying which process is using a port and releasing it safely when needed.

It is designed to work well for both humans and AI agents:

- interactive confirmation for safe termination
- `--force` for direct action
- `--dry` for inspection only
- `--json` for scripts, CI, and agents
- `--toon` for compact LLM-oriented structured output
- multi-port support for batch inspection
- `--common` for common local development ports
- `--plan` for recommendations without termination
- `--doctor` for environment-level diagnosis
- `--node` for active Node.js process listing
- `--node-ports` for active Node.js processes with listening ports
- `--self` to include the current `ferman` invocation in node-oriented listings
- `--json-schema` for integration-safe contracts
- `--watch` for continuous re-checking
- `--changed-only` for quieter watch output
- predictable exit codes for automation

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
ferman --node --json
ferman --node --self --json
ferman --node-ports --json
ferman --json-schema
ferman 3000 --watch --json
ferman 3000 --watch --changed-only --json
```

Capabilities matrix:

| Capability | Command | Output | Action |
| --- | --- | --- | --- |
| Inspect a port | `ferman 3000` | Human-readable | Finds the process and asks before termination |
| Force release | `ferman 3000 --force` | Human-readable | Finds the process and terminates without confirmation |
| Dry inspection | `ferman 3000 --dry` | Human-readable | Finds the process and does not terminate anything |
| Multi-port support | `ferman 3000 5173 5432 --json` | Machine-readable JSON | Returns batch results and a summary for multiple ports |
| Common-port scan | `ferman --common --json` | Machine-readable JSON | Scans a stable set of common local development ports |
| Plan mode | `ferman --plan --json` | Machine-readable JSON | Returns a recommended next action without terminating processes |
| Doctor mode | `ferman --doctor --json` | Machine-readable JSON | Returns a local development diagnosis and summary |
| Node process listing | `ferman --node --json` | Machine-readable JSON | Lists active Node.js processes with PID and command data |
| Node process listing with self | `ferman --node --self --json` | Machine-readable JSON | Includes the current `ferman` invocation in the process list |
| Node process port listing | `ferman --node-ports --json` | Machine-readable JSON | Lists active Node.js processes together with listening ports |
| JSON mode | `ferman 3000 --json` | Machine-readable JSON | Returns structured output for scripts, CI, and AI agents |
| JSON Schema | `ferman --json-schema` | Machine-readable JSON | Prints the JSON Schema for structured output consumers |
| Watch mode | `ferman 3000 --watch --json` | JSON event stream | Re-checks ports continuously and emits snapshot events |
| Changed-only watch mode | `ferman 3000 --watch --changed-only --json` | JSON event stream | Emits a new watch snapshot only when the result changes |
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

Verification status:

- macOS: verified in a live runtime environment
- Linux: implemented and parser-tested
- Windows: implemented and parser-tested

Development commands:

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
