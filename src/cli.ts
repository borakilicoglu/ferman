import { runFerman } from "./index";
import type { CliOptions } from "./types";
import { printError, printHumanResult, printJsonResult } from "./utils/output";
import { parsePort } from "./utils/validatePort";

function printHelp(): void {
  console.log(`ferman

Inspect and free busy ports instantly.

Usage:
  ferman <port> [--force] [--dry] [--json]

Options:
  --force   Kill without confirmation
  --dry     Inspect only, do not kill
  --json    Print machine-readable JSON
  --help    Show help
`);
}

function parseArgs(argv: string[]): CliOptions {
  const force = argv.includes("--force");
  const dry = argv.includes("--dry");
  const json = argv.includes("--json");
  const help = argv.includes("--help") || argv.includes("-h");

  if (help) {
    printHelp();
    process.exit(0);
  }

  const positional = argv.filter((arg) => !arg.startsWith("-"));

  if (positional.length !== 1) {
    throw new Error("Exactly one port argument is required.");
  }

  return {
    port: parsePort(positional[0]),
    force,
    dry,
    json
  };
}

async function main(): Promise<void> {
  let options: CliOptions;

  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    printError(message, process.argv.includes("--json"));
    process.exit(2);
    return;
  }

  try {
    const result = await runFerman(options);

    if (options.json) {
      printJsonResult(result);
    } else {
      printHumanResult(result);
    }

    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    printError(message, options.json);
    process.exit(1);
  }
}

void main();
