import { runCommand } from "./utils/process";

export interface PortListEntry {
  port: number;
  processes: Array<{
    pid: number;
    name?: string;
  }>;
}

export interface PortListResult {
  ok: true;
  code: "PORTS_LISTED";
  ports: PortListEntry[];
  count: number;
  message: string;
}

type UnixPortRow = {
  port: number;
  pid: number;
  name?: string;
};

function decodeEscapedProcessName(name: string): string {
  return name.replace(/\\x([0-9A-Fa-f]{2})/g, (_match, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16))
  );
}

export function parseUnixPortListOutput(output: string): UnixPortRow[] {
  const rows: Array<UnixPortRow | undefined> = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("COMMAND"))
    .map((line) => {
      const match = line.match(/^(\S+)\s+(\d+)\s+.+TCP\s+.+:(\d+)\s+\(LISTEN\)$/);
      if (!match) {
        return undefined;
      }

      return {
        name: decodeEscapedProcessName(match[1]),
        pid: Number(match[2]),
        port: Number(match[3])
      };
    });

  return rows.filter((value): value is UnixPortRow => value !== undefined);
}

export function parseWindowsPortListOutput(output: string): Array<{ port: number; pid: number }> {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => /LISTENING/i.test(line))
    .map((line) => {
      const match = line.match(/:(\d+)\s+\S+\s+LISTENING\s+(\d+)$/i);
      if (!match) {
        return undefined;
      }

      return {
        port: Number(match[1]),
        pid: Number(match[2])
      };
    })
    .filter((value): value is { port: number; pid: number } => value !== undefined);
}

function groupPortRows(rows: UnixPortRow[]): PortListEntry[] {
  const grouped = new Map<number, PortListEntry>();

  for (const row of rows) {
    const entry = grouped.get(row.port) ?? {
      port: row.port,
      processes: []
    };

    if (!entry.processes.some((processInfo) => processInfo.pid === row.pid)) {
      entry.processes.push({
        pid: row.pid,
        name: row.name
      });
    }

    grouped.set(row.port, entry);
  }

  return Array.from(grouped.values()).sort((left, right) => left.port - right.port);
}

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

async function listUnixPorts(): Promise<PortListEntry[]> {
  const result = await runCommand("lsof", ["-nP", "-iTCP", "-sTCP:LISTEN"]);

  if (result.code !== 0 && !result.stdout.trim()) {
    if (/not found/i.test(result.stderr)) {
      throw new Error("Required system command is unavailable: lsof.");
    }

    return [];
  }

  return groupPortRows(parseUnixPortListOutput(result.stdout));
}

async function listWindowsPorts(): Promise<PortListEntry[]> {
  const result = await runCommand("netstat", ["-ano", "-p", "tcp"]);

  if (result.code !== 0) {
    if (/not recognized/i.test(result.stderr)) {
      throw new Error("Required system command is unavailable: netstat.");
    }

    throw new Error(result.stderr.trim() || "Failed to inspect port.");
  }

  const rows = parseWindowsPortListOutput(result.stdout);
  const grouped = new Map<number, PortListEntry>();

  for (const row of rows) {
    const entry = grouped.get(row.port) ?? {
      port: row.port,
      processes: []
    };

    if (!entry.processes.some((processInfo) => processInfo.pid === row.pid)) {
      entry.processes.push({
        pid: row.pid,
        name: await resolveWindowsProcessName(row.pid)
      });
    }

    grouped.set(row.port, entry);
  }

  return Array.from(grouped.values()).sort((left, right) => left.port - right.port);
}

export async function listPorts(platform = process.platform): Promise<PortListResult> {
  const ports =
    platform === "win32"
      ? await listWindowsPorts()
      : await listUnixPorts();

  return {
    ok: true,
    code: "PORTS_LISTED",
    ports,
    count: ports.length,
    message:
      ports.length > 0
        ? "Listed active listening ports."
        : "No active listening ports were found."
  };
}
