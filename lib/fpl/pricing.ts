export function computeSellingPrice(
  transferInPrice: number,
  currentPrice: number
): number {
  const diff = currentPrice - transferInPrice;
  if (diff > 0) {
    return transferInPrice + Math.floor(diff / 2);
  }
  return currentPrice;
}

export function latestTransferCostByPlayer(
  transfers: { in_player_id: string; in_player_cost: number; time: Date }[]
): Map<string, number> {
  const latest = new Map<string, { cost: number; time: Date }>();
  for (const transfer of transfers) {
    const existing = latest.get(transfer.in_player_id);
    if (!existing || transfer.time > existing.time) {
      latest.set(transfer.in_player_id, {
        cost: transfer.in_player_cost,
        time: transfer.time,
      });
    }
  }
  return new Map(
    Array.from(latest.entries()).map(([playerId, { cost }]) => [
      playerId,
      cost,
    ])
  );
}

export function priceByPlayer(
  stats: { fpl_player_id: string; value: number }[]
): Map<string, number> {
  return new Map(stats.map((stat) => [stat.fpl_player_id, stat.value]));
}

export function applySellingPrices<
  T extends { fpl_player: { id: string } }
>(
  picks: T[],
  transfers: { in_player_id: string; in_player_cost: number; time: Date }[],
  priceStats: { fpl_player_id: string; value: number }[]
): (T & { selling_price: number })[] {
  const transferInPriceByPlayer = latestTransferCostByPlayer(transfers);
  const currentPriceByPlayer = priceByPlayer(priceStats);

  return picks.map((pick) => ({
    ...pick,
    selling_price: computeSellingPrice(
      transferInPriceByPlayer.get(pick.fpl_player.id)!,
      currentPriceByPlayer.get(pick.fpl_player.id)!
    ),
  }));
}
