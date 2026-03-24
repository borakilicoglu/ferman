import type { CommandResult } from "../types";

export function printHumanResult(result: CommandResult): void {
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

export function printJsonResult(result: CommandResult): void {
  console.log(JSON.stringify(result, null, 2));
}

export function printError(message: string, json: boolean): void {
  if (json) {
    console.error(JSON.stringify({ error: message }, null, 2));
    return;
  }

  console.error(message);
}
