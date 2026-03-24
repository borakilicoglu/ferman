# AGENTS

This repository is intentionally small. Agents working in this codebase should optimize for clarity, predictable behavior, and low dependency weight.

## Product Intent

`ferman` is a cross-platform CLI that inspects busy ports and can release them safely. The tool is designed for both humans and AI agents, so output should stay deterministic and machine-readable when `--json` is used.

## Engineering Rules

- Keep dependencies minimal
- Prefer readable TypeScript over abstraction-heavy patterns
- Preserve cross-platform behavior across `darwin`, `linux`, and `win32`
- Keep CLI output minimal and stable
- Avoid introducing hidden side effects in inspection flows
- Do not make destructive process-killing behavior less explicit

## Testing Expectations

- Add or update tests for behavior changes
- Prefer unit tests for pure utilities
- Use mocks for command execution and confirmation flows
- Avoid tests that kill real processes unless the environment is controlled

## Release Expectations

- Update `CHANGELOG.md` for user-visible changes
- Keep `README.md` aligned with actual CLI behavior
- Ensure `npm test`, `npm run typecheck`, and `npm run build` pass before release
