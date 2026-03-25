import { describe, expect, it } from "vitest";

import {
  parseUnixPsOutput,
  parseWindowsTasklistOutput
} from "../src/nodeProcesses";
import {
  parseUnixListeningPorts,
  parseWindowsListeningPorts
} from "../src/nodePorts";

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
        command: "/usr/local/bin/node server.js"
      },
      {
        pid: 5678,
        name: "tsx",
        command: "tsx watch src/index.ts"
      },
      {
        pid: 9999,
        name: "python",
        command: "python app.py"
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

  it("parses Unix listening ports for a process", () => {
    const output = `
node    1234 macbook   20u  IPv6 0x12345      0t0  TCP *:3000 (LISTEN)
node    1234 macbook   21u  IPv6 0x12346      0t0  TCP *:9229 (LISTEN)
`;

    expect(parseUnixListeningPorts(output)).toEqual([3000, 9229]);
  });

  it("parses Windows listening ports for a pid", () => {
    const output = `
  TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       4242
  TCP    127.0.0.1:9229         0.0.0.0:0              LISTENING       4242
  TCP    127.0.0.1:5173         0.0.0.0:0              LISTENING       7878
`;

    expect(parseWindowsListeningPorts(output, 4242)).toEqual([3000, 9229]);
  });
});
