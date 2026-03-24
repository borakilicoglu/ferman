export function parsePort(input: string | undefined): number {
  if (!input) {
    throw new Error("Port is required.");
  }

  if (!/^\d+$/.test(input)) {
    throw new Error("Port must be a whole number.");
  }

  const port = Number(input);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Port must be between 1 and 65535.");
  }

  return port;
}
