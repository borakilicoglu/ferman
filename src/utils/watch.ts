import type { BatchCommandResult, CommandResult } from "../types";

type WatchableResult = CommandResult | BatchCommandResult;

interface PortSnapshot {
  port: number;
  busy: boolean;
  processNames: string[];
}

function toPortSnapshots(result: WatchableResult): PortSnapshot[] {
  if ("ports" in result) {
    return result.ports.map((item) => ({
      port: item.port,
      busy: item.busy,
      processNames: item.processes
        .map((process) => process.name?.toLowerCase())
        .filter((name): name is string => Boolean(name))
    }));
  }

  return [
    {
      port: result.port,
      busy: result.busy,
      processNames: result.processes
        .map((process) => process.name?.toLowerCase())
        .filter((name): name is string => Boolean(name))
    }
  ];
}

export function createWatchHint(
  previousResult: WatchableResult | undefined,
  currentResult: WatchableResult
): string | undefined {
  if (!previousResult) {
    return undefined;
  }

  const previousByPort = new Map(
    toPortSnapshots(previousResult).map((snapshot) => [snapshot.port, snapshot] as const)
  );
  const reappearedPorts: number[] = [];
  const respawnedPorts: number[] = [];

  for (const current of toPortSnapshots(currentResult)) {
    const previous = previousByPort.get(current.port);

    if (!previous) {
      continue;
    }

    if (!previous.busy && current.busy) {
      reappearedPorts.push(current.port);
    }

    if (!current.busy || previous.processNames.length === 0 || current.processNames.length === 0) {
      continue;
    }

    const sameProcessFamily = current.processNames.some((name) => previous.processNames.includes(name));

    if (sameProcessFamily && previous.busy) {
      respawnedPorts.push(current.port);
    }
  }

  if (reappearedPorts.length > 0) {
    return `Ports ${reappearedPorts.join(
      ", "
    )} became busy again. A watcher, restart script, or container entrypoint may have recreated the listener.`;
  }

  if (respawnedPorts.length > 0) {
    return `Ports ${respawnedPorts.join(
      ", "
    )} are still owned by the same process family. If they keep reappearing, inspect the parent watcher or restart loop.`;
  }

  return undefined;
}
