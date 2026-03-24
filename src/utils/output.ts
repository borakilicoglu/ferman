import { CommandResult } from "../types";

export function printHumanResult(result: CommandResult): void {
  console.log("Ferman bakiyor...");

  if (!result.busy) {
    console.log("Port zaten bos.");
    return;
  }

  console.log("Bu portu kullanan surec bulundu.");

  for (const process of result.processes) {
    const label = process.name ? `${process.name} (${process.pid})` : `PID ${process.pid}`;
    console.log(`- ${label}`);
  }

  if (result.action === "killed") {
    console.log("Ferman verildi.");
    return;
  }

  if (result.action === "inspected") {
    console.log("Dry mod aktif. Hicbir surec sonlandirilmadi.");
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
