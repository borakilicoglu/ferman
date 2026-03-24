import type { InspectPortProvider } from "../types";
import { FermanError } from "../utils/errors";
import { DarwinPortProvider } from "./darwin";
import { LinuxPortProvider } from "./linux";
import { WindowsPortProvider } from "./windows";

export function getPortProvider(platform = process.platform): InspectPortProvider {
  switch (platform) {
    case "darwin":
      return new DarwinPortProvider();
    case "linux":
      return new LinuxPortProvider();
    case "win32":
      return new WindowsPortProvider();
    default:
      throw new FermanError(`Unsupported platform: ${platform}`, "UNSUPPORTED_PLATFORM", 2);
  }
}
