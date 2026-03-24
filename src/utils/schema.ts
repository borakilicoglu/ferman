export function getJsonSchema() {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://borakilicoglu.github.io/ferman/schema.json",
    title: "ferman CLI output",
    oneOf: [
      { $ref: "#/$defs/commandResult" },
      { $ref: "#/$defs/batchCommandResult" },
      { $ref: "#/$defs/errorResult" }
    ],
    $defs: {
      processInfo: {
        type: "object",
        additionalProperties: false,
        required: ["pid"],
        properties: {
          pid: { type: "integer", minimum: 1 },
          name: { type: "string" }
        }
      },
      recommendation: {
        type: "object",
        additionalProperties: false,
        required: ["action", "reason", "risk"],
        properties: {
          action: {
            type: "string",
            enum: ["none", "inspect", "terminate"]
          },
          reason: { type: "string" },
          risk: {
            type: "string",
            enum: ["low", "medium"]
          }
        }
      },
      commandResult: {
        type: "object",
        additionalProperties: false,
        required: ["ok", "code", "port", "busy", "processes", "action", "message"],
        properties: {
          ok: { const: true },
          code: {
            type: "string",
            enum: ["PORT_FREE", "PORT_INSPECTED", "OPERATION_CANCELLED", "PORT_RELEASED"]
          },
          port: { type: "integer", minimum: 1, maximum: 65535 },
          busy: { type: "boolean" },
          processes: {
            type: "array",
            items: { $ref: "#/$defs/processInfo" }
          },
          action: {
            type: "string",
            enum: ["none", "inspected", "killed"]
          },
          message: { type: "string" },
          recommendation: { $ref: "#/$defs/recommendation" }
        }
      },
      batchCommandResult: {
        type: "object",
        additionalProperties: false,
        required: ["ok", "code", "ports", "summary"],
        properties: {
          ok: { const: true },
          code: { const: "BATCH_COMPLETED" },
          ports: {
            type: "array",
            items: { $ref: "#/$defs/commandResult" }
          },
          summary: {
            type: "object",
            additionalProperties: false,
            required: ["total", "busy", "free", "released", "inspected"],
            properties: {
              total: { type: "integer", minimum: 0 },
              busy: { type: "integer", minimum: 0 },
              free: { type: "integer", minimum: 0 },
              released: { type: "integer", minimum: 0 },
              inspected: { type: "integer", minimum: 0 }
            }
          },
          diagnosis: {
            type: "object",
            additionalProperties: false,
            required: ["status", "message", "recommendations"],
            properties: {
              status: {
                type: "string",
                enum: ["healthy", "attention"]
              },
              message: { type: "string" },
              recommendations: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        }
      },
      errorResult: {
        type: "object",
        additionalProperties: false,
        required: ["ok", "code", "message"],
        properties: {
          ok: { const: false },
          code: {
            type: "string",
            enum: [
              "INVALID_ARGUMENTS",
              "INVALID_PORT",
              "OUTPUT_MODE_CONFLICT",
              "UNSUPPORTED_PLATFORM",
              "COMMAND_UNAVAILABLE",
              "PERMISSION_DENIED",
              "PROCESS_NOT_FOUND",
              "KILL_FAILED",
              "INSPECTION_FAILED",
              "UNKNOWN_ERROR"
            ]
          },
          message: { type: "string" }
        }
      }
    }
  };
}
