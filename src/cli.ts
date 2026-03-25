import { runFermanBatch } from "./index";
import type { CliOptions, WatchEvent } from "./types";
import { listNodeProcesses } from "./nodeProcesses";
import { listNodePorts } from "./nodePorts";
import { listPorts } from "./portList";
import { killProcessesByPattern } from "./processes";
import { COMMON_PORTS } from "./utils/commonPorts";
import { getJsonSchema } from "./utils/schema";
import { FermanError, normalizeError } from "./utils/errors";
import {
  printError,
  printHumanResult,
  printJsonResult,
  printToonResult,
  printWatchStartHuman,
  printWatchEventHuman,
  printWatchEventJson,
  printWatchEventToon
} from "./utils/output";
import { parsePort } from "./utils/validatePort";

function printHelp(): void {
  console.log(`ferman

Inspect and free busy ports instantly.

Usage:
  ferman <port...> [--common] [--doctor] [--force] [--dry] [--plan] [--watch] [--changed-only] [--signal <signal>] [--json | --toon]
  ferman --list [--json | --toon]
  ferman --node [--self] [--filter <pattern>] [--json | --toon]
  ferman --node-ports [--self] [--filter <pattern>] [--json | --toon]
  ferman --kill-all --name <pattern> [--signal <signal>] [--json | --toon]
  ferman --json-schema

Options:
  --common  Inspect common local development ports
  --doctor  Diagnose common local development ports and summarize their state
  --list    List active listening ports
  --node    List active Node.js processes
  --node-ports  List active Node.js processes with listening ports
  --kill-all  Kill matching processes by name or command pattern
  --name    Pattern used by --kill-all
  --filter    Filter node-oriented listings by name or command
  --self    Include the current ferman invocation in node-oriented listings
  --signal    Signal to use for process termination on Unix-like systems
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
  const list = argv.includes("--list");
  const jsonSchema = argv.includes("--json-schema");
  const node = argv.includes("--node");
  const nodePorts = argv.includes("--node-ports");
  const killAll = argv.includes("--kill-all");
  const self = argv.includes("--self");
  const force = argv.includes("--force");
  const dry = argv.includes("--dry");
  const plan = argv.includes("--plan");
  const watch = argv.includes("--watch");
  const changedOnly = argv.includes("--changed-only");
  const json = argv.includes("--json");
  const toon = argv.includes("--toon");
  const help = argv.includes("--help") || argv.includes("-h");
  const nameIndex = argv.indexOf("--name");
  const filterIndex = argv.indexOf("--filter");
  const signalIndex = argv.indexOf("--signal");
  const name = nameIndex >= 0 ? argv[nameIndex + 1] : undefined;
  const filter = filterIndex >= 0 ? argv[filterIndex + 1] : undefined;
  const signal = signalIndex >= 0 ? argv[signalIndex + 1] : undefined;

  if (help) {
    printHelp();
    process.exit(0);
  }

  const valueFlags = new Set(["--name", "--filter", "--signal"]);
  const positional = argv.filter((arg, index) => {
    if (arg.startsWith("-")) {
      return false;
    }

    const previous = argv[index - 1];
    return !valueFlags.has(previous ?? "");
  });

  if ((common || doctor || list || node || nodePorts || killAll) && positional.length > 0) {
    throw new FermanError(
      "Use either explicit ports or --common/--doctor/--list/--node/--node-ports/--kill-all, not both.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if (jsonSchema && (common || doctor || list || node || nodePorts || killAll || positional.length > 0)) {
    throw new FermanError(
      "Use --json-schema on its own without ports or scan modes.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if ((node ? 1 : 0) + (nodePorts ? 1 : 0) + (killAll ? 1 : 0) > 1) {
    throw new FermanError(
      "Choose only one of --node, --node-ports, or --kill-all at a time.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if ((list || node || nodePorts) && (force || dry || plan || watch || changedOnly || name !== undefined)) {
    throw new FermanError(
      "Use --list, --node, and --node-ports without --force, --dry, --plan, --watch, --changed-only, or --name.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if (killAll && (force || dry || plan || watch || changedOnly || list || common || doctor)) {
    throw new FermanError(
      "Use --kill-all with --name and optional --signal only.",
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

  if (filter !== undefined && !node && !nodePorts) {
    throw new FermanError(
      "Use --filter together with --node or --node-ports.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if (name !== undefined && !killAll) {
    throw new FermanError(
      "Use --name together with --kill-all.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if (killAll && !name) {
    throw new FermanError(
      "Use --kill-all together with --name <pattern>.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if (signal !== undefined && !/^SIG[A-Z0-9]+$/i.test(signal.trim())) {
    throw new FermanError(
      "Use --signal with a signal name such as SIGTERM or SIGKILL.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if (signal !== undefined && !killAll && !positional.length) {
    throw new FermanError(
      "Use --signal with explicit ports or with --kill-all.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if (signal !== undefined && (common || doctor || list || node || nodePorts || jsonSchema)) {
    throw new FermanError(
      "Use --signal with explicit ports or with --kill-all.",
      "INVALID_ARGUMENTS",
      2
    );
  }

  if (!jsonSchema && !common && !doctor && !list && !node && !nodePorts && !killAll && positional.length === 0) {
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
    list,
    jsonSchema,
    node,
    nodePorts,
    killAll,
    self,
    name,
    filter,
    signal: signal?.trim().toUpperCase() as NodeJS.Signals | undefined,
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

  if (!options.json && !options.toon) {
    printWatchStartHuman(options.changedOnly);
  }

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
      const result = await listNodeProcesses({ includeSelf: options.self, filter: options.filter });

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

    if (options.list) {
      const result = await listPorts();

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
      const result = await listNodePorts({ includeSelf: options.self, filter: options.filter });

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

    if (options.killAll && options.name) {
      const result = await killProcessesByPattern(options.name, options.signal);

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
