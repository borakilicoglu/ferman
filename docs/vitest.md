# Vitest

The fastest way to add tests to `ferman` is with `Vitest`. Since this is a small CLI utility, the test strategy should stay simple: pure utilities should be covered with unit tests, and CLI behavior should be covered with controlled integration tests.

## Why Vitest

- Fast execution
- Good TypeScript support
- A good fit for Node-based CLI projects
- Simple mocking and assertion APIs

## What Should Be Tested

The first test coverage should focus on:

- valid and invalid inputs for `parsePort`
- argument parsing behavior
- empty-port, dry-mode, and force-mode flows in `runFerman`
- parsing behavior inside platform providers
- stable JSON output shape

## Recommended Setup

Development dependency:

```bash
npm install -D vitest
```

Suggested `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Minimal `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"]
  }
});
```

## Example Unit Test

`parsePort` is a good place to start:

```ts
import { describe, expect, it } from "vitest";
import { parsePort } from "../src/utils/validatePort";

describe("parsePort", () => {
  it("accepts a valid port", () => {
    expect(parsePort("3000")).toBe(3000);
  });

  it("rejects an empty value", () => {
    expect(() => parsePort(undefined)).toThrow("Port is required.");
  });

  it("rejects ports outside the valid range", () => {
    expect(() => parsePort("0")).toThrow("Port must be between 1 and 65535.");
    expect(() => parsePort("70000")).toThrow("Port must be between 1 and 65535.");
  });
});
```

## CLI Test Strategy

Do not kill real processes during CLI tests unless the environment is tightly controlled.

Recommended approach:

- mock `runCommand`
- test platform-provider parsing separately
- isolate `confirmKill` with mocks or stubs for stdin/stdout behavior
- if you need full CLI coverage, run controlled child-process tests against `dist/cli.js`

## Notes For This Project

Because `ferman` depends on system commands, the test suite should be split into two layers:

- pure and deterministic logic: unit tests
- command-dependent behavior: mock-based integration tests

That split keeps the suite fast and reliable.

## Next Steps

The natural follow-up from this page is:

1. Add `Vitest` as a dev dependency
2. Create `test/validatePort.test.ts`
3. Add mock-based tests for `runFerman`
4. Add snapshot or shape assertions for JSON output
