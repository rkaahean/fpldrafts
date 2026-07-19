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
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  clearances_blocks_interceptions: number;
  recoveries: number;
  tackles: number;
  defensive_contribution: number;
  starts: number;
  expected_goals_conceded: string;
  opponent_team: number;
  was_home: boolean;
  team_h_score: number | null;
  team_a_score: number | null;
  kickoff_time: string | null;
  selected: number;
  transfers_balance: number;
  transfers_in: number;
  transfers_out: number;
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
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: number;
  creativity: number;
  threat: number;
  ict_index: number;
  clearances_blocks_interceptions: number;
  recoveries: number;
  tackles: number;
  defensive_contribution: number;
  starts: number;
  expected_goals_conceded: number;
  opponent_team: number;
  was_home: boolean;
  team_h_score: number | null;
  team_a_score: number | null;
  kickoff_time: Date | null;
  selected: number;
  transfers_balance: number;
  transfers_in: number;
  transfers_out: number;
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
        clean_sheets: entry.clean_sheets,
        goals_conceded: entry.goals_conceded,
        own_goals: entry.own_goals,
        penalties_saved: entry.penalties_saved,
        penalties_missed: entry.penalties_missed,
        yellow_cards: entry.yellow_cards,
        red_cards: entry.red_cards,
        saves: entry.saves,
        bonus: entry.bonus,
        bps: entry.bps,
        influence: parseFloat(entry.influence),
        creativity: parseFloat(entry.creativity),
        threat: parseFloat(entry.threat),
        ict_index: parseFloat(entry.ict_index),
        clearances_blocks_interceptions: entry.clearances_blocks_interceptions,
        recoveries: entry.recoveries,
        tackles: entry.tackles,
        defensive_contribution: entry.defensive_contribution,
        starts: entry.starts,
        expected_goals_conceded: parseFloat(entry.expected_goals_conceded),
        opponent_team: entry.opponent_team,
        was_home: entry.was_home,
        team_h_score: entry.team_h_score,
        team_a_score: entry.team_a_score,
        kickoff_time: entry.kickoff_time ? new Date(entry.kickoff_time) : null,
        selected: entry.selected,
        transfers_balance: entry.transfers_balance,
        transfers_in: entry.transfers_in,
        transfers_out: entry.transfers_out,
      });
    }
  }

  return rows;
}
