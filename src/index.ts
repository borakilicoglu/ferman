import { getPortProvider } from "./platform";
import type { BatchCommandResult, CommandResult, CliOptions } from "./types";
import type { SuccessCode } from "./utils/errors";
import { confirmKill } from "./utils/confirm";

const DEV_SERVER_PORTS = new Set([3000, 3001, 5173, 8000, 8080]);
const SERVICE_PORTS = new Set([5432, 6379]);
const DEV_PROCESS_NAMES = new Set([
  "node",
  "vite",
  "tsx",
  "ts-node",
  "next",
  "bun",
  "python",
  "python3",
  "ruby",
  "java"
]);

function looksLikeDevProcess(name?: string): boolean {
  return DEV_PROCESS_NAMES.has(name?.toLowerCase() ?? "");
}

function classifyPort(port: number): "app" | "service" | "other" {
  if (DEV_SERVER_PORTS.has(port)) {
    return "app";
  }

  if (SERVICE_PORTS.has(port)) {
    return "service";
  }

  return "other";
}

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

function createRecommendation(inspection: Pick<CommandResult, "port" | "busy" | "processes">) {
  if (!inspection.busy) {
    return {
      action: "none" as const,
      reason: "The port is already free, so no action is required.",
      risk: "low" as const
    };
  }

  const devProcesses = inspection.processes.filter((process) => looksLikeDevProcess(process.name));
  const portClass = classifyPort(inspection.port);

  if (inspection.processes.length === 1 && devProcesses.length === 1) {
    return {
      action: "terminate" as const,
      reason:
        portClass === "service"
          ? "A single process is holding a common local service port, so confirm it is not an expected database or cache before terminating it."
          : "A single app-style development process is holding the port, so a targeted stop is a reasonable next step.",
      risk: "low" as const
    };
  }

  if (inspection.processes.length === 1) {
    return {
      action: "terminate" as const,
      reason:
        portClass === "service"
          ? "A single process is using a common local service port, so verify it is not expected infrastructure before terminating it."
          : "A single process is using the port, so targeted termination is a reasonable next step.",
      risk: "low" as const
    };
  }

  return {
    action: "inspect" as const,
    reason:
      devProcesses.length > 0
        ? "Multiple processes are associated with this port, including development-style processes, so inspect before terminating anything."
        : "Multiple processes are associated with this port, so inspect before terminating anything.",
    risk: "medium" as const
  };
}

function createDiagnosis(result: BatchCommandResult): BatchCommandResult["diagnosis"] {
  if (result.summary.busy === 0) {
    return {
      status: "healthy",
      message: "All checked ports are free.",
      recommendations: [
        "No action required.",
        "Run the same doctor check again after starting local services if you want to verify port usage."
      ]
    };
  }

  const busyResults = result.ports.filter((port) => port.busy);
  const busyPorts = busyResults.map((port) => port.port);
  const appPorts = busyResults.filter((port) => classifyPort(port.port) === "app").map((port) => port.port);
  const servicePorts = busyResults
    .filter((port) => classifyPort(port.port) === "service")
    .map((port) => port.port);
  const multiProcessPorts = busyResults
    .filter((port) => port.processes.length > 1)
    .map((port) => port.port);
  const devProcessPorts = busyResults
    .filter((port) => port.processes.some((process) => looksLikeDevProcess(process.name)))
    .map((port) => port.port);
  const recommendations = [
    "Run `ferman --plan --json` on a specific busy port for a safer next-step recommendation.",
    "Use `ferman <port> --dry` to inspect a busy port without terminating anything."
  ];

  if (appPorts.length > 0 && devProcessPorts.length > 0) {
    recommendations.push(
      `Busy app-style ports (${appPorts.join(
        ", "
      )}) look like a leftover local dev loop. Check watcher or restart scripts before forcing a kill.`
    );
  }

  if (servicePorts.length > 0) {
    recommendations.push(
      `Service-style ports (${servicePorts.join(
        ", "
      )}) are busy. Confirm whether a local database, cache, or forwarded container port is expected before terminating it.`
    );
  }

  if (multiProcessPorts.length > 0) {
    recommendations.push(
      `Ports with multiple attached processes (${multiProcessPorts.join(
        ", "
      )}) need extra inspection because a parent watcher or proxy may respawn them.`
    );
  }

  let message = `Some checked ports are busy: ${busyPorts.join(", ")}.`;

  if (appPorts.length > 0 && servicePorts.length > 0) {
    message = `Some checked ports are busy across app and service workflows: ${busyPorts.join(", ")}.`;
  } else if (appPorts.length > 0 && appPorts.length === busyPorts.length) {
    message = `Some checked ports are busy in an app-style development loop: ${busyPorts.join(", ")}.`;
  } else if (servicePorts.length > 0 && servicePorts.length === busyPorts.length) {
    message = `Some checked ports are busy in service-style local infrastructure: ${busyPorts.join(", ")}.`;
  }

  return {
    status: "attention",
    message,
    recommendations
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

  await provider.killProcesses(inspection.processes, options.signal);
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
