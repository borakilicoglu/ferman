import type {
  CommandResult,
  ErrorResult,
  FermanResult,
  WatchEvent
} from "../types";
import type { NodeProcessListResult } from "../nodeProcesses";
import type { NodePortListResult } from "../nodePorts";

export function cleanupToonOutput(output: string): string {
  return output
    .replace(/^([A-Za-z0-9_]+)\[0\]:$/gm, "$1[]:")
    .replace(/^[A-Za-z0-9_]+:\s+null$/gm, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function isNodeProcessListResult(result: FermanResult): result is NodeProcessListResult {
  return "count" in result && result.code === "NODE_PROCESSES_LISTED";
}

function isNodePortListResult(result: FermanResult): result is NodePortListResult {
  return "count" in result && result.code === "NODE_PORTS_LISTED";
}

function printSingleHumanResult(result: CommandResult): void {
  console.log("Inspecting port...");

  if (!result.busy) {
    console.log("Port is already free.");
    return;
  }

  console.log("Found process using this port.");

  for (const process of result.processes) {
    const label = process.name ? `${process.name} (${process.pid})` : `PID ${process.pid}`;
    console.log(`- ${label}`);
  }

  if (result.action === "killed") {
    console.log("Port released.");
    return;
  }

  if (result.action === "inspected") {
    console.log(result.message);
  }
}

export function printHumanResult(result: FermanResult): void {
  if (isNodeProcessListResult(result)) {
    printNodeProcessesHuman(result);
    return;
  }

  if (isNodePortListResult(result)) {
    printNodePortsHuman(result);
    return;
  }

  if ("ports" in result) {
    for (const [index, item] of result.ports.entries()) {
      if (index > 0) {
        console.log("");
      }

      console.log(`Port ${item.port}`);
      printSingleHumanResult(item);
    }

    return;
  }

  printSingleHumanResult(result);
}

function printNodeProcessesHuman(result: NodeProcessListResult): void {
  console.log(result.message);

  for (const process of result.processes) {
    const suffix = process.command ? ` - ${process.command}` : "";
    console.log(`- ${process.name} (${process.pid})${suffix}`);
  }
}

function printNodePortsHuman(result: NodePortListResult): void {
  console.log(result.message);

  if (result.count > 0) {
    console.log(
      result.count === 1
        ? "1 active Node.js process is exposing a listening port."
        : `${String(result.count)} active Node.js processes are exposing listening ports.`
    );
  }

  for (const process of result.processes) {
    const suffix = process.command ? ` - ${process.command}` : "";
    console.log(`- ${process.name} (${process.pid}) ports: ${process.ports.join(", ")}${suffix}`);
  }
}

export function printJsonResult(result: FermanResult): void {
  console.log(JSON.stringify(result, null, 2));
}

export async function printToonResult(
  result: FermanResult | ErrorResult
): Promise<void> {
  const { encode } = await import("@toon-format/toon");
  console.log(cleanupToonOutput(encode(result)));
}

export function printWatchEventHuman(event: WatchEvent): void {
  console.log(`[${event.timestamp}] snapshot #${event.iteration}`);
  printHumanResult(event.result);
}

export function printWatchStartHuman(changedOnly: boolean): void {
  if (changedOnly) {
    console.log("Watch mode started. Waiting for changes...");
    return;
  }

  console.log("Watch mode started. Emitting snapshots every 2 seconds...");
}

export function printWatchEventJson(event: WatchEvent): void {
  console.log(JSON.stringify(event));
}

export async function printWatchEventToon(event: WatchEvent): Promise<void> {
  const { encode } = await import("@toon-format/toon");
  console.log(cleanupToonOutput(encode(event)));
}

export async function printError(
  result: ErrorResult,
  json: boolean,
  toon: boolean
): Promise<void> {
  if (json) {
    console.error(JSON.stringify(result, null, 2));
    return;
  }

  if (toon) {
    const { encode } = await import("@toon-format/toon");
    console.error(cleanupToonOutput(encode(result)));
    return;
  }

  console.error(result.message);
}
