import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CliOptions, ProcessInfo } from "../src/types";

const inspectPort = vi.fn();
const killProcesses = vi.fn();
const confirmKill = vi.fn();

vi.mock("../src/platform", () => ({
  getPortProvider: () => ({
    inspectPort,
    killProcesses
  })
}));

vi.mock("../src/utils/confirm", () => ({
  confirmKill
}));

function createOptions(overrides: Partial<CliOptions> & Pick<CliOptions, "ports">): CliOptions {
  return {
    ports: overrides.ports,
    common: false,
    doctor: false,
    list: false,
    jsonSchema: false,
    node: false,
    nodePorts: false,
    killAll: false,
    self: false,
    name: undefined,
    filter: undefined,
    signal: undefined,
    force: false,
    dry: false,
    plan: false,
    watch: false,
    changedOnly: false,
    json: false,
    toon: false,
    ...overrides
  };
}

describe("runFerman", () => {
  beforeEach(() => {
    inspectPort.mockReset();
    killProcesses.mockReset();
    confirmKill.mockReset();
  });

  it("returns a no-op result when the port is already free", async () => {
    inspectPort.mockResolvedValue({
      port: 3000,
      busy: false,
      processes: []
    });

    const { runFermanBatch } = await import("../src/index");
    const result = await runFermanBatch(createOptions({ ports: [3000] }));

    expect(result).toEqual({
      ok: true,
      code: "PORT_FREE",
      port: 3000,
      busy: false,
      processes: [],
      action: "none",
      message: "Port is already free."
    });
    expect(killProcesses).not.toHaveBeenCalled();
    expect(confirmKill).not.toHaveBeenCalled();
  });

  it("inspects only in dry mode", async () => {
    const processes: ProcessInfo[] = [{ pid: 1234, name: "node" }];

    inspectPort.mockResolvedValue({
      port: 3000,
      busy: true,
      processes
    });

    const { runFermanBatch } = await import("../src/index");
    const result = await runFermanBatch(createOptions({ ports: [3000], dry: true, json: true }));

    expect(result).toEqual({
      ok: true,
      code: "PORT_INSPECTED",
      port: 3000,
      busy: true,
      processes,
      action: "inspected",
      message: "Dry mode active. No processes were terminated."
    });
    expect(killProcesses).not.toHaveBeenCalled();
    expect(confirmKill).not.toHaveBeenCalled();
  });

  it("kills processes immediately in force mode", async () => {
    const processes: ProcessInfo[] = [{ pid: 5678, name: "node" }];

    inspectPort.mockResolvedValue({
      port: 3000,
      busy: true,
      processes
    });
    killProcesses.mockResolvedValue(undefined);

    const { runFermanBatch } = await import("../src/index");
    const result = await runFermanBatch(createOptions({ ports: [3000], force: true }));

    expect(killProcesses).toHaveBeenCalledWith(processes, undefined);
    expect(confirmKill).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      code: "PORT_RELEASED",
      port: 3000,
      busy: true,
      processes,
      action: "killed",
      message: "Port released."
    });
  });

  it("passes a custom signal to port termination", async () => {
    const processes: ProcessInfo[] = [{ pid: 7777, name: "node" }];

    inspectPort.mockResolvedValue({
      port: 3000,
      busy: true,
      processes
    });
    killProcesses.mockResolvedValue(undefined);

    const { runFermanBatch } = await import("../src/index");
    await runFermanBatch(createOptions({ ports: [3000], force: true, signal: "SIGKILL" }));

    expect(killProcesses).toHaveBeenCalledWith(processes, "SIGKILL");
  });

  it("does not kill when confirmation is declined", async () => {
    const processes: ProcessInfo[] = [{ pid: 9999, name: "node" }];

    inspectPort.mockResolvedValue({
      port: 3000,
      busy: true,
      processes
    });
    confirmKill.mockResolvedValue(false);

    const { runFermanBatch } = await import("../src/index");
    const result = await runFermanBatch(createOptions({ ports: [3000] }));

    expect(confirmKill).toHaveBeenCalledWith(3000);
    expect(killProcesses).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      code: "OPERATION_CANCELLED",
      port: 3000,
      busy: true,
      processes,
      action: "inspected",
      message: "Operation cancelled."
    });
  });

  it("returns a batch result for multiple ports", async () => {
    inspectPort
      .mockResolvedValueOnce({
        port: 3000,
        busy: false,
        processes: []
      })
      .mockResolvedValueOnce({
        port: 5173,
        busy: true,
        processes: [{ pid: 1234, name: "node" }]
      });

    const { runFermanBatch } = await import("../src/index");
    const result = await runFermanBatch(createOptions({ ports: [3000, 5173], dry: true, json: true }));

    expect(result).toEqual({
      ok: true,
      code: "BATCH_COMPLETED",
      ports: [
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
          port: 5173,
          busy: true,
          processes: [{ pid: 1234, name: "node" }],
          action: "inspected",
          message: "Dry mode active. No processes were terminated."
        }
      ],
      summary: {
        total: 2,
        busy: 1,
        free: 1,
        released: 0,
        inspected: 1
      }
    });
  });

  it("returns a recommendation in plan mode", async () => {
    const processes: ProcessInfo[] = [{ pid: 1234, name: "node" }];

    inspectPort.mockResolvedValue({
      port: 3000,
      busy: true,
      processes
    });

    const { runFermanBatch } = await import("../src/index");
    const result = await runFermanBatch(createOptions({ ports: [3000], plan: true, json: true }));

    expect(result).toEqual({
      ok: true,
      code: "PORT_INSPECTED",
      port: 3000,
      busy: true,
      processes,
      action: "inspected",
      message: "Plan mode active. No processes were terminated.",
      recommendation: {
        action: "terminate",
        reason:
          "A single app-style development process is holding the port, so a targeted stop is a reasonable next step.",
        risk: "low"
      }
    });
    expect(killProcesses).not.toHaveBeenCalled();
    expect(confirmKill).not.toHaveBeenCalled();
  });

  it("returns a more cautious recommendation for common service ports in plan mode", async () => {
    const processes: ProcessInfo[] = [{ pid: 4321, name: "postgres" }];

    inspectPort.mockResolvedValue({
      port: 5432,
      busy: true,
      processes
    });

    const { runFermanBatch } = await import("../src/index");
    const result = await runFermanBatch(createOptions({ ports: [5432], plan: true, json: true }));

    expect(result).toEqual({
      ok: true,
      code: "PORT_INSPECTED",
      port: 5432,
      busy: true,
      processes,
      action: "inspected",
      message: "Plan mode active. No processes were terminated.",
      recommendation: {
        action: "terminate",
        reason:
          "A single process is using a common local service port, so verify it is not expected infrastructure before terminating it.",
        risk: "low"
      }
    });
  });

  it("returns diagnosis data in doctor mode", async () => {
    inspectPort
      .mockResolvedValueOnce({
        port: 3000,
        busy: false,
        processes: []
      })
      .mockResolvedValueOnce({
        port: 3001,
        busy: true,
        processes: [{ pid: 5678, name: "node" }]
      });

    const { runFermanBatch } = await import("../src/index");
    const result = await runFermanBatch(createOptions({ ports: [3000, 3001], doctor: true, dry: true, json: true }));

    expect(result).toEqual({
      ok: true,
      code: "BATCH_COMPLETED",
      ports: [
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
          port: 3001,
          busy: true,
          processes: [{ pid: 5678, name: "node" }],
          action: "inspected",
          message: "Dry mode active. No processes were terminated."
        }
      ],
      summary: {
        total: 2,
        busy: 1,
        free: 1,
        released: 0,
        inspected: 1
      },
      diagnosis: {
        status: "attention",
        message: "Some checked ports are busy in an app-style development loop: 3001.",
        recommendations: [
          "Run `ferman --plan --json` on a specific busy port for a safer next-step recommendation.",
          "Use `ferman <port> --dry` to inspect a busy port without terminating anything.",
          "Busy app-style ports (3001) look like a leftover local dev loop. Check watcher or restart scripts before forcing a kill."
        ]
      }
    });
  });

  it("adds service and multi-process guidance in doctor mode", async () => {
    inspectPort
      .mockResolvedValueOnce({
        port: 5432,
        busy: true,
        processes: [{ pid: 7001, name: "postgres" }]
      })
      .mockResolvedValueOnce({
        port: 5173,
        busy: true,
        processes: [{ pid: 7002, name: "node" }, { pid: 7003, name: "vite" }]
      });

    const { runFermanBatch } = await import("../src/index");
    const result = await runFermanBatch(createOptions({ ports: [5432, 5173], doctor: true, dry: true, json: true }));

    expect(result).toEqual({
      ok: true,
      code: "BATCH_COMPLETED",
      ports: [
        {
          ok: true,
          code: "PORT_INSPECTED",
          port: 5432,
          busy: true,
          processes: [{ pid: 7001, name: "postgres" }],
          action: "inspected",
          message: "Dry mode active. No processes were terminated."
        },
        {
          ok: true,
          code: "PORT_INSPECTED",
          port: 5173,
          busy: true,
          processes: [{ pid: 7002, name: "node" }, { pid: 7003, name: "vite" }],
          action: "inspected",
          message: "Dry mode active. No processes were terminated."
        }
      ],
      summary: {
        total: 2,
        busy: 2,
        free: 0,
        released: 0,
        inspected: 2
      },
      diagnosis: {
        status: "attention",
        message: "Some checked ports are busy across app and service workflows: 5432, 5173.",
        recommendations: [
          "Run `ferman --plan --json` on a specific busy port for a safer next-step recommendation.",
          "Use `ferman <port> --dry` to inspect a busy port without terminating anything.",
          "Busy app-style ports (5173) look like a leftover local dev loop. Check watcher or restart scripts before forcing a kill.",
          "Service-style ports (5432) are busy. Confirm whether a local database, cache, or forwarded container port is expected before terminating it.",
          "Ports with multiple attached processes (5173) need extra inspection because a parent watcher or proxy may respawn them."
        ]
      }
    });
  });
});
