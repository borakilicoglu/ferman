import { runCommand } from "./utils/process";
import {
  listNodeProcesses,
  type ListNodeProcessOptions,
  type NodeProcessInfo
} from "./nodeProcesses";

export interface NodePortProcessInfo extends NodeProcessInfo {
  ports: number[];
}

export interface NodePortListResult {
  ok: true;
  code: "NODE_PORTS_LISTED";
  processes: NodePortProcessInfo[];
  count: number;
  message: string;
}

function parseUnixListeningPorts(output: string): number[] {
  return Array.from(
    new Set(
      output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const match = line.match(/:(\d+)\s+\(LISTEN\)$/);
          return match ? Number(match[1]) : undefined;
        })
        .filter((value): value is number => value !== undefined && Number.isInteger(value) && value > 0)
    )
  ).sort((left, right) => left - right);
}

function parseWindowsListeningPorts(output: string, pid: number): number[] {
  return Array.from(
    new Set(
      output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => /LISTENING/i.test(line))
        .filter((line) => line.endsWith(` ${String(pid)}`))
        .map((line) => {
          const match = line.match(/:(\d+)\s+\S+\s+LISTENING\s+\d+$/i);
          return match ? Number(match[1]) : undefined;
        })
        .filter((value): value is number => value !== undefined && Number.isInteger(value) && value > 0)
    )
  ).sort((left, right) => left - right);
}

async function resolveUnixNodePorts(processInfo: NodeProcessInfo): Promise<NodePortProcessInfo | undefined> {
  const result = await runCommand("lsof", [
    "-nP",
    "-a",
    "-p",
    String(processInfo.pid),
    "-iTCP",
    "-sTCP:LISTEN"
  ]);

  if (result.code !== 0 && !result.stdout.trim()) {
    if (/not found/i.test(result.stderr)) {
      throw new Error("Required system command is unavailable: lsof.");
    }

    return undefined;
  }

  const ports = parseUnixListeningPorts(result.stdout);

  if (ports.length === 0) {
    return undefined;
  }

  return {
    ...processInfo,
    ports
  };
}

async function resolveWindowsNodePorts(processInfo: NodeProcessInfo): Promise<NodePortProcessInfo | undefined> {
  const result = await runCommand("netstat", ["-ano", "-p", "tcp"]);

  if (result.code !== 0) {
    if (/not recognized/i.test(result.stderr)) {
      throw new Error("Required system command is unavailable: netstat.");
    }

    throw new Error(result.stderr.trim() || "Failed to inspect port.");
  }

  const ports = parseWindowsListeningPorts(result.stdout, processInfo.pid);

  if (ports.length === 0) {
    return undefined;
  }

  return {
    ...processInfo,
    ports
  };
}

export async function listNodePorts(options: ListNodeProcessOptions = {}): Promise<NodePortListResult> {
  const platform = options.platform ?? process.platform;
  const processResult = await listNodeProcesses(options);
  const processes = await Promise.all(
    processResult.processes.map((processInfo) =>
      platform === "win32"
        ? resolveWindowsNodePorts(processInfo)
        : resolveUnixNodePorts(processInfo)
    )
  );

  const listeningProcesses = processes.filter(
    (processInfo): processInfo is NodePortProcessInfo => processInfo !== undefined
  );

  return {
    ok: true,
    code: "NODE_PORTS_LISTED",
    processes: listeningProcesses,
    count: listeningProcesses.length,
    message:
      listeningProcesses.length > 0
        ? "Listed active Node.js processes with listening ports."
        : "No active Node.js processes with listening ports were found."
  };
}

export { parseUnixListeningPorts, parseWindowsListeningPorts };
