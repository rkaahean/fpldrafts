export type FixtureForRun = {
  event: number;
  difficulty: number;
};

export type TeamFixtureRun = {
  team_id: string;
  full_name: string;
  fixtures: FixtureForRun[];
};

export function fixtureGameweeks(startGameweek: number, count = 5): number[] {
  const endGameweek = Math.min(38, startGameweek + count - 1);
  return Array.from(
    { length: endGameweek - startGameweek + 1 },
    (_, index) => startGameweek + index
  );
}

export function fixtureRunSummaries(
  teams: TeamFixtureRun[],
  gameweeks: number[]
) {
  const gameweekSet = new Set(gameweeks);
  const runs = teams
    .map((team) => {
      const fixtures = team.fixtures.filter((fixture) =>
        gameweekSet.has(fixture.event)
      );
      const averageDifficulty =
        fixtures.reduce((total, fixture) => total + fixture.difficulty, 0) /
        fixtures.length;

      return { ...team, fixtures, averageDifficulty };
    })
    .filter((team) => team.fixtures.length > 0)
    .sort((left, right) => left.averageDifficulty - right.averageDifficulty);

  return {
    easiest: runs[0],
    hardest: runs.at(-1),
  };
}
