export type GameweekTrendPoint = {
  gameweek: number;
  points: number;
  total_points: number;
  overall_rank: number | null;
  value: number;
  bank: number;
  event_transfers: number;
  event_transfers_cost: number;
};

export type TrendRange = "recent" | "season";

export function selectTrendHistory(
  history: GameweekTrendPoint[],
  range: TrendRange,
  recentCount = 8
) {
  const ordered = [...history].sort((a, b) => a.gameweek - b.gameweek);
  return range === "recent" ? ordered.slice(-recentCount) : ordered;
}

export function rollingAverage(
  history: GameweekTrendPoint[],
  windowSize = 5
) {
  return history.map((point, index) => {
    const window = history.slice(Math.max(0, index - windowSize + 1), index + 1);
    return window.reduce((total, entry) => total + entry.points, 0) / window.length;
  });
}
