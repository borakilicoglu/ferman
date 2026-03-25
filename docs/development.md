# Development

This page covers the local workflow for contributing to `ferman`.

## Tooling

The repository uses:

- TypeScript
- Vitest
- ESLint
- Prettier
- Husky
- VitePress
- TOON

## Local Commands

Install dependencies:

```bash
npm install
```

Run the CLI in development:

```bash
npm run dev -- 3000 --dry
```

Run the MCP server in development:

```bash
npm run dev:mcp
```

The MCP wrapper exposes these tools:

- `inspect_ports`
- `release_ports`
- `doctor_ports`
- `list_node_processes`
- `list_node_ports`
- `get_output_schema`

Primary quality checks:

```bash
npm run lint
npm test
npm run typecheck
npm run build
npm run smoke
```

Full release check:

```bash
npm run release:check
```

## Test Strategy

`ferman` is a system-facing CLI, so the test suite is intentionally split into deterministic layers:

- utility tests for pure functions such as port validation
- flow tests for `runFerman`
- parser tests for platform-specific command output
- schema tests for machine-readable output contracts

The current suite avoids killing real processes during routine tests. Platform parsing and command execution behavior are tested with mocks and narrow parser tests.

## AI-Facing Surface

The current CLI now includes a larger AI-oriented feature set:

- strong JSON contract with stable success and error codes
- TOON output
- multi-port batch mode
- common-port scan
- plan mode recommendations
- doctor mode diagnosis
- JSON Schema output
- watch mode snapshot events
- MCP wrapper over stdio for tool-based integrations

## Commit Workflow

Husky runs `npm test` before each commit. This keeps the repo from drifting into a broken state during day-to-day changes.

## Docs Workflow

Documentation is built with VitePress and published through GitHub Pages.

Useful commands:

```bash
npm run docs:dev
npm run docs:build
npm run docs:preview
```

## Release Workflow

The repository uses tag-triggered publishing.

Typical flow:

1. Update code, tests, and docs
2. Update `CHANGELOG.md`
3. Run `npm run release:check`
4. Bump the package version
5. Push `main`
6. Push the version tag
7. Let GitHub Actions publish the package
