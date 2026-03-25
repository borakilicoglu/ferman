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

export function parseUnixPsOutput(output: string): NodeProcessInfo[] {
  const items: Array<NodeProcessInfo | undefined> = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (!match) {
        return undefined;
      }

      return {
        pid: Number(match[1]),
        name: "node",
        command: match[2]
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

export async function listNodeProcesses(platform = process.platform): Promise<NodeProcessListResult> {
  let processes: NodeProcessInfo[] = [];

  if (platform === "win32") {
    const result = await runCommand("tasklist", ["/FI", "IMAGENAME eq node.exe", "/FO", "CSV", "/NH"]);
    processes = parseWindowsTasklistOutput(result.stdout);
  } else {
    const result = await runCommand("ps", ["-axo", "pid=,comm=,args="]);
    processes = parseUnixPsOutput(result.stdout).filter(
      (processInfo) =>
        /\bnode(\s|$)/i.test(processInfo.command ?? "") ||
        /\btsx(\s|$)/i.test(processInfo.command ?? "") ||
        /\bts-node(\s|$)/i.test(processInfo.command ?? "")
    );
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
