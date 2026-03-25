import { describe, expect, it } from "vitest";

import {
  parseUnixPsOutput,
  parseWindowsTasklistOutput
} from "../src/nodeProcesses";

describe("node process parsers", () => {
  it("parses Unix ps output into Node process entries", () => {
    const output = `
1234 node /usr/local/bin/node server.js
5678 tsx tsx watch src/index.ts
9999 python python app.py
`;

    expect(parseUnixPsOutput(output)).toEqual([
      {
        pid: 1234,
        name: "node",
        command: "node /usr/local/bin/node server.js"
      },
      {
        pid: 5678,
        name: "node",
        command: "tsx tsx watch src/index.ts"
      },
      {
        pid: 9999,
        name: "node",
        command: "python python app.py"
      }
    ]);
  });

  it("parses Windows tasklist CSV output", () => {
    const output = `"node.exe","4242","Console","1","28,000 K"
"node.exe","7878","Console","1","31,120 K"`;

    expect(parseWindowsTasklistOutput(output)).toEqual([
      {
        pid: 4242,
        name: "node.exe"
      },
      {
        pid: 7878,
        name: "node.exe"
      }
    ]);
  });

  it("ignores the Windows no-tasks message", () => {
    expect(parseWindowsTasklistOutput("INFO: No tasks are running which match the specified criteria.")).toEqual([]);
  });
});
