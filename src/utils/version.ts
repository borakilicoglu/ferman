import { readFileSync } from "node:fs";
import { join } from "node:path";

let cachedPackageVersion: string | undefined;

interface PackageJsonShape {
  version?: unknown;
}

export function getPackageVersion(): string {
  if (cachedPackageVersion) {
    return cachedPackageVersion;
  }

  const packageJsonPath = join(__dirname, "..", "..", "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as PackageJsonShape;

  if (typeof packageJson.version !== "string" || packageJson.version.trim().length === 0) {
    throw new Error("Package version is missing from package.json.");
  }

  cachedPackageVersion = packageJson.version;
  return cachedPackageVersion;
}
