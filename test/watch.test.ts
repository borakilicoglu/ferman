import { describe, expect, it } from "vitest";

import { createWatchHint } from "../src/utils/watch";

describe("createWatchHint", () => {
  it("returns a hint when a port becomes busy again", () => {
    const hint = createWatchHint(
      {
        ok: true,
        code: "PORT_FREE",
        port: 3000,
        busy: false,
        processes: [],
        action: "none",
        message: "Port is already free."
      },
      {
        ok: true,
        code: "PORT_INSPECTED",
        port: 3000,
        busy: true,
        processes: [{ pid: 1234, name: "node" }],
        action: "inspected",
        message: "Dry mode active. No processes were terminated."
      }
    );

    expect(hint).toBe(
      "Ports 3000 became busy again. A watcher, restart script, or container entrypoint may have recreated the listener."
    );
  });

  it("returns a hint when the same process family keeps a port busy", () => {
    const hint = createWatchHint(
      {
        ok: true,
        code: "PORT_INSPECTED",
        port: 5173,
        busy: true,
        processes: [{ pid: 1001, name: "vite" }],
        action: "inspected",
        message: "Dry mode active. No processes were terminated."
      },
      {
        ok: true,
        code: "PORT_INSPECTED",
        port: 5173,
        busy: true,
        processes: [{ pid: 1002, name: "vite" }],
        action: "inspected",
        message: "Dry mode active. No processes were terminated."
      }
    );

    expect(hint).toBe(
      "Ports 5173 are still owned by the same process family. If they keep reappearing, inspect the parent watcher or restart loop."
    );
  });

  it("returns undefined when there is no meaningful watch transition", () => {
    const hint = createWatchHint(
      {
        ok: true,
        code: "PORT_FREE",
        port: 3000,
        busy: false,
        processes: [],
        action: "none",
        message: "Port is already free."
      },
      {
        ok: true,
        code: "PORT_FREE",
        port: 3000,
        busy: false,
        processes: [],
        action: "none",
        message: "Port is already free."
      }
    );

    expect(hint).toBeUndefined();
  });
});
