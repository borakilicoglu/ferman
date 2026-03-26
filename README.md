<p align="center">
  <img src="./assets/logo.svg" alt="ferman logo" width="140" />
</p>

<h1 align="center">ferman</h1>

<p align="center">
  <b>Inspect busy ports, identify the owning process, and release them with predictable output for humans and automation.</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ferman"><img src="https://img.shields.io/npm/v/ferman.svg" /></a>
  <a href="https://www.npmjs.com/package/ferman"><img src="https://img.shields.io/npm/dt/ferman.svg" /></a>
  <a href="https://packagephobia.com/result?p=ferman"><img src="https://badgen.net/packagephobia/install/ferman" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/ferman.svg" /></a>
</p>

---

## Overview

`ferman` is a cross-platform CLI for inspecting busy ports, identifying the owning process, and releasing the port safely when needed.

It is built for:

- interactive terminal use with explicit confirmation
- local debugging of blocked development ports
- scripts, CI, and agent workflows that need stable machine-readable output
- MCP integrations over stdio

## Quick Start

Run without installing:

```bash
npx ferman 3000
```

Install globally:

```bash
npm install -g ferman
ferman 3000
```

## Common Commands

Inspect a port:

```bash
npx ferman 3000
```

Release a port without confirmation:

```bash
npx ferman 3000 --force
```

Inspect without terminating anything:

```bash
npx ferman 3000 --dry
```

Inspect multiple ports:

```bash
npx ferman 3000 5173 5432
```

List active listening ports:

```bash
npx ferman --list
```

List active Node.js processes:

```bash
npx ferman --node
```

List active Node.js processes with listening ports:

```bash
npx ferman --node-ports
```

Kill all matching processes by pattern:

```bash
npx ferman --kill-all --name vite
```

## Automation and MCP

Structured JSON output:

```bash
npx ferman 3000 --json
```

LLM-oriented TOON output:

```bash
npx ferman 3000 --toon
```

Plan mode without termination:

```bash
npx ferman 3000 --plan --json
```

Watch mode:

```bash
npx ferman 3000 --watch --json
```

MCP wrapper over stdio:

```bash
npx -p ferman ferman-mcp
```

Exposed MCP tools:

- `inspect_ports`
- `release_ports`
- `doctor_ports`
- `list_node_processes`
- `list_node_ports`
- `get_output_schema`

## Capabilities

- inspect and release ports on macOS, Linux, and Windows
- inspect without termination using `--dry` and recommendation-oriented `--plan`
- list active listening ports with `--list`
- scan common local development ports with `--common` and `--doctor`
- list active Node.js processes and their listening ports
- target matching processes by name or command pattern with `--kill-all --name`
- emit stable JSON and TOON output for scripts, CI, and LLM-oriented workflows
- expose CLI operations through `ferman-mcp`
- keep exit codes and machine-readable error shapes predictable

## When to Use It

Use `ferman` when:

- a local port is busy and you need to see what owns it
- you want an explicit way to release a blocked port
- you need structured output for tooling or agents
- you want a small CLI instead of platform-specific command chains

Do not use `ferman` when:

- you need container orchestration or deployment automation
- you want implicit destructive cleanup across an entire environment
- the problem is remote TLS, proxying, or infrastructure rather than local listeners

## Example Output

JSON:

```json
{
  "ok": true,
  "code": "PORT_RELEASED",
  "port": 3000,
  "busy": true,
  "action": "killed",
  "message": "Port released."
}
```

TOON:

```toon
ok: true
code: PORT_RELEASED
port: 3000
busy: true
processes[1]{pid,name}:
  1234,node
action: killed
message: Port released.
```

## Philosophy

> Dev tools should be fast, predictable, and boring.

`ferman` keeps local ports and processes observable and manageable without hiding destructive actions behind ambiguous automation.

## Support

If `ferman` saves you time:

- Star the repo
- Support via GitHub Sponsors

https://github.com/sponsors/borakilicoglu

## Links

- GitHub: https://github.com/borakilicoglu/ferman
- npm: https://www.npmjs.com/package/ferman
- Docs: https://borakilicoglu.github.io/ferman/
