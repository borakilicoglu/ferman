import { getPortProvider } from "./platform";
import { confirmKill } from "./utils/confirm";
import { CommandResult, CliOptions } from "./types";

export async function runFerman(options: CliOptions): Promise<CommandResult> {
  const provider = getPortProvider();
  const inspection = await provider.inspectPort(options.port);

  if (!inspection.busy) {
    return {
      ...inspection,
      action: "none",
      message: "Port zaten bos."
    };
  }

  if (options.dry) {
    return {
      ...inspection,
      action: "inspected",
      message: "Dry mod aktif. Hicbir surec sonlandirilmadi."
    };
  }

  const shouldKill = options.force || (await confirmKill(options.port));

  if (!shouldKill) {
    return {
      ...inspection,
      action: "inspected",
      message: "Islem iptal edildi."
    };
  }

  await provider.killProcesses(inspection.processes);

  return {
    ...inspection,
    action: "killed",
    message: "Ferman verildi."
  };
}
