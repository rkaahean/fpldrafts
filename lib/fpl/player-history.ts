export type PlayerHistoryPoint = {
  gameweek: number;
  total_points: number;
  value: number;
  expected_goals: number;
  expected_assists: number;
};

export function rollingAverage(values: number[], windowSize = 5): number[] {
  return values.map((_, index) => {
    const window = values.slice(Math.max(0, index - windowSize + 1), index + 1);
    return window.reduce((total, value) => total + value, 0) / window.length;
  });
}

export function computeRollingXgTrend(
  history: PlayerHistoryPoint[],
  windowSize = 5
): { gameweek: number; xg: number; xa: number; xgi: number }[] {
  const xg = rollingAverage(
    history.map((point) => point.expected_goals),
    windowSize
  );
  const xa = rollingAverage(
    history.map((point) => point.expected_assists),
    windowSize
  );

  return history.map((point, index) => ({
    gameweek: point.gameweek,
    xg: xg[index],
    xa: xa[index],
    xgi: xg[index] + xa[index],
  }));
}
