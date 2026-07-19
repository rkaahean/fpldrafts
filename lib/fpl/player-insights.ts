export function recentForm(
  stats: { gameweek: number; total_points: number }[],
  count = 5
) {
  const pointsByGameweek = new Map<number, number>();
  for (const stat of stats) {
    pointsByGameweek.set(
      stat.gameweek,
      (pointsByGameweek.get(stat.gameweek) ?? 0) + stat.total_points
    );
  }
  const recent = [...pointsByGameweek.entries()]
    .sort(([left], [right]) => right - left)
    .slice(0, count)
    .map(([gameweek, total_points]) => ({ gameweek, total_points }));

  return {
    points: recent.reduce((total, stat) => total + stat.total_points, 0),
    games: recent.length,
  };
}

export function playerPageSize(
  availableHeight: number,
  rowHeight = 48,
  minimum = 5,
  maximum = 20
) {
  return Math.min(
    maximum,
    Math.max(minimum, Math.floor(availableHeight / rowHeight))
  );
}

export type UpcomingFixture = {
  event: number;
  opponent: string;
  difficulty: number;
  isHome: boolean;
};

export function upcomingFixtures(
  fixtures: UpcomingFixture[],
  currentGameweek: number,
  count = 3
) {
  return fixtures
    .filter((fixture) => fixture.event >= currentGameweek)
    .sort((left, right) => left.event - right.event)
    .slice(0, count);
}
