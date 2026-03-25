import { describe, expect, it } from "vitest";

import {
  parseUnixPortListOutput,
  parseWindowsPortListOutput
} from "../src/portList";

describe("port list parsers", () => {
  it("parses Unix lsof output for listening ports", () => {
    const output = `COMMAND   PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
node     1234 bora   20u  IPv6 0x123456789      0t0  TCP *:3000 (LISTEN)
redis-s  4567 bora    6u  IPv4 0x987654321      0t0  TCP 127.0.0.1:6379 (LISTEN)`;

    expect(parseUnixPortListOutput(output)).toEqual([
      {
        name: "node",
        pid: 1234,
        port: 3000
      },
      {
        name: "redis-s",
        pid: 4567,
        port: 6379
      }
    ]);
  });

  it("decodes escaped Unix process names", () => {
    const output = `COMMAND   PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
Code\\x20H  1234 bora   20u  IPv6 0x123456789      0t0  TCP *:3000 (LISTEN)`;

    expect(parseUnixPortListOutput(output)).toEqual([
      {
        name: "Code H",
        pid: 1234,
        port: 3000
      }
    ]);
  });

  it("parses Windows netstat output for listening ports", () => {
    const output = `
  TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       4242
  TCP    127.0.0.1:6379         0.0.0.0:0              LISTENING       7878
`;

    expect(parseWindowsPortListOutput(output)).toEqual([
      {
        port: 3000,
        pid: 4242
      },
      {
        port: 6379,
        pid: 7878
      }
    ]);
  });
});
