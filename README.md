<p align="center">
  <img src="./assets/logo.svg" alt="ferman logo" width="140" />
</p>

<h1 align="center">ferman</h1>

<p align="center">
  <b>A CLI tool to inspect, diagnose, and manage local ports and processes with predictable output for humans and AI agents.</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ferman"><img src="https://img.shields.io/npm/v/ferman.svg" /></a>
  <a href="https://www.npmjs.com/package/ferman"><img src="https://img.shields.io/npm/dt/ferman.svg" /></a>
  <a href="https://packagephobia.com/result?p=ferman"><img src="https://badgen.net/packagephobia/install/ferman" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/ferman.svg" /></a>
</p>

---

## ⚡ What is ferman?

`ferman` is a CLI tool that tells you:

👉 what’s running on a port  
👉 and frees it instantly

No guessing. No digging. No manual killing.

---

## 🚀 Quick Start

```bash
npx ferman 3000
```

That’s it.

---

## 🧠 What it does

- finds the process using a port
- shows what it is
- lets you safely terminate it
- works across macOS, Linux, and Windows
- JSON and TOON output for automation and LLM workflows
- listening port inventory
- process targeting with `--kill-all --name`
- includes an MCP wrapper for agent tool integration

---

## 🔥 Why use it?

Every dev hits this:

```bash
Error: port 3000 already in use
```

Instead of:

- searching PID
- running multiple commands
- guessing processes

👉 just run:

```bash
npx ferman 3000
```

---

## ⚡ Common Usage

Inspect a port:

```bash
npx ferman 3000
```

Force kill:

```bash
npx ferman 3000 --force
```

Dry run:

```bash
npx ferman 3000 --dry
```

Multiple ports:

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

Filter Node.js processes:

```bash
npx ferman --node --filter mcp
```

List active Node.js processes with listening ports:

```bash
npx ferman --node-ports
```

Kill all matching processes by pattern:

```bash
npx ferman --kill-all --name vite
```

---

## 🤖 For Scripts, CI & AI

Machine-readable output:

```bash
npx ferman 3000 --json
```

Listening ports inventory:

```bash
npx ferman --list --json
```

LLM-friendly structured output:

```bash
npx ferman 3000 --toon
```

Node.js processes with listening ports:

```bash
npx ferman --node-ports --json
```

Include the current `ferman` process in node listings:

```bash
npx ferman --node --self --json
```

Filter node-oriented listings:

```bash
npx ferman --node --filter mcp --json
```

Kill matching processes with a custom signal:

```bash
npx ferman --kill-all --name vite --signal SIGKILL --json
```

Plan mode (no kill, just recommendation):

```bash
npx ferman 3000 --plan --json
```

Watch mode:

```bash
npx ferman 3000 --watch --json
```

Watch mode, only on change:

```bash
npx ferman 3000 --watch --changed-only --json
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

---

## 🧾 Example Output

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

---

## ⚙️ Features

- cross-platform (macOS, Linux, Windows)
- safe process termination
- port inspection and release
- JSON and TOON output for automation and LLM workflows
- listening port inventory
- Node.js process and port visibility
- process targeting by name or command pattern
- optional self-inclusion for node-oriented diagnostics
- configurable kill signals on Unix-like systems
- multi-port support
- plan & dry modes
- watch mode
- changed-only watch mode
- MCP wrapper for agent tool integration
- predictable exit codes
- AI / agent-friendly output

---

## 📦 Install

```bash
npm install -g ferman
```

or just use:

```bash
npx ferman 3000
```

---

## 🧠 Philosophy

> Dev tools should be fast, predictable, and boring.

`ferman` keeps local ports and processes observable and manageable  
without friction.

---

## ❤️ Support

If this tool saves you time:

⭐ Star the repo  
☕ Support via GitHub Sponsors

https://github.com/sponsors/borakilicoglu

---

## 🔗 Links

- GitHub: https://github.com/borakilicoglu/ferman
- npm: https://www.npmjs.com/package/ferman
- Docs: https://borakilicoglu.github.io/ferman/
