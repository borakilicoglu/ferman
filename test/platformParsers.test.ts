import { describe, expect, it } from "vitest";
import { parseLsofPidOutput } from "../src/platform/darwin";
import { findListeningPids, parseNetstatLine } from "../src/platform/windows";

describe("parseLsofPidOutput", () => {
  it("returns unique numeric pids from lsof output", () => {
    expect(parseLsofPidOutput("1234\n5678\n1234\n")).toEqual([1234, 5678]);
  });

  it("ignores blank and invalid lines", () => {
    expect(parseLsofPidOutput("\nabc\n0\n42\n")).toEqual([42]);
  });
});

describe("parseNetstatLine", () => {
  it("extracts the pid from a valid netstat line", () => {
    expect(
      parseNetstatLine("  TCP    0.0.0.0:3000     0.0.0.0:0     LISTENING     1234")
    ).toBe(1234);
  });

  it("returns undefined for malformed lines", () => {
    expect(parseNetstatLine("not a netstat line")).toBeUndefined();
  });
});

describe("findListeningPids", () => {
  it("filters to listening processes on the requested port", () => {
    const output = [
      "  TCP    0.0.0.0:3000     0.0.0.0:0     LISTENING     1234",
      "  TCP    127.0.0.1:3000   0.0.0.0:0     LISTENING     5678",
      "  TCP    0.0.0.0:4000     0.0.0.0:0     LISTENING     9999",
      "  TCP    127.0.0.1:3000   127.0.0.1:52222 ESTABLISHED 5678"
    ].join("\n");

    expect(findListeningPids(output, 3000)).toEqual([1234, 5678]);
  });
});
