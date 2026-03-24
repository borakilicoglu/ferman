export type ActionResult = "none" | "inspected" | "killed";

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
  action: ActionResult;
  message: string;
}

export interface InspectPortProvider {
  inspectPort(port: number): Promise<PortInspectionResult>;
  killProcesses(processes: ProcessInfo[]): Promise<void>;
}

export interface CliOptions {
  port: number;
  force: boolean;
  dry: boolean;
  json: boolean;
  toon: boolean;
}
