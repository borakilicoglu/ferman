import type { BatchCommandResult, CommandResult, ErrorResult, WatchEvent } from "../types";

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

export function printHumanResult(result: CommandResult | BatchCommandResult): void {
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

export function printJsonResult(result: CommandResult | BatchCommandResult): void {
  console.log(JSON.stringify(result, null, 2));
}

export async function printToonResult(
  result: CommandResult | BatchCommandResult | ErrorResult
): Promise<void> {
  const { encode } = await import("@toon-format/toon");
  console.log(encode(result));
}

export function printWatchEventHuman(event: WatchEvent): void {
  console.log(`[${event.timestamp}] snapshot #${event.iteration}`);
  printHumanResult(event.result);
}

export function printWatchEventJson(event: WatchEvent): void {
  console.log(JSON.stringify(event));
}

export async function printWatchEventToon(event: WatchEvent): Promise<void> {
  const { encode } = await import("@toon-format/toon");
  console.log(encode(event));
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
    console.error(encode(result));
    return;
  }

  console.error(result.message);
}
