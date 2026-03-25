export type SuccessCode =
  | "PORTS_LISTED"
  | "PORT_FREE"
  | "PORT_INSPECTED"
  | "OPERATION_CANCELLED"
  | "PORT_RELEASED"
  | "BATCH_COMPLETED"
  | "NODE_PROCESSES_LISTED"
  | "NODE_PORTS_LISTED";

export type ErrorCode =
  | "INVALID_ARGUMENTS"
  | "INVALID_PORT"
  | "OUTPUT_MODE_CONFLICT"
  | "UNSUPPORTED_PLATFORM"
  | "COMMAND_UNAVAILABLE"
  | "PERMISSION_DENIED"
  | "PROCESS_NOT_FOUND"
  | "KILL_FAILED"
  | "INSPECTION_FAILED"
  | "UNKNOWN_ERROR";

export class FermanError extends Error {
  code: ErrorCode;
  exitCode: 1 | 2;

  constructor(message: string, code: ErrorCode, exitCode: 1 | 2 = 1) {
    super(message);
    this.name = "FermanError";
    this.code = code;
    this.exitCode = exitCode;
  }
}

export function normalizeError(error: unknown): FermanError {
  if (error instanceof FermanError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);

  if (/permission denied|eacces|eperm/i.test(message)) {
    return new FermanError(message, "PERMISSION_DENIED", 1);
  }

  if (/process not found|esrch/i.test(message)) {
    return new FermanError(message, "PROCESS_NOT_FOUND", 1);
  }

  if (/required system command is unavailable/i.test(message)) {
    return new FermanError(message, "COMMAND_UNAVAILABLE", 1);
  }

  if (/unsupported platform/i.test(message)) {
    return new FermanError(message, "UNSUPPORTED_PLATFORM", 2);
  }

  if (/failed to kill pid/i.test(message)) {
    return new FermanError(message, "KILL_FAILED", 1);
  }

  if (/failed to inspect port/i.test(message)) {
    return new FermanError(message, "INSPECTION_FAILED", 1);
  }

  return new FermanError(message, "UNKNOWN_ERROR", 1);
}
