import { InspectPortProvider } from "../types";
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
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
