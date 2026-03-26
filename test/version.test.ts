import { describe, expect, it } from "vitest";

import { getPackageVersion } from "../src/utils/version";

describe("getPackageVersion", () => {
  it("matches the package.json version", async () => {
    const packageJson = (await import("../package.json")).default;

    expect(getPackageVersion()).toBe(packageJson.version);
  });
});
