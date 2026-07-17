import type { DraftTransfer } from "./types";

export function computeTransferCost(
  transfersMade: number,
  freeAvailable: number | "∞"
): number {
  if (freeAvailable === "∞") {
    return 0;
  }
  return Math.max(0, transfersMade - freeAvailable) * -4 || 0;
}

export function countTransfersInGameweek(
  changes: DraftTransfer[],
  gameweek: number
): number {
  return changes.filter(
    (change) => change.gameweek == gameweek && change.type == "transfer"
  ).length;
}

export function computeFreeTransfers({
  currentGameweek,
  draftChanges,
  serverTransferCount,
}: {
  currentGameweek: number;
  draftChanges: DraftTransfer[];
  serverTransferCount: number;
}): number | "∞" {
  if (currentGameweek == 1) {
    return "∞";
  }
  if (currentGameweek == 2) {
    return 1;
  }

  let raw: number;
  if (draftChanges.length > 0) {
    const numTransfers = draftChanges.filter(
      (transfer) =>
        transfer.gameweek >= currentGameweek - 5 &&
        transfer.gameweek <= currentGameweek - 1 &&
        transfer.gameweek > 1 &&
        transfer.type == "transfer"
    ).length;
    raw = currentGameweek - numTransfers - 1;
  } else {
    raw = currentGameweek - serverTransferCount - 1;
  }

  raw = raw > 5 ? 5 : raw;
  raw = raw <= 0 ? 1 : raw;
  return raw;
}
