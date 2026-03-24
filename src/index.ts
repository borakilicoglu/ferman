import { getPortProvider } from "./platform";
import type { BatchCommandResult, CommandResult, CliOptions } from "./types";
import type { SuccessCode } from "./utils/errors";
import { confirmKill } from "./utils/confirm";

function createResult(
  code: SuccessCode,
  message: string,
  action: CommandResult["action"],
  inspection: Pick<CommandResult, "port" | "busy" | "processes">,
  recommendation?: CommandResult["recommendation"]
): CommandResult {
  return {
    ...inspection,
    ok: true,
    code,
    action,
    message,
    recommendation
  };
}

function createRecommendation(inspection: Pick<CommandResult, "busy" | "processes">) {
  if (!inspection.busy) {
    return {
      action: "none" as const,
      reason: "The port is already free, so no action is required.",
      risk: "low" as const
    };
  }

  if (inspection.processes.length === 1) {
    return {
      action: "terminate" as const,
      reason: "A single process is using the port, so targeted termination is a reasonable next step.",
      risk: "low" as const
    };
  }

  return {
    action: "inspect" as const,
    reason: "Multiple processes are associated with this port, so inspect before terminating anything.",
    risk: "medium" as const
  };
}

function createDiagnosis(result: BatchCommandResult): BatchCommandResult["diagnosis"] {
  if (result.summary.busy === 0) {
    return {
      status: "healthy",
      message: "All checked ports are free.",
      recommendations: ["No action required."]
    };
  }

  const busyPorts = result.ports.filter((port) => port.busy).map((port) => port.port);

  return {
    status: "attention",
    message: `Some checked ports are busy: ${busyPorts.join(", ")}.`,
    recommendations: [
      "Review the busy ports before terminating processes.",
      "Use --plan for recommendations or --dry for inspection-only output."
    ]
  };
}

async function runSinglePortFerman(
  options: Omit<CliOptions, "ports"> & { port: number }
): Promise<CommandResult> {
  const provider = getPortProvider();
  const inspection = await provider.inspectPort(options.port);

  if (!inspection.busy) {
    return createResult(
      "PORT_FREE",
      "Port is already free.",
      "none",
      inspection,
      options.plan ? createRecommendation(inspection) : undefined
    );
  }

  if (options.plan) {
    return createResult(
      "PORT_INSPECTED",
      "Plan mode active. No processes were terminated.",
      "inspected",
      inspection,
      createRecommendation(inspection)
    );
  }

  if (options.dry) {
    return createResult(
      "PORT_INSPECTED",
      "Dry mode active. No processes were terminated.",
      "inspected",
      inspection,
      options.plan ? createRecommendation(inspection) : undefined
    );
  }

  const shouldKill = options.force || (await confirmKill(options.port));

  if (!shouldKill) {
    return createResult(
      "OPERATION_CANCELLED",
      "Operation cancelled.",
      "inspected",
      inspection,
      options.plan ? createRecommendation(inspection) : undefined
    );
  }

  await provider.killProcesses(inspection.processes);

  return createResult(
    "PORT_RELEASED",
    "Port released.",
    "killed",
    inspection,
    options.plan ? createRecommendation(inspection) : undefined
  );
}

export async function runFermanBatch(options: CliOptions): Promise<CommandResult | BatchCommandResult> {
  if (options.ports.length === 1) {
    return runSinglePortFerman({
      ...options,
      port: options.ports[0]
    });
  }

  const ports = await Promise.all(
    options.ports.map((port) =>
      runSinglePortFerman({
        ...options,
        port
      })
    )
  );

  const result: BatchCommandResult = {
    ok: true,
    code: "BATCH_COMPLETED",
    ports,
    summary: {
      total: ports.length,
      busy: ports.filter((result) => result.busy).length,
      free: ports.filter((result) => !result.busy).length,
      released: ports.filter((result) => result.action === "killed").length,
      inspected: ports.filter((result) => result.action === "inspected").length
    }
  };

  if (options.doctor) {
    result.diagnosis = createDiagnosis(result);
  }

  return result;
}
