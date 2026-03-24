import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProcessInfo } from "../src/types";

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

    const { runFerman } = await import("../src/index");
    const result = await runFerman({
      port: 3000,
      force: false,
      dry: false,
      json: false
    });

    expect(result).toEqual({
      port: 3000,
      busy: false,
      processes: [],
      action: "none",
      message: "Port zaten bos."
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

    const { runFerman } = await import("../src/index");
    const result = await runFerman({
      port: 3000,
      force: false,
      dry: true,
      json: true
    });

    expect(result).toEqual({
      port: 3000,
      busy: true,
      processes,
      action: "inspected",
      message: "Dry mod aktif. Hicbir surec sonlandirilmadi."
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

    const { runFerman } = await import("../src/index");
    const result = await runFerman({
      port: 3000,
      force: true,
      dry: false,
      json: false
    });

    expect(killProcesses).toHaveBeenCalledWith(processes);
    expect(confirmKill).not.toHaveBeenCalled();
    expect(result).toEqual({
      port: 3000,
      busy: true,
      processes,
      action: "killed",
      message: "Ferman verildi."
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

    const { runFerman } = await import("../src/index");
    const result = await runFerman({
      port: 3000,
      force: false,
      dry: false,
      json: false
    });

    expect(confirmKill).toHaveBeenCalledWith(3000);
    expect(killProcesses).not.toHaveBeenCalled();
    expect(result).toEqual({
      port: 3000,
      busy: true,
      processes,
      action: "inspected",
      message: "Islem iptal edildi."
    });
  });
});
