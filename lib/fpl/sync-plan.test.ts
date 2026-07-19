import { describe, expect, it } from "vitest";
import {
  computeLatestCompletedGameweek,
  computeGameweeksToSync,
  mergeGameweekResults,
  flattenPlayerGameweekStats,
} from "./sync-plan";

describe("computeLatestCompletedGameweek", () => {
  it("returns null for an empty fixture list", () => {
    expect(computeLatestCompletedGameweek([])).toBeNull();
  });

  it("returns the event when all its fixtures are finished", () => {
    const fixtures = [
      { event: 1, finished: true },
      { event: 1, finished: true },
    ];
    expect(computeLatestCompletedGameweek(fixtures)).toBe(1);
  });

  it("excludes a gameweek with any unfinished fixture", () => {
    const fixtures = [
      { event: 1, finished: true },
      { event: 1, finished: false },
    ];
    expect(computeLatestCompletedGameweek(fixtures)).toBeNull();
  });

  it("returns the max fully-finished gameweek across multiple gameweeks", () => {
    const fixtures = [
      { event: 1, finished: true },
      { event: 2, finished: true },
      { event: 3, finished: true },
      { event: 3, finished: false },
    ];
    expect(computeLatestCompletedGameweek(fixtures)).toBe(2);
  });
});

describe("computeGameweeksToSync", () => {
  it("returns an empty array when nothing is completed yet", () => {
    expect(computeGameweeksToSync(null, null)).toEqual([]);
  });

  it("returns 1..N when never synced and gameweek 3 is complete", () => {
    expect(computeGameweeksToSync(null, 3)).toEqual([1, 2, 3]);
  });

  it("returns an empty array when already caught up", () => {
    expect(computeGameweeksToSync(5, 5)).toEqual([]);
  });

  it("returns only the missing gameweeks", () => {
    expect(computeGameweeksToSync(5, 7)).toEqual([6, 7]);
  });

  it("defends against synced being ahead of completed", () => {
    expect(computeGameweeksToSync(8, 5)).toEqual([]);
  });
});

describe("mergeGameweekResults", () => {
  it("flattens picks and collects history from valid entries, skipping undefined ones", () => {
    const validData = [
      {
        picks: [{ fpl_team_id: "t1", fpl_player_id: "p1", gameweek: 1 } as any],
        history: { fpl_team_id: "t1", gameweek: 1, bank: 0 } as any,
      },
      undefined,
      {
        picks: [{ fpl_team_id: "t1", fpl_player_id: "p2", gameweek: 2 } as any],
        history: { fpl_team_id: "t1", gameweek: 2, bank: 5 } as any,
      },
    ];

    const result = mergeGameweekResults<
      { fpl_team_id: string; fpl_player_id: string; gameweek: number },
      { fpl_team_id: string; gameweek: number; bank: number }
    >(validData as any);

    expect(result.picks).toHaveLength(2);
    expect(result.history).toHaveLength(2);
    expect(result.picks.map((p) => p.gameweek)).toEqual([1, 2]);
    expect(result.history.map((h) => h.gameweek)).toEqual([1, 2]);
  });

  it("returns empty arrays when given no valid entries", () => {
    expect(mergeGameweekResults([])).toEqual({ picks: [], history: [] });
  });
});

describe("flattenPlayerGameweekStats", () => {
  it("returns one row per history entry for a single player", () => {
    const playersData = [
      {
        id: "player-1",
        history: [
          { round: 1, total_points: 5, goals_scored: 1, assists: 0, expected_goals: "0.3", expected_assists: "0.1", value: 55, fixture: 101 },
          { round: 2, total_points: 2, goals_scored: 0, assists: 1, expected_goals: "0.1", expected_assists: "0.2", value: 56, fixture: 102 },
        ],
      },
    ];

    const rows = flattenPlayerGameweekStats(playersData as any);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      fpl_player_id: "player-1",
      gameweek: 1,
      fixture_id: 101,
      value: 55,
    });
    expect(rows[1]).toMatchObject({
      fpl_player_id: "player-1",
      gameweek: 2,
      fixture_id: 102,
      value: 56,
    });
  });

  it("includes rows from every player, not just the first entry", () => {
    const playersData = [
      { id: "player-1", history: [{ round: 1, total_points: 1, goals_scored: 0, assists: 0, expected_goals: "0", expected_assists: "0", value: 50, fixture: 1 }] },
      { id: "player-2", history: [{ round: 1, total_points: 3, goals_scored: 1, assists: 0, expected_goals: "0.5", expected_assists: "0", value: 60, fixture: 1 }] },
    ];

    const rows = flattenPlayerGameweekStats(playersData as any);

    expect(rows.map((r) => r.fpl_player_id)).toEqual(["player-1", "player-2"]);
  });

  it("returns no rows for a player with empty history", () => {
    const playersData = [{ id: "player-1", history: [] }];
    expect(flattenPlayerGameweekStats(playersData as any)).toEqual([]);
  });

  it("skips entries with no usable data", () => {
    const playersData = [{}, { id: "player-1", history: [] }];
    expect(flattenPlayerGameweekStats(playersData as any)).toEqual([]);
  });

  it("captures the expanded per-gameweek fields", () => {
    const playersData = [
      {
        id: "player-1",
        history: [
          {
            round: 1,
            total_points: 10,
            goals_scored: 0,
            assists: 0,
            expected_goals: "0.0",
            expected_assists: "0.0",
            value: 55,
            fixture: 101,
            clean_sheets: 1,
            goals_conceded: 0,
            own_goals: 0,
            penalties_saved: 0,
            penalties_missed: 0,
            yellow_cards: 1,
            red_cards: 0,
            saves: 7,
            bonus: 3,
            bps: 38,
            influence: "49.2",
            creativity: "0.0",
            threat: "0.0",
            ict_index: "4.9",
            clearances_blocks_interceptions: 1,
            recoveries: 13,
            tackles: 0,
            defensive_contribution: 0,
            starts: 1,
            expected_goals_conceded: "1.52",
            opponent_team: 14,
            was_home: false,
            team_h_score: 0,
            team_a_score: 1,
            kickoff_time: "2025-08-17T15:30:00Z",
            selected: 1531911,
            transfers_balance: 0,
            transfers_in: 0,
            transfers_out: 0,
          },
        ],
      },
    ];

    const [row] = flattenPlayerGameweekStats(playersData as any);

    expect(row).toMatchObject({
      clean_sheets: 1,
      yellow_cards: 1,
      saves: 7,
      bonus: 3,
      bps: 38,
      influence: 49.2,
      creativity: 0,
      threat: 0,
      ict_index: 4.9,
      clearances_blocks_interceptions: 1,
      recoveries: 13,
      defensive_contribution: 0,
      starts: 1,
      expected_goals_conceded: 1.52,
      opponent_team: 14,
      was_home: false,
      team_h_score: 0,
      team_a_score: 1,
      selected: 1531911,
      transfers_balance: 0,
    });
    expect(row.kickoff_time).toEqual(new Date("2025-08-17T15:30:00Z"));
  });

  it("keeps team_h_score/team_a_score/kickoff_time null when FPL reports them as null", () => {
    const playersData = [
      {
        id: "player-1",
        history: [
          {
            round: 1,
            total_points: 0,
            goals_scored: 0,
            assists: 0,
            expected_goals: "0.0",
            expected_assists: "0.0",
            value: 50,
            fixture: 101,
            clean_sheets: 0,
            goals_conceded: 0,
            own_goals: 0,
            penalties_saved: 0,
            penalties_missed: 0,
            yellow_cards: 0,
            red_cards: 0,
            saves: 0,
            bonus: 0,
            bps: 0,
            influence: "0.0",
            creativity: "0.0",
            threat: "0.0",
            ict_index: "0.0",
            clearances_blocks_interceptions: 0,
            recoveries: 0,
            tackles: 0,
            defensive_contribution: 0,
            starts: 0,
            expected_goals_conceded: "0.0",
            opponent_team: 1,
            was_home: true,
            team_h_score: null,
            team_a_score: null,
            kickoff_time: null,
            selected: 0,
            transfers_balance: 0,
            transfers_in: 0,
            transfers_out: 0,
          },
        ],
      },
    ];

    const [row] = flattenPlayerGameweekStats(playersData as any);

    expect(row.team_h_score).toBeNull();
    expect(row.team_a_score).toBeNull();
    expect(row.kickoff_time).toBeNull();
  });
});
