import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProcessInfo } from "../src/types";

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
    const result = await runFermanBatch({
      ports: [3000],
      common: false,
      doctor: false,
      force: false,
      dry: false,
      plan: false,
      json: false,
      toon: false
    });

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
    const result = await runFermanBatch({
      ports: [3000],
      common: false,
      doctor: false,
      force: false,
      dry: true,
      plan: false,
      json: true,
      toon: false
    });

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
    const result = await runFermanBatch({
      ports: [3000],
      common: false,
      doctor: false,
      force: true,
      dry: false,
      plan: false,
      json: false,
      toon: false
    });

    expect(killProcesses).toHaveBeenCalledWith(processes);
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

  it("does not kill when confirmation is declined", async () => {
    const processes: ProcessInfo[] = [{ pid: 9999, name: "node" }];

    inspectPort.mockResolvedValue({
      port: 3000,
      busy: true,
      processes
    });
    confirmKill.mockResolvedValue(false);

    const { runFermanBatch } = await import("../src/index");
    const result = await runFermanBatch({
      ports: [3000],
      common: false,
      doctor: false,
      force: false,
      dry: false,
      plan: false,
      json: false,
      toon: false
    });

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
    const result = await runFermanBatch({
      ports: [3000, 5173],
      common: false,
      doctor: false,
      force: false,
      dry: true,
      plan: false,
      json: true,
      toon: false
    });

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
    const result = await runFermanBatch({
      ports: [3000],
      common: false,
      force: false,
      dry: false,
      plan: true,
      json: true,
      toon: false
    });

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
          "A single process is using the port, so targeted termination is a reasonable next step.",
        risk: "low"
      }
    });
    expect(killProcesses).not.toHaveBeenCalled();
    expect(confirmKill).not.toHaveBeenCalled();
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
    const result = await runFermanBatch({
      ports: [3000, 3001],
      common: false,
      doctor: true,
      force: false,
      dry: true,
      plan: false,
      json: true,
      toon: false
    });

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
        message: "Some checked ports are busy: 3001.",
        recommendations: [
          "Review the busy ports before terminating processes.",
          "Use --plan for recommendations or --dry for inspection-only output."
        ]
      }
    });
  });
});
