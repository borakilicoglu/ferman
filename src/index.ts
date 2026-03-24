import { getPortProvider } from "./platform";
import type { CommandResult, CliOptions } from "./types";
import { confirmKill } from "./utils/confirm";

export async function runFerman(options: CliOptions): Promise<CommandResult> {
  const provider = getPortProvider();
  const inspection = await provider.inspectPort(options.port);

  if (!inspection.busy) {
    return {
      ...inspection,
      action: "none",
      message: "Port is already free."
    };
  }

  if (options.dry) {
    return {
      ...inspection,
      action: "inspected",
      message: "Dry mode active. No processes were terminated."
    };
  }

  const shouldKill = options.force || (await confirmKill(options.port));

  if (!shouldKill) {
    return {
      ...inspection,
      action: "inspected",
      message: "Operation cancelled."
    };
  }

  await provider.killProcesses(inspection.processes);

  return {
    ...inspection,
    action: "killed",
    message: "Port released."
  };
}
