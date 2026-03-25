import type { ProcessInfo } from "./types";
import { runCommand } from "./utils/process";

export interface ProcessListEntry extends ProcessInfo {
  command?: string;
}

export interface ProcessKillResult {
  ok: true;
  code: "NO_MATCHING_PROCESSES" | "PROCESSES_KILLED";
  processes: ProcessListEntry[];
  count: number;
  signal?: NodeJS.Signals;
  message: string;
}

function normalizeCommand(command?: string): string | undefined {
  if (!command) {
    return undefined;
  }

  const normalized = command.replace(/\s+/g, " ").trim();
  return normalized || undefined;
}

function shouldExcludeSelf(entry: ProcessListEntry): boolean {
  if (entry.pid === process.pid) {
    return true;
  }

  const command = entry.command ?? "";
  return /\bferman(?:-mcp)?\b/i.test(command) || /\bnpm\b.+\bferman\b/i.test(command);
}

function matchesPattern(entry: ProcessListEntry, pattern: string): boolean {
  const needle = pattern.trim().toLowerCase();

  if (!needle) {
    return false;
  }

  return (
    (entry.name ?? "").toLowerCase().includes(needle) ||
    (entry.command ?? "").toLowerCase().includes(needle)
  );
}

export function parseUnixProcessTable(output: string): ProcessListEntry[] {
  const entries: Array<ProcessListEntry | undefined> = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s+(\S+)\s+(.+)$/);

      if (!match) {
        return undefined;
      }

      return {
        pid: Number(match[1]),
        name: match[2],
        command: normalizeCommand(match[3])
      };
    });

  return entries.filter((entry): entry is ProcessListEntry => entry !== undefined);
}

export function parseWindowsProcessTable(output: string): ProcessListEntry[] {
  const entries: Array<ProcessListEntry | undefined> = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^INFO:/i.test(line))
    .map((line) => {
      const match = line.match(/^"([^"]+)","(\d+)"/);

      if (!match) {
        return undefined;
      }

      return {
        pid: Number(match[2]),
        name: match[1]
      };
    });

  return entries.filter((entry): entry is ProcessListEntry => entry !== undefined);
}

export async function listProcessesByPattern(
  pattern: string,
  platform = process.platform
): Promise<ProcessListEntry[]> {
  let processes: ProcessListEntry[] = [];

  if (platform === "win32") {
    const result = await runCommand("tasklist", ["/FO", "CSV", "/NH"]);
    processes = parseWindowsProcessTable(result.stdout);
  } else {
    const result = await runCommand("ps", ["-axo", "pid=,comm=,args="]);
    processes = parseUnixProcessTable(result.stdout);
  }

  return processes.filter((entry) => !shouldExcludeSelf(entry)).filter((entry) => matchesPattern(entry, pattern));
}

export async function killProcessesByPattern(
  pattern: string,
  signal?: NodeJS.Signals,
  platform = process.platform
): Promise<ProcessKillResult> {
  const processes = await listProcessesByPattern(pattern, platform);

  if (processes.length === 0) {
    return {
      ok: true,
      code: "NO_MATCHING_PROCESSES",
      processes: [],
      count: 0,
      signal,
      message: `No matching processes were found for pattern "${pattern}".`
    };
  }

  if (platform === "win32") {
    for (const processInfo of processes) {
      const result = await runCommand("taskkill", ["/PID", String(processInfo.pid), "/T", "/F"]);

      if (result.code !== 0) {
        const detail = result.stderr.trim() || result.stdout.trim() || "Unknown taskkill error.";
        throw new Error(`Failed to kill PID ${processInfo.pid}: ${detail}`);
      }
    }
  } else {
    const effectiveSignal = signal ?? "SIGTERM";

    for (const processInfo of processes) {
      try {
        process.kill(processInfo.pid, effectiveSignal);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to kill PID ${processInfo.pid}: ${message}`);
      }
    }
  }

  return {
    ok: true,
    code: "PROCESSES_KILLED",
    processes,
    count: processes.length,
    signal: platform === "win32" ? undefined : signal ?? "SIGTERM",
    message:
      processes.length === 1
        ? `Killed 1 matching process for pattern "${pattern}".`
        : `Killed ${String(processes.length)} matching processes for pattern "${pattern}".`
  };
}
