import { InspectPortProvider, PortInspectionResult, ProcessInfo } from "../types";
import { runCommand } from "../utils/process";
import { killWithSignal, resolveUnixProcessName } from "./shared";

async function inspectWithLsof(port: number): Promise<ProcessInfo[]> {
  const result = await runCommand("lsof", ["-nP", "-iTCP:" + String(port), "-sTCP:LISTEN", "-t"]);

  if (result.code !== 0 && !result.stdout.trim()) {
    if (/not found/i.test(result.stderr)) {
      throw new Error("Required system command is unavailable: lsof.");
    }

    return [];
  }

  const pids = Array.from(
    new Set(
      result.stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => Number(line))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  );

  const processes = await Promise.all(
    pids.map(async (pid) => ({
      pid,
      name: await resolveUnixProcessName(pid)
    }))
  );

  return processes;
}

export class LinuxPortProvider implements InspectPortProvider {
  async inspectPort(port: number): Promise<PortInspectionResult> {
    const processes = await inspectWithLsof(port);
    return {
      port,
      busy: processes.length > 0,
      processes
    };
  }

  async killProcesses(processes: ProcessInfo[]): Promise<void> {
    await killWithSignal(processes);
  }
}
