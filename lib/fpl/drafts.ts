export type DraftTransferSummaryRow = {
  gameweek: number;
  in_cost: number;
  out_cost: number;
};

export function draftTransferSummary(transfers: DraftTransferSummaryRow[]) {
  const gameweeks = [...new Set(transfers.map((transfer) => transfer.gameweek))].sort(
    (left, right) => left - right
  );

  return {
    count: transfers.length,
    gameweeks,
    netCost: transfers.reduce(
      (total, transfer) => total + transfer.in_cost - transfer.out_cost,
      0
    ),
  };
}

export function formatDraftGameweeks(gameweeks: number[]) {
  if (gameweeks.length === 0) {
    return "No transfers";
  }

  return gameweeks.map((gameweek) => `GW ${gameweek}`).join(", ");
}
