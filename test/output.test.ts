import { describe, expect, it } from "vitest";

import { cleanupToonOutput } from "../src/utils/output";

describe("cleanupToonOutput", () => {
  it("renders empty arrays more clearly", () => {
    expect(cleanupToonOutput("processes[0]:")).toBe("processes[]:");
  });

  it("removes null lines from TOON output", () => {
    expect(
      cleanupToonOutput(`ok: true
recommendation: null
message: Port is already free.`)
    ).toBe(`ok: true
message: Port is already free.`);
  });
});
