import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { runFermanBatch } from "./index";
import { listNodePorts } from "./nodePorts";
import { listNodeProcesses } from "./nodeProcesses";
import type { BatchCommandResult, CliOptions, CommandResult, ErrorResult } from "./types";
import { COMMON_PORTS } from "./utils/commonPorts";
import { normalizeError } from "./utils/errors";
import { getJsonSchema } from "./utils/schema";

type BatchOrSingleResult = BatchCommandResult | CommandResult;

function toStructuredContent(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function createToolSuccess(result: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    structuredContent: toStructuredContent(result)
  };
}

function createToolError(error: unknown) {
  const normalized = normalizeError(error);
  const result: ErrorResult = {
    ok: false,
    code: normalized.code,
    message: normalized.message
  };

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    structuredContent: toStructuredContent(result),
    isError: true
  };
}

function normalizePorts(ports?: number[]): number[] {
  if (!ports || ports.length === 0) {
    throw new Error("At least one port is required.");
  }

  return ports.map((port) => {
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${String(port)}. Ports must be between 1 and 65535.`);
    }

    return port;
  });
}

async function runNonInteractiveBatch(
  overrides: Partial<CliOptions> & Pick<CliOptions, "ports">
): Promise<BatchOrSingleResult> {
  return runFermanBatch({
    ports: overrides.ports,
    common: overrides.common ?? false,
    doctor: overrides.doctor ?? false,
    list: false,
    jsonSchema: false,
    node: false,
    nodePorts: false,
    killAll: false,
    self: false,
    name: undefined,
    filter: undefined,
    signal: undefined,
    force: overrides.force ?? false,
    dry: overrides.dry ?? false,
    plan: overrides.plan ?? false,
    watch: false,
    changedOnly: false,
    json: true,
    toon: false
  });
}

function resolvePorts(ports?: number[], common?: boolean): number[] {
  if (common) {
    if (ports && ports.length > 0) {
      throw new Error("Use either explicit ports or common=true, not both.");
    }

    return COMMON_PORTS;
  }

  return normalizePorts(ports);
}

const server = new McpServer({
  name: "ferman-mcp",
  version: "0.1.5"
});

server.registerTool(
  "inspect_ports",
  {
    title: "Inspect Ports",
    description:
      "Inspect one or more ports without terminating processes. Can also scan the common development port preset.",
    inputSchema: {
      ports: z.array(z.number().int().min(1).max(65535)).optional(),
      common: z.boolean().optional(),
      plan: z.boolean().optional()
    }
  },
  async ({ ports, common, plan }) => {
    try {
      const result = await runNonInteractiveBatch({
        ports: resolvePorts(ports, common),
        dry: !plan,
        plan: plan ?? false
      });

      return createToolSuccess(result);
    } catch (error) {
      return createToolError(error);
    }
  }
);

server.registerTool(
  "release_ports",
  {
    title: "Release Ports",
    description:
      "Terminate processes using one or more ports. This tool is non-interactive and always uses force mode.",
    inputSchema: {
      ports: z.array(z.number().int().min(1).max(65535))
    }
  },
  async ({ ports }) => {
    try {
      const result = await runNonInteractiveBatch({
        ports: normalizePorts(ports),
        force: true
      });

      return createToolSuccess(result);
    } catch (error) {
      return createToolError(error);
    }
  }
);

server.registerTool(
  "doctor_ports",
  {
    title: "Doctor Ports",
    description:
      "Run a diagnosis over the common development port preset or a provided list of ports without terminating processes.",
    inputSchema: {
      ports: z.array(z.number().int().min(1).max(65535)).optional(),
      common: z.boolean().optional()
    }
  },
  async ({ ports, common }) => {
    try {
      const result = await runNonInteractiveBatch({
        ports: resolvePorts(ports, common ?? true),
        dry: true,
        doctor: true
      });

      return createToolSuccess(result);
    } catch (error) {
      return createToolError(error);
    }
  }
);

server.registerTool(
  "list_node_processes",
  {
    title: "List Node Processes",
    description: "List active Node.js processes. By default, the current ferman invocation is filtered out.",
    inputSchema: {
      self: z.boolean().optional()
    }
  },
  async ({ self }) => {
    try {
      const result = await listNodeProcesses({
        includeSelf: self ?? false
      });

      return createToolSuccess(result);
    } catch (error) {
      return createToolError(error);
    }
  }
);

server.registerTool(
  "list_node_ports",
  {
    title: "List Node Ports",
    description:
      "List active Node.js processes that currently have listening ports. By default, the current ferman invocation is filtered out.",
    inputSchema: {
      self: z.boolean().optional()
    }
  },
  async ({ self }) => {
    try {
      const result = await listNodePorts({
        includeSelf: self ?? false
      });

      return createToolSuccess(result);
    } catch (error) {
      return createToolError(error);
    }
  }
);

server.registerTool(
  "get_output_schema",
  {
    title: "Get Output Schema",
    description: "Return the JSON Schema for ferman's structured CLI output."
  },
  () => createToolSuccess(getJsonSchema())
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

void main();
