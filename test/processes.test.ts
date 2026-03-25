import { describe, expect, it } from "vitest";

import {
  parseUnixProcessTable,
  parseWindowsProcessTable
} from "../src/processes";

describe("generic process parsers", () => {
  it("parses Unix process table output", () => {
    const output = `
1234 node node server.js
5678 vite vite --host
`;

    expect(parseUnixProcessTable(output)).toEqual([
      {
        pid: 1234,
        name: "node",
        command: "node server.js"
      },
      {
        pid: 5678,
        name: "vite",
        command: "vite --host"
      }
    ]);
  });

  it("parses Windows tasklist CSV output", () => {
    const output = `"node.exe","4242","Console","1","28,000 K"
"Code.exe","7878","Console","1","31,120 K"`;

    expect(parseWindowsProcessTable(output)).toEqual([
      {
        pid: 4242,
        name: "node.exe"
      },
      {
        pid: 7878,
        name: "Code.exe"
      }
    ]);
  });
});
