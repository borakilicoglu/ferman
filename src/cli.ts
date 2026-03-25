import { runFermanBatch } from "./index";
import type { CliOptions, WatchEvent } from "./types";
import { listNodeProcesses } from "./nodeProcesses";
import { listNodePorts } from "./nodePorts";
import { COMMON_PORTS } from "./utils/commonPorts";
import { getJsonSchema } from "./utils/schema";
import { FermanError, normalizeError } from "./utils/errors";
import {
  printError,
  printHumanResult,
  printJsonResult,
  printToonResult,
  printWatchEventHuman,
  printWatchEventJson,
  printWatchEventToon
} from "./utils/output";
import { parsePort } from "./utils/validatePort";

function printHelp(): void {
  console.log(`ferman

Inspect and free busy ports instantly.

Usage:
  ferman <port...> [--common] [--doctor] [--force] [--dry] [--plan] [--watch] [--changed-only] [--json | --toon]
  ferman --node [--self] [--json | --toon]
  ferman --node-ports [--self] [--json | --toon]
  ferman --json-schema

Options:
  --common  Inspect common local development ports
  --doctor  Diagnose common local development ports and summarize their state
  --node    List active Node.js processes
  --node-ports  List active Node.js processes with listening ports
  --self    Include the current ferman invocation in node-oriented listings
  --force   Kill without confirmation
  --dry     Inspect only, do not kill
  --plan    Return a recommended next action without terminating processes
  --watch   Re-check ports continuously without terminating processes
  --changed-only  In watch mode, emit output only when the result changes
  --json    Print machine-readable JSON
  --json-schema  Print the JSON Schema for machine-readable output
  --toon    Print machine-readable TOON
  --help    Show help
`);
}

function parseArgs(argv: string[]): CliOptions {
  const common = argv.includes("--common");
  const doctor = argv.includes("--doctor");
  const jsonSchema = argv.includes("--json-schema");
  const node = argv.includes("--node");
  const nodePorts = argv.includes("--node-ports");
  const self = argv.includes("--self");
  const force = argv.includes("--force");
  const dry = argv.includes("--dry");
  const plan = argv.includes("--plan");
  const watch = argv.includes("--watch");
  const changedOnly = argv.includes("--changed-only");
  const json = argv.includes("--json");
  const toon = argv.includes("--toon");
  const help = argv.includes("--help") || argv.includes("-h");

  if (help) {
    printHelp();
    process.exit(0);
  }

  const positional = argv.filter((arg) => !arg.startsWith("-"));

  if ((common || doctor || node || nodePorts) && positional.length > 0) {
    throw new FermanError(
      "Use either explicit ports or --common/--doctor/--node/--node-ports, not both.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if (jsonSchema && (common || doctor || node || nodePorts || positional.length > 0)) {
    throw new FermanError(
      "Use --json-schema on its own without ports or scan modes.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if (node && nodePorts) {
    throw new FermanError(
      "Choose either --node or --node-ports, not both.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if ((node || nodePorts) && (force || dry || plan || watch || changedOnly)) {
    throw new FermanError(
      "Use --node and --node-ports without --force, --dry, --plan, --watch, or --changed-only.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if (self && !node && !nodePorts) {
    throw new FermanError(
      "Use --self together with --node or --node-ports.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if (!jsonSchema && !common && !doctor && !node && !nodePorts && positional.length === 0) {
    throw new FermanError("Port is required.", "INVALID_PORT", 2);
  }

  if (changedOnly && !watch) {
    throw new FermanError(
      "Use --changed-only together with --watch.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if (json && toon) {
    throw new FermanError(
      "Choose either --json or --toon, not both.",
      "OUTPUT_MODE_CONFLICT",
      2
    );
  }

  if (watch && force) {
    throw new FermanError(
      "Use --watch without --force. Watch mode does not terminate processes.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  return {
    ports: jsonSchema ? [] : common || doctor ? COMMON_PORTS : positional.map((value) => parsePort(value)),
    common,
    doctor,
    jsonSchema,
    node,
    nodePorts,
    self,
    force,
    dry,
    plan,
    watch,
    changedOnly,
    json,
    toon
  };
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWatchMode(options: CliOptions): Promise<never> {
  let emissionIteration = 0;
  let previousSnapshot: string | undefined;
  const watchOptions: CliOptions = {
    ...options,
    force: false,
    dry: true
  };

  while (true) {
    const result = await runFermanBatch(watchOptions);
    const snapshot = JSON.stringify(result);

    if (options.changedOnly && previousSnapshot === snapshot) {
      await sleep(2000);
      continue;
    }

    previousSnapshot = snapshot;
    emissionIteration += 1;
    const event: WatchEvent = {
      event: "snapshot",
      iteration: emissionIteration,
      timestamp: new Date().toISOString(),
      result
    };

    if (options.json) {
      printWatchEventJson(event);
    } else if (options.toon) {
      await printWatchEventToon(event);
    } else {
      printWatchEventHuman(event);
    }

    await sleep(2000);
  }
}

async function main(): Promise<void> {
  let options: CliOptions;

  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    const normalized = normalizeError(error);
    await printError(
      {
        ok: false,
        code: normalized.code,
        message: normalized.message
      },
      process.argv.includes("--json"),
      process.argv.includes("--toon")
    );
    process.exit(normalized.exitCode);
    return;
  }

  if (options.jsonSchema) {
    console.log(JSON.stringify(getJsonSchema(), null, 2));
    process.exit(0);
    return;
  }

  try {
    if (options.node) {
      const result = await listNodeProcesses({ includeSelf: options.self });

      if (options.json) {
        printJsonResult(result);
      } else if (options.toon) {
        await printToonResult(result);
      } else {
        printHumanResult(result);
      }

      process.exit(0);
      return;
    }

    if (options.nodePorts) {
      const result = await listNodePorts({ includeSelf: options.self });

      if (options.json) {
        printJsonResult(result);
      } else if (options.toon) {
        await printToonResult(result);
      } else {
        printHumanResult(result);
      }

      process.exit(0);
      return;
    }

    if (options.watch) {
      await runWatchMode(options);
    }

    const result = await runFermanBatch(options);

    if (options.json) {
      printJsonResult(result);
    } else if (options.toon) {
      await printToonResult(result);
    } else {
      printHumanResult(result);
    }

    process.exit(0);
  } catch (error) {
    const normalized = normalizeError(error);
    await printError(
      {
        ok: false,
        code: normalized.code,
        message: normalized.message
      },
      options.json,
      options.toon
    );
    process.exit(normalized.exitCode);
  }
}

void main();
