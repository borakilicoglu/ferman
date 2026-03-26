export type ActionResult = "none" | "inspected" | "killed";
import type { ErrorCode, SuccessCode } from "./utils/errors";
import type { NodeProcessListResult } from "./nodeProcesses";
import type { NodePortListResult } from "./nodePorts";
import type { PortListResult } from "./portList";
import type { ProcessKillResult } from "./processes";

export interface ProcessInfo {
  pid: number;
  name?: string;
}

export interface PortInspectionResult {
  port: number;
  busy: boolean;
  processes: ProcessInfo[];
}

export interface CommandResult extends PortInspectionResult {
  ok: true;
  code: SuccessCode;
  action: ActionResult;
  message: string;
  recommendation?: {
    action: "none" | "inspect" | "terminate";
    reason: string;
    risk: "low" | "medium";
  };
}

export interface BatchCommandResult {
  ok: true;
  code: "BATCH_COMPLETED";
  ports: CommandResult[];
  summary: {
    total: number;
    busy: number;
    free: number;
    released: number;
    inspected: number;
  };
  diagnosis?: {
    status: "healthy" | "attention";
    message: string;
    recommendations: string[];
  };
}

export interface ErrorResult {
  ok: false;
  code: ErrorCode;
  message: string;
}

export interface WatchEvent {
  event: "snapshot";
  iteration: number;
  timestamp: string;
  hint?: string;
  result: CommandResult | BatchCommandResult;
}

export interface InspectPortProvider {
  inspectPort(port: number): Promise<PortInspectionResult>;
  killProcesses(processes: ProcessInfo[], signal?: NodeJS.Signals): Promise<void>;
}

export interface CliOptions {
  ports: number[];
  common: boolean;
  doctor: boolean;
  list: boolean;
  jsonSchema: boolean;
  node: boolean;
  nodePorts: boolean;
  killAll: boolean;
  self: boolean;
  name?: string;
  filter?: string;
  signal?: NodeJS.Signals;
  force: boolean;
  dry: boolean;
  plan: boolean;
  watch: boolean;
  changedOnly: boolean;
  json: boolean;
  toon: boolean;
}

export type FermanResult =
  | CommandResult
  | BatchCommandResult
  | PortListResult
  | NodeProcessListResult
  | NodePortListResult
  | ProcessKillResult;
