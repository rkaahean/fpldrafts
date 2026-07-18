export function computeLatestCompletedGameweek(
  fixtures: { event: number; finished: boolean }[]
): number | null {
  const finishedByEvent = new Map<number, boolean>();

  for (const fixture of fixtures) {
    const allFinishedSoFar = finishedByEvent.get(fixture.event) ?? true;
    finishedByEvent.set(fixture.event, allFinishedSoFar && fixture.finished);
  }

  const completedEvents = Array.from(finishedByEvent.entries())
    .filter(([, allFinished]) => allFinished)
    .map(([event]) => event);

  if (completedEvents.length === 0) {
    return null;
  }

  return Math.max(...completedEvents);
}

export function computeGameweeksToSync(
  latestSyncedGameweek: number | null,
  latestCompletedGameweek: number | null
): number[] {
  if (latestCompletedGameweek === null) {
    return [];
  }

  const from = (latestSyncedGameweek ?? 0) + 1;
  if (from > latestCompletedGameweek) {
    return [];
  }

  return Array.from(
    { length: latestCompletedGameweek - from + 1 },
    (_, i) => from + i
  );
}

interface GameweekSyncEntry<TPick, THistory> {
  picks: TPick[] | undefined;
  history: THistory | undefined;
}

export function mergeGameweekResults<TPick, THistory>(
  validData: (GameweekSyncEntry<TPick, THistory> | undefined)[]
): { picks: TPick[]; history: THistory[] } {
  const picks: TPick[] = [];
  const history: THistory[] = [];

  for (const entry of validData) {
    if (!entry || entry.picks === undefined || entry.history === undefined) {
      continue;
    }
    picks.push(...entry.picks);
    history.push(entry.history);
  }

  return { picks, history };
}

interface PlayerHistoryEntry {
  round: number;
  total_points: number;
  goals_scored: number;
  assists: number;
  expected_goals: string;
  expected_assists: string;
  value: number;
  fixture: number;
}

interface PlayerGameweekStatsInput {
  id?: string;
  history?: PlayerHistoryEntry[];
}

export interface FlattenedGameweekPlayerStat {
  fpl_player_id: string;
  gameweek: number;
  total_points: number;
  goals_scored: number;
  assists: number;
  expected_goals: number;
  expected_assists: number;
  value: number;
  fixture_id: number;
}

export function flattenPlayerGameweekStats(
  playersData: PlayerGameweekStatsInput[]
): FlattenedGameweekPlayerStat[] {
  const rows: FlattenedGameweekPlayerStat[] = [];

  for (const player of playersData) {
    if (!player.id || !player.history) {
      continue;
    }
    for (const entry of player.history) {
      rows.push({
        fpl_player_id: player.id,
        gameweek: entry.round,
        total_points: entry.total_points,
        goals_scored: entry.goals_scored,
        assists: entry.assists,
        expected_goals: parseFloat(entry.expected_goals),
        expected_assists: parseFloat(entry.expected_assists),
        value: entry.value,
        fixture_id: entry.fixture,
      });
    }
  }

  return rows;
}
