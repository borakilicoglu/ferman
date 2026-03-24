import { describe, expect, it } from "vitest";
import { getJsonSchema } from "../src/utils/schema";

describe("getJsonSchema", () => {
  it("returns the documented output schema", () => {
    const schema = getJsonSchema();

    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(schema.title).toBe("ferman CLI output");
    expect(schema.oneOf).toHaveLength(3);
    expect(schema.$defs.commandResult.properties.code.enum).toContain("PORT_RELEASED");
    expect(schema.$defs.errorResult.properties.code.enum).toContain("INVALID_PORT");
  });
});
