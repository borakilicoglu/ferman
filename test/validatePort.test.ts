import { describe, expect, it } from "vitest";
import { parsePort } from "../src/utils/validatePort";

describe("parsePort", () => {
  it("accepts a valid port", () => {
    expect(parsePort("3000")).toBe(3000);
  });

  it("rejects a missing port", () => {
    expect(() => parsePort(undefined)).toThrow("Port is required.");
  });

  it("rejects a non-numeric port", () => {
    expect(() => parsePort("abc")).toThrow("Port must be a whole number.");
  });

  it("rejects a port outside the valid range", () => {
    expect(() => parsePort("0")).toThrow("Port must be between 1 and 65535.");
    expect(() => parsePort("65536")).toThrow("Port must be between 1 and 65535.");
  });
});
