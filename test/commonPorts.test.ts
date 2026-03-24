import { describe, expect, it } from "vitest";
import { COMMON_PORTS } from "../src/utils/commonPorts";

describe("COMMON_PORTS", () => {
  it("contains a stable list of common local development ports", () => {
    expect(COMMON_PORTS).toEqual([3000, 3001, 5173, 5432, 6379, 8000, 8080]);
  });
});
