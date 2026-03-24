import { FermanError } from "./errors";

export function parsePort(input: string | undefined): number {
  if (!input) {
    throw new FermanError("Port is required.", "INVALID_PORT", 2);
  }

  if (!/^\d+$/.test(input)) {
    throw new FermanError("Port must be a whole number.", "INVALID_PORT", 2);
  }

  const port = Number(input);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new FermanError("Port must be between 1 and 65535.", "INVALID_PORT", 2);
  }

  return port;
}
