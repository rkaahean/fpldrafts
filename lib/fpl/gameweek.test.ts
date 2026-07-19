import { describe, expect, it } from "vitest";
import type {
  DraftTransfer,
  FPLGameweekPicksData,
  PlayerData,
} from "./types";
import {
  applyDrafts,
  assembleGameweekBaseData,
  assembleGameweekPicks,
  buildInitialGameweekPayload,
  computeNextGameweek,
  groupFixturesForTeamCodes,
  resolveGameweekPicks,
  selectBase,
  sumTransferOut,
} from "./gameweek";

describe("computeNextGameweek", () => {
  it("returns 1 when no gameweek has been played yet", () => {
    expect(computeNextGameweek(null)).toBe(1);
  });

  it("returns the next gameweek when mid-season", () => {
    expect(computeNextGameweek(21)).toBe(22);
  });

  it("clamps to 38 when the season is fully played (gameweek 38 already recorded)", () => {
    expect(computeNextGameweek(38)).toBe(38);
  });
});

function basePlayer(id: string, element_type: number, now_value: number) {
  return { id, element_type, now_value };
}

describe("buildInitialGameweekPayload", () => {
  const allPlayers = [
    basePlayer("gk1", 1, 40),
    basePlayer("gk2", 1, 40),
    basePlayer("def1", 2, 50),
    basePlayer("def2", 2, 50),
    basePlayer("def3", 2, 50),
    basePlayer("def4", 2, 50),
    basePlayer("def5", 2, 50),
    basePlayer("mid1", 3, 60),
    basePlayer("mid2", 3, 60),
    basePlayer("mid3", 3, 60),
    basePlayer("mid4", 3, 60),
    basePlayer("mid5", 3, 60),
    basePlayer("fwd1", 4, 70),
    basePlayer("fwd2", 4, 70),
    basePlayer("fwd3", 4, 70),
  ];

  it("returns a plain, directly-consumable object (not a JSON-encoded string)", () => {
    const payload = buildInitialGameweekPayload(allPlayers);

    expect(typeof payload).toBe("object");
    expect(typeof (payload as unknown)).not.toBe("string");
    expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
  });

  it("produces a 15-player squad with distinct pitch positions 1-15", () => {
    const payload = buildInitialGameweekPayload(allPlayers);

    expect(payload.data.length).toBe(15);
    expect(payload.data.map((p) => p.position).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 15 }, (_, i) => i + 1)
    );
  });
});

describe("assembleGameweekPicks", () => {
  const pickRows = [
    {
      position: 1,
      fpl_player_id: "player-a",
      player_id: 10,
      web_name: "Alice",
      team_code: 1,
      element_type: 1,
      total_points: 50,
      expected_goal_involvements_per_90: 0.1,
      now_value: 45,
      team_short_name: "AAA",
      clean_sheets: 0,
      bonus: 0,
      bps: 0,
      defensive_contribution: 0,
      form: 0,
      status: "a",
      chance_of_playing_next_round: null,
      news: "",
      saves: 0,
      influence: 0,
      creativity: 0,
      threat: 0,
      ict_index: 0,
      yellow_cards: 0,
      red_cards: 0,
      starts: 0,
      selected_by_percent: 0,
      points_per_game: 0,
      expected_goals: 0,
      expected_assists: 0,
      expected_goals_conceded: 0,
      goals_conceded: 0,
      expected_assists_per_90: 0,
      expected_goals_per_90: 0,
      saves_per_90: 0,
      stat_value: 44,
    },
    {
      position: 2,
      fpl_player_id: "player-b",
      player_id: 20,
      web_name: "Bob",
      team_code: 2,
      element_type: 2,
      total_points: 30,
      expected_goal_involvements_per_90: 0.2,
      now_value: 55,
      team_short_name: "BBB",
      clean_sheets: 0,
      bonus: 0,
      bps: 0,
      defensive_contribution: 0,
      form: 0,
      status: "a",
      chance_of_playing_next_round: null,
      news: "",
      saves: 0,
      influence: 0,
      creativity: 0,
      threat: 0,
      ict_index: 0,
      yellow_cards: 0,
      red_cards: 0,
      starts: 0,
      selected_by_percent: 0,
      points_per_game: 0,
      expected_goals: 0,
      expected_assists: 0,
      expected_goals_conceded: 0,
      goals_conceded: 0,
      expected_assists_per_90: 0,
      expected_goals_per_90: 0,
      saves_per_90: 0,
      stat_value: 50,
    },
  ];

  const fixturesByTeamCode = new Map([
    [
      1,
      [
        {
          id: "fx-1",
          event: 5,
          team_h_difficulty: 3,
          team_a_difficulty: 2,
          is_home: true,
          opponent_short_name: "CCC",
        },
      ],
    ],
    [2, []],
  ]);

  it("nests each pick's fixtures under its own team, not other teams'", () => {
    const result = assembleGameweekPicks(pickRows, fixturesByTeamCode);

    expect(result.length).toBe(2);
    const alice = result.find((p) => p.fpl_player.player_id === 10)!;
    const bob = result.find((p) => p.fpl_player.player_id === 20)!;

    expect(alice.fpl_player.fpl_player_team.home_fixtures.length).toBe(1);
    expect(alice.fpl_player.fpl_player_team.home_fixtures[0].id).toBe("fx-1");
    expect(bob.fpl_player.fpl_player_team.home_fixtures.length).toBe(0);
    expect(bob.fpl_player.fpl_player_team.away_fixtures.length).toBe(0);
  });

  it("splits fixtures into home/away based on is_home", () => {
    const result = assembleGameweekPicks(pickRows, fixturesByTeamCode);
    const alice = result.find((p) => p.fpl_player.player_id === 10)!;

    expect(alice.fpl_player.fpl_player_team.home_fixtures.length).toBe(1);
    expect(alice.fpl_player.fpl_player_team.away_fixtures.length).toBe(0);
  });

  it("preserves position and core player fields", () => {
    const result = assembleGameweekPicks(pickRows, fixturesByTeamCode);
    const alice = result.find((p) => p.fpl_player.player_id === 10)!;

    expect(alice.position).toBe(1);
    expect(alice.fpl_player.web_name).toBe("Alice");
    expect(alice.fpl_player.fpl_gameweek_player_stats).toEqual([
      { value: 44 },
    ]);
  });

  it("passes through the expanded stat fields unchanged", () => {
    const rowsWithStats = [
      {
        ...pickRows[0],
        clean_sheets: 3,
        bonus: 12,
        bps: 456,
        defensive_contribution: 7,
        form: 4.2,
        status: "d",
        chance_of_playing_next_round: 75,
        news: "Knock - 75% chance of playing",
        saves: 7,
        influence: 41.2,
        creativity: 12.5,
        threat: 30.1,
        ict_index: 8.4,
        yellow_cards: 2,
        red_cards: 0,
        starts: 20,
        selected_by_percent: 15.3,
        points_per_game: 4.8,
        expected_goals: 0.5,
        expected_assists: 0.3,
        expected_goals_conceded: 1.2,
        goals_conceded: 18,
        expected_assists_per_90: 0.12,
        expected_goals_per_90: 0.2,
        saves_per_90: 1.4,
      },
    ];

    const result = assembleGameweekPicks(rowsWithStats, fixturesByTeamCode);
    const alice = result[0];

    expect(alice.fpl_player.clean_sheets).toBe(3);
    expect(alice.fpl_player.bonus).toBe(12);
    expect(alice.fpl_player.bps).toBe(456);
    expect(alice.fpl_player.defensive_contribution).toBe(7);
    expect(alice.fpl_player.form).toBe(4.2);
    expect(alice.fpl_player.status).toBe("d");
    expect(alice.fpl_player.chance_of_playing_next_round).toBe(75);
    expect(alice.fpl_player.news).toBe("Knock - 75% chance of playing");
    expect(alice.fpl_player.saves).toBe(7);
    expect(alice.fpl_player.influence).toBe(41.2);
    expect(alice.fpl_player.creativity).toBe(12.5);
    expect(alice.fpl_player.threat).toBe(30.1);
    expect(alice.fpl_player.ict_index).toBe(8.4);
    expect(alice.fpl_player.yellow_cards).toBe(2);
    expect(alice.fpl_player.red_cards).toBe(0);
    expect(alice.fpl_player.starts).toBe(20);
    expect(alice.fpl_player.selected_by_percent).toBe(15.3);
    expect(alice.fpl_player.points_per_game).toBe(4.8);
    expect(alice.fpl_player.expected_goals).toBe(0.5);
    expect(alice.fpl_player.expected_assists).toBe(0.3);
    expect(alice.fpl_player.expected_goals_conceded).toBe(1.2);
    expect(alice.fpl_player.goals_conceded).toBe(18);
    expect(alice.fpl_player.expected_assists_per_90).toBe(0.12);
    expect(alice.fpl_player.expected_goals_per_90).toBe(0.2);
    expect(alice.fpl_player.saves_per_90).toBe(1.4);
  });
});

describe("groupFixturesForTeamCodes", () => {
  it("keeps only the requested teams while retaining the correct home/away opponent", () => {
    const fixtures = groupFixturesForTeamCodes(
      [
        {
          id: "fixture-1",
          event: 5,
          team_h_difficulty: 2,
          team_a_difficulty: 4,
          home_team_code: 1,
          away_team_code: 2,
          home_team_short_name: "AAA",
          away_team_short_name: "BBB",
        },
      ],
      new Set([1])
    );

    expect(fixtures.get(1)).toEqual([
      {
        id: "fixture-1",
        event: 5,
        team_h_difficulty: 2,
        team_a_difficulty: 4,
        is_home: true,
        opponent_short_name: "BBB",
      },
    ]);
    expect(fixtures.get(2)).toBeUndefined();
  });
});

describe("assembleGameweekBaseData", () => {
  it("builds the API base payload from one combined query result", () => {
    const result = assembleGameweekBaseData({
      pickRows: [
        {
          position: 1,
          fpl_player_id: "player-a",
          player_id: 10,
          web_name: "Alice",
          team_code: 1,
          element_type: 1,
          total_points: 50,
          expected_goal_involvements_per_90: 0.1,
          now_value: 45,
          team_short_name: "AAA",
          clean_sheets: 0,
          bonus: 0,
          bps: 0,
          defensive_contribution: 0,
          form: 0,
          status: "a",
          chance_of_playing_next_round: null,
          news: "",
          saves: 0,
          influence: 0,
          creativity: 0,
          threat: 0,
          ict_index: 0,
          yellow_cards: 0,
          red_cards: 0,
          starts: 0,
          selected_by_percent: 0,
          points_per_game: 0,
          expected_goals: 0,
          expected_assists: 0,
          expected_goals_conceded: 0,
          goals_conceded: 0,
          expected_assists_per_90: 0,
          expected_goals_per_90: 0,
          saves_per_90: 0,
          stat_values: [44],
        },
      ],
      fixtureRows: [
        {
          id: "fixture-1",
          event: 5,
          team_h_difficulty: 2,
          team_a_difficulty: 4,
          home_team_code: 1,
          away_team_code: 2,
          home_team_short_name: "AAA",
          away_team_short_name: "BBB",
        },
      ],
      overall: { value: 1000, overall_rank: 123, bank: 50, points: 60 },
      transferCount: 2,
      history: [
        {
          gameweek: 1,
          points: 60,
          total_points: 60,
          overall_rank: 123,
          value: 1000,
          bank: 50,
          event_transfers: 1,
          event_transfers_cost: 0,
        },
      ],
    });

    expect(result.transferCount).toBe(2);
    expect(result.history).toEqual([
      expect.objectContaining({ gameweek: 1, total_points: 60 }),
    ]);
    expect(result.overall).toEqual({
      value: 1000,
      overall_rank: 123,
      bank: 50,
      points: 60,
    });
    expect(result.data[0].fpl_player.fpl_player_team.home_fixtures).toEqual([
      expect.objectContaining({ id: "fixture-1" }),
    ]);
  });

  it("returns an empty squad when the combined query has no picks", () => {
    const result = assembleGameweekBaseData({
      pickRows: [],
      fixtureRows: [],
      overall: null,
      transferCount: 0,
    });

    expect(result.data).toEqual([]);
    expect(result.overall).toBeNull();
    expect(result.transferCount).toBe(0);
  });
});

function pick(player_id: number, position: number, selling_price: number) {
  return {
    position,
    selling_price,
    fpl_player: { player_id, element_type: 3 },
  } as unknown as FPLGameweekPicksData["data"][number];
}

function picks(
  entries: FPLGameweekPicksData["data"],
  bank: number
): FPLGameweekPicksData {
  return {
    data: entries,
    overall: { bank } as FPLGameweekPicksData["overall"],
  };
}

function emptyTransfersOut(): { [key: number]: PlayerData[] } {
  return { 1: [], 2: [], 3: [], 4: [] };
}

function outPlayer(player_id: number): PlayerData {
  return { player_id } as unknown as PlayerData;
}

function transferDraft(
  outId: number,
  outPrice: number,
  inId: number,
  inPrice: number,
  gameweek: number
): DraftTransfer {
  return {
    in: { data: outPlayer(inId), price: inPrice },
    out: { data: outPlayer(outId), price: outPrice },
    gameweek,
    type: "transfer",
  };
}

describe("resolveGameweekPicks", () => {
  it("selects the fetched data as base and flags setBase when it is non-empty", async () => {
    const parsed = picks([pick(10, 1, 50)], 100);
    const result = await resolveGameweekPicks({
      parsed,
      dbbase: undefined,
      draftChanges: [],
      currentGameweek: 2,
      transfersOut: emptyTransfersOut(),
    });

    expect(result).toBeDefined();
    expect(result!.setBase).toBe(true);
    expect(result!.base).toBe(parsed);
  });

  it("falls back to dbbase and does not flag setBase when fetched data is empty", async () => {
    const dbbase = picks([pick(10, 1, 50)], 100);
    const result = await resolveGameweekPicks({
      parsed: picks([], 0),
      dbbase,
      draftChanges: [],
      currentGameweek: 3,
      transfersOut: emptyTransfersOut(),
    });

    expect(result).toBeDefined();
    expect(result!.setBase).toBe(false);
    expect(result!.base).toBe(dbbase);
  });

  it("only folds draft changes at or before the current gameweek", async () => {
    const parsed = picks([pick(10, 1, 50), pick(20, 2, 55)], 100);
    const result = await resolveGameweekPicks({
      parsed,
      dbbase: undefined,
      draftChanges: [
        transferDraft(20, 55, 99, 45, 2),
        transferDraft(10, 50, 88, 30, 5),
      ],
      currentGameweek: 2,
      transfersOut: emptyTransfersOut(),
    });

    const ids = result!.picks.data.map(
      (p: FPLGameweekPicksData["data"][number]) => p.fpl_player.player_id
    );
    expect(ids).toContain(99);
    expect(ids).not.toContain(88);
    expect(ids).toContain(10);
  });

  it("committedBank excludes remainingTransferOutSum while picks bank includes it", async () => {
    const parsed = picks([pick(10, 1, 50)], 100);
    const transfersOut = emptyTransfersOut();
    transfersOut[3] = [
      { player_id: 77, selling_price: 30 } as unknown as PlayerData,
    ];

    const result = await resolveGameweekPicks({
      parsed,
      dbbase: undefined,
      draftChanges: [],
      currentGameweek: 2,
      transfersOut,
    });

    expect(result!.committedBank).toBe(100);
    expect(result!.picks.overall.bank).toBe(130);
  });

  it("moves committedBank by out.price - in.price for a folded transfer", async () => {
    const parsed = picks([pick(20, 2, 55)], 100);
    const result = await resolveGameweekPicks({
      parsed,
      dbbase: undefined,
      draftChanges: [transferDraft(20, 55, 99, 45, 2)],
      currentGameweek: 2,
      transfersOut: emptyTransfersOut(),
    });

    expect(result!.committedBank).toBe(110);
  });

  it("does not mutate the input parsed object", async () => {
    const parsed = picks([pick(20, 2, 55)], 100);
    await resolveGameweekPicks({
      parsed,
      dbbase: undefined,
      draftChanges: [transferDraft(20, 55, 99, 45, 2)],
      currentGameweek: 2,
      transfersOut: emptyTransfersOut(),
    });

    expect(parsed.overall.bank).toBe(100);
    expect(parsed.data[0].fpl_player.player_id).toBe(20);
  });

  it("returns undefined when there is no base and no fetched data", async () => {
    const result = await resolveGameweekPicks({
      parsed: picks([], 0),
      dbbase: undefined,
      draftChanges: [],
      currentGameweek: 4,
      transfersOut: emptyTransfersOut(),
    });

    expect(result).toBeUndefined();
  });
});

describe("selectBase", () => {
  it("uses non-empty fetched data as base", () => {
    const parsed = picks([pick(10, 1, 50)], 100);
    expect(selectBase(parsed, undefined)).toEqual({ base: parsed, setBase: true });
  });

  it("falls back to dbbase when fetched data is empty", () => {
    const dbbase = picks([pick(10, 1, 50)], 100);
    expect(selectBase(picks([], 0), dbbase)).toEqual({
      base: dbbase,
      setBase: false,
    });
  });
});

describe("sumTransferOut", () => {
  it("sums selling_price across all buckets", () => {
    const buckets = emptyTransfersOut();
    buckets[2] = [{ selling_price: 40 } as unknown as PlayerData];
    buckets[3] = [
      { selling_price: 55 } as unknown as PlayerData,
      { selling_price: 5 } as unknown as PlayerData,
    ];
    expect(sumTransferOut(buckets)).toBe(100);
  });

  it("is zero for empty buckets", () => {
    expect(sumTransferOut(emptyTransfersOut())).toBe(0);
  });
});

describe("applyDrafts", () => {
  it("only folds changes at or before the current gameweek", async () => {
    const base = picks([pick(10, 1, 50), pick(20, 2, 55)], 100);
    const out = await applyDrafts(
      base,
      [transferDraft(20, 55, 99, 45, 2), transferDraft(10, 50, 88, 30, 5)],
      2
    );
    const ids = out.data.map(
      (p: FPLGameweekPicksData["data"][number]) => p.fpl_player.player_id
    );
    expect(ids).toContain(99);
    expect(ids).not.toContain(88);
  });

  it("returns the base unchanged when there are no relevant drafts", async () => {
    const base = picks([pick(10, 1, 50)], 100);
    const out = await applyDrafts(base, [], 2);
    expect(out).toBe(base);
  });
});
