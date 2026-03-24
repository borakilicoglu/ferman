import type { InspectPortProvider, PortInspectionResult, ProcessInfo } from "../types";
import { runCommand } from "../utils/process";

async function resolveWindowsProcessName(pid: number): Promise<string | undefined> {
  const result = await runCommand("tasklist", ["/FI", `PID eq ${pid}`, "/FO", "CSV", "/NH"]);

  if (result.code !== 0) {
    return undefined;
  }

  const line = result.stdout.trim();
  if (!line || /No tasks are running/i.test(line)) {
    return undefined;
  }

  const match = line.match(/^"([^"]+)"/);
  return match?.[1];
}

export function parseNetstatLine(line: string): number | undefined {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 5) {
    return undefined;
  }

  const pid = Number(parts[parts.length - 1]);
  return Number.isInteger(pid) && pid > 0 ? pid : undefined;
}

export function findListeningPids(output: string, port: number): number[] {
  return Array.from(
    new Set(
      output
        .split(/\r?\n/)
        .filter((line) => line.includes(`:${port}`) && /LISTENING/i.test(line))
        .map(parseNetstatLine)
        .filter((value): value is number => typeof value === "number")
    )
  );
}

export class WindowsPortProvider implements InspectPortProvider {
  async inspectPort(port: number): Promise<PortInspectionResult> {
    const result = await runCommand("netstat", ["-ano", "-p", "tcp"]);

    if (result.code !== 0) {
      if (/not recognized/i.test(result.stderr)) {
        throw new Error("Required system command is unavailable: netstat.");
      }

      throw new Error(result.stderr.trim() || "Failed to inspect port.");
    }

    const pids = findListeningPids(result.stdout, port);

    const processes = await Promise.all(
      pids.map(async (pid) => ({
        pid,
        name: await resolveWindowsProcessName(pid)
      }))
    );

    return {
      port,
      busy: processes.length > 0,
      processes
    };
  }

  async killProcesses(processes: ProcessInfo[]): Promise<void> {
    for (const processInfo of processes) {
      const result = await runCommand("taskkill", ["/PID", String(processInfo.pid), "/T", "/F"]);

      if (result.code !== 0) {
        const detail = result.stderr.trim() || result.stdout.trim() || "Unknown taskkill error.";
        throw new Error(`Failed to kill PID ${processInfo.pid}: ${detail}`);
      }
    }
  }
}
