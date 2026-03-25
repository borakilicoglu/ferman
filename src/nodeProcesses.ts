import { runCommand } from "./utils/process";

export interface NodeProcessInfo {
  pid: number;
  name: string;
  command?: string;
}

export interface NodeProcessListResult {
  ok: true;
  code: "NODE_PROCESSES_LISTED";
  processes: NodeProcessInfo[];
  count: number;
  message: string;
}

function normalizeCommand(command?: string): string | undefined {
  if (!command) {
    return undefined;
  }

  const normalized = command.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return undefined;
  }

  const executablePrefix =
    /^(node|tsx|ts-node)\s+/i.exec(normalized)?.[0];

  if (!executablePrefix) {
    return normalized;
  }

  const trimmed = normalized.slice(executablePrefix.length).trim();
  return trimmed || normalized;
}

function shouldIncludeNodeProcess(processInfo: NodeProcessInfo): boolean {
  if (processInfo.pid === process.pid) {
    return false;
  }

  const command = processInfo.command ?? "";

  if (/\b(?:npm|npx)\s+(?:exec|run)\s+ferman\b/i.test(command)) {
    return false;
  }

  if (/\bferman\b.+\b--node(?:-ports)?\b/i.test(command)) {
    return false;
  }

  if (/(?:^|\s)dist[\\/]cli\.js\b.*\b--node(?:-ports)?\b/i.test(command)) {
    return false;
  }

  if (/[\\/]ferman(?:\.cmd|\.exe)?\b/i.test(command)) {
    return false;
  }

  return true;
}

export function parseUnixPsOutput(output: string): NodeProcessInfo[] {
  const items: Array<NodeProcessInfo | undefined> = output
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

  return items.filter((value): value is NodeProcessInfo => value !== undefined);
}

export function parseWindowsTasklistOutput(output: string): NodeProcessInfo[] {
  const items: Array<NodeProcessInfo | undefined> = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/No tasks are running/i.test(line))
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

  return items.filter((value): value is NodeProcessInfo => value !== undefined);
}

export interface ListNodeProcessOptions {
  platform?: NodeJS.Platform;
  includeSelf?: boolean;
}

export async function listNodeProcesses(
  options: ListNodeProcessOptions = {}
): Promise<NodeProcessListResult> {
  const platform = options.platform ?? process.platform;
  const includeSelf = options.includeSelf ?? false;
  let processes: NodeProcessInfo[] = [];

  if (platform === "win32") {
    const result = await runCommand("tasklist", ["/FI", "IMAGENAME eq node.exe", "/FO", "CSV", "/NH"]);
    processes = parseWindowsTasklistOutput(result.stdout);
  } else {
    const result = await runCommand("ps", ["-axo", "pid=,comm=,args="]);
    processes = parseUnixPsOutput(result.stdout).filter(
      (processInfo) =>
        processInfo.name === "node" ||
        processInfo.name === "tsx" ||
        processInfo.name === "ts-node" ||
        /\bnode(\s|$)/i.test(processInfo.command ?? "") ||
        /\btsx(\s|$)/i.test(processInfo.command ?? "") ||
        /\bts-node(\s|$)/i.test(processInfo.command ?? "")
    );
  }

  if (!includeSelf) {
    processes = processes.filter(shouldIncludeNodeProcess);
  }

  return {
    ok: true,
    code: "NODE_PROCESSES_LISTED",
    processes,
    count: processes.length,
    message:
      processes.length > 0
        ? "Listed active Node.js processes."
        : "No active Node.js processes were found."
  };
}
