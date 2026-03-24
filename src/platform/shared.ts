import type { ProcessInfo } from "../types";
import { runCommand } from "../utils/process";

export async function resolveUnixProcessName(pid: number): Promise<string | undefined> {
  const result = await runCommand("ps", ["-p", String(pid), "-o", "comm="]);

  if (result.code !== 0) {
    return undefined;
  }

  const name = result.stdout.trim();
  return name || undefined;
}

export async function killWithSignal(processes: ProcessInfo[]): Promise<void> {
  for (const processInfo of processes) {
    try {
      process.kill(processInfo.pid, "SIGTERM");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to kill PID ${processInfo.pid}: ${message}`);
    }
  }
}
