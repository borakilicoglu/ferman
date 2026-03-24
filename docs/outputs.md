# Machine Output

`ferman` supports two machine-readable output modes:

- `--json` for standard automation, scripts, and CI
- `--toon` for compact, LLM-oriented structured output

Use these modes when you need predictable parsing instead of human-readable terminal text.

## JSON Mode

JSON mode is the default structured output format for integrations.

```bash
ferman 3000 --json
```

Example success result:

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
  "message": "Dry mode active. No processes were terminated."
}
```

Example error result:

```json
{
  "ok": false,
  "code": "INVALID_PORT",
  "message": "Port must be a whole number."
}
```

## TOON Mode

TOON mode is useful when the output is consumed by LLM-oriented workflows and token efficiency matters more than ecosystem ubiquity.

```bash
ferman 3000 --toon
```

Example success result:

```toon
ok: true
code: PORT_INSPECTED
port: 3000
busy: true
processes[1]{pid,name}:
  1234,node
action: inspected
message: Dry mode active. No processes were terminated.
```

Example error result:

```toon
ok: false
code: INVALID_PORT
message: Port must be a whole number.
```

## Batch Output

Multi-port mode returns a batch result with a summary:

```bash
ferman 3000 5173 5432 --json
```

Example batch result:

```json
{
  "ok": true,
  "code": "BATCH_COMPLETED",
  "ports": [],
  "summary": {
    "total": 3,
    "busy": 0,
    "free": 3,
    "released": 0,
    "inspected": 0
  }
}
```

## Plan Mode

Plan mode adds a recommendation without terminating anything:

```bash
ferman 3000 --plan --json
```

Example recommendation:

```json
{
  "recommendation": {
    "action": "terminate",
    "reason": "A single process is using the port, so targeted termination is a reasonable next step.",
    "risk": "low"
  }
}
```

## Doctor Mode

Doctor mode uses the common-port scan and adds a diagnosis layer:

```bash
ferman --doctor --json
```

Example diagnosis:

```json
{
  "diagnosis": {
    "status": "healthy",
    "message": "All checked ports are free.",
    "recommendations": [
      "No action required."
    ]
  }
}
```

## JSON Schema

Print the current JSON Schema for machine-readable output:

```bash
ferman --json-schema
```

This is useful for wrappers, validators, MCP tools, and agent integrations that want an explicit schema contract.

## Watch Mode

Watch mode emits structured snapshots repeatedly without terminating anything:

```bash
ferman 3000 --watch --json
```

Example watch event:

```json
{
  "event": "snapshot",
  "iteration": 1,
  "timestamp": "2026-03-24T16:27:59.455Z",
  "result": {
    "ok": true,
    "code": "PORT_FREE",
    "port": 3000,
    "busy": false,
    "processes": [],
    "action": "none",
    "message": "Port is already free."
  }
}
```

## Selection Rules

- use `--json` when the consumer expects standard structured data
- use `--toon` when the consumer is an LLM-oriented pipeline and compactness matters
- do not combine `--json` and `--toon` in the same command
- use `--json-schema` when an integration needs a formal contract
- use `--watch` when a consumer needs repeated snapshots over time

## Exit Codes

Structured output does not change exit-code behavior:

- `0`: success
- `1`: runtime error
- `2`: invalid input
