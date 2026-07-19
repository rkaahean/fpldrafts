import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "@/test/msw/server";
import { bootstrapStaticHandler } from "@/test/msw/fpl-handlers";
import { createMockPrisma, type MockPrisma } from "./lib/db.mock";

let mockPrisma: MockPrisma;

vi.mock("./lib/db", () => ({
  get default() {
    return mockPrisma;
  },
}));

function fakePlayer(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    web_name: `Player${id}`,
    team: 1,
    element_type: 1,
    team_code: 1,
    first_name: "First",
    second_name: "Last",
    goals_scored: 0,
    assists: 0,
    expected_goals: "0",
    expected_assists: "0",
    expected_goal_involvements: "0",
    expected_goals_per_90: "0",
    expected_assists_per_90: "0",
    expected_goal_involvements_per_90: "0",
    total_points: 0,
    minutes: 0,
    now_cost: 50,
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
    saves_per_90: 0,
    expected_goals_conceded_per_90: 0,
    goals_conceded_per_90: 0,
    starts_per_90: 0,
    clean_sheets_per_90: 0,
    defensive_contribution_per_90: 0,
    selected_by_percent: "0.0",
    transfers_in: 0,
    transfers_out: 0,
    transfers_in_event: 0,
    transfers_out_event: 0,
    cost_change_event: 0,
    cost_change_start: 0,
    form: "0.0",
    points_per_game: "0.0",
    value_season: "0.0",
    value_form: "0.0",
    ep_next: "0.0",
    ep_this: "0.0",
    influence_rank: 1,
    influence_rank_type: 1,
    creativity_rank: 1,
    creativity_rank_type: 1,
    threat_rank: 1,
    threat_rank_type: 1,
    ict_index_rank: 1,
    ict_index_rank_type: 1,
    now_cost_rank: 1,
    now_cost_rank_type: 1,
    form_rank: 1,
    form_rank_type: 1,
    points_per_game_rank: 1,
    points_per_game_rank_type: 1,
    selected_rank: 1,
    selected_rank_type: 1,
    chance_of_playing_next_round: 100,
    chance_of_playing_this_round: 100,
    status: "a",
    news: "",
    news_added: null,
    corners_and_indirect_freekicks_order: null,
    direct_freekicks_order: null,
    penalties_order: null,
    ...overrides,
  };
}

function fakeTeam(code: number, overrides: Record<string, unknown> = {}) {
  return {
    id: code,
    code,
    name: `Team${code}`,
    short_name: `T${code}`,
    strength: 3,
    strength_overall_home: 1200,
    strength_overall_away: 1250,
    strength_attack_home: 1100,
    strength_attack_away: 1150,
    strength_defence_home: 1300,
    strength_defence_away: 1350,
    ...overrides,
  };
}

describe("bootstrap sync", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma();
    process.env.FPL_SEASON_ID = "season-1";
  });

  it("upserts every fetched team, not just some", async () => {
    server.use(
      bootstrapStaticHandler(() => ({
        elements: [],
        teams: [fakeTeam(1), fakeTeam(2), fakeTeam(3)],
      }))
    );

    const { syncBootstrapData } = await import("./bootstrap");
    await syncBootstrapData();

    const teams = mockPrisma.tableRows("FPLPlayerTeam");
    expect(teams).toHaveLength(3);
  });

  it("bulk-creates new players", async () => {
    server.use(
      bootstrapStaticHandler(() => ({
        elements: [fakePlayer(101), fakePlayer(102)],
        teams: [],
      }))
    );

    const { syncBootstrapData } = await import("./bootstrap");
    await syncBootstrapData();

    const players = mockPrisma.tableRows("FPLPlayer");
    expect(players).toHaveLength(2);
  });

  it("captures the expanded stat fields when creating a new player", async () => {
    server.use(
      bootstrapStaticHandler(() => ({
        elements: [
          fakePlayer(101, {
            defensive_contribution: 12,
            bps: 350,
            influence: "541.6",
            creativity: "33.5",
            threat: "12.0",
            ict_index: "57.5",
            selected_by_percent: "36.4",
            form: "4.2",
            chance_of_playing_next_round: 75,
            status: "d",
            news: "Knock - 75% chance of playing",
          }),
        ],
        teams: [],
      }))
    );

    const { syncBootstrapData } = await import("./bootstrap");
    await syncBootstrapData();

    const [player] = mockPrisma.tableRows("FPLPlayer");
    expect(player).toMatchObject({
      defensive_contribution: 12,
      bps: 350,
      influence: 541.6,
      creativity: 33.5,
      threat: 12.0,
      ict_index: 57.5,
      selected_by_percent: 36.4,
      form: 4.2,
      chance_of_playing_next_round: 75,
      status: "d",
      news: "Knock - 75% chance of playing",
    });
  });

  it("leaves nullable rank/projection fields null when FPL reports them as null", async () => {
    server.use(
      bootstrapStaticHandler(() => ({
        elements: [
          fakePlayer(101, {
            ep_next: null,
            ep_this: null,
            influence_rank: null,
            chance_of_playing_next_round: null,
            corners_and_indirect_freekicks_order: null,
          }),
        ],
        teams: [],
      }))
    );

    const { syncBootstrapData } = await import("./bootstrap");
    await syncBootstrapData();

    const [player] = mockPrisma.tableRows("FPLPlayer");
    expect(player.ep_next).toBeNull();
    expect(player.ep_this).toBeNull();
    expect(player.influence_rank).toBeNull();
    expect(player.chance_of_playing_next_round).toBeNull();
    expect(player.corners_and_indirect_freekicks_order).toBeNull();
  });

  it("captures team strength splits", async () => {
    server.use(
      bootstrapStaticHandler(() => ({
        elements: [],
        teams: [
          fakeTeam(1, {
            strength_overall_home: 1305,
            strength_overall_away: 1370,
            strength_attack_home: 1340,
            strength_attack_away: 1390,
            strength_defence_home: 1270,
            strength_defence_away: 1350,
          }),
        ],
      }))
    );

    const { syncBootstrapData } = await import("./bootstrap");
    await syncBootstrapData();

    const [team] = mockPrisma.tableRows("FPLPlayerTeam");
    expect(team).toMatchObject({
      strength_overall_home: 1305,
      strength_overall_away: 1370,
      strength_attack_home: 1340,
      strength_attack_away: 1390,
      strength_defence_home: 1270,
      strength_defence_away: 1350,
    });
  });

  it("updates every existing player, not just a subset", async () => {
    mockPrisma.seed("FPLPlayer", [
      { player_id: 101, season_id: "season-1", total_points: 0 },
      { player_id: 102, season_id: "season-1", total_points: 0 },
      { player_id: 103, season_id: "season-1", total_points: 0 },
    ]);

    server.use(
      bootstrapStaticHandler(() => ({
        elements: [
          fakePlayer(101, { total_points: 10 }),
          fakePlayer(102, { total_points: 20 }),
          fakePlayer(103, { total_points: 30 }),
        ],
        teams: [],
      }))
    );

    const { syncBootstrapData } = await import("./bootstrap");
    await syncBootstrapData();

    const players = mockPrisma.tableRows("FPLPlayer");
    expect(players.map((p) => p.total_points).sort()).toEqual([10, 20, 30]);
  });

  it("does not let one player's update failure prevent the others from being written", async () => {
    mockPrisma.seed("FPLPlayer", [
      { player_id: 101, season_id: "season-1", total_points: 0 },
      { player_id: 102, season_id: "season-1", total_points: 0 },
    ]);

    const originalUpdate = mockPrisma.fPLPlayer.update;
    mockPrisma.fPLPlayer.update = vi.fn(async (args: any) => {
      if (args.where.player_id_season_id.player_id === 101) {
        throw new Error("boom");
      }
      return originalUpdate(args);
    });

    server.use(
      bootstrapStaticHandler(() => ({
        elements: [
          fakePlayer(101, { total_points: 10 }),
          fakePlayer(102, { total_points: 20 }),
        ],
        teams: [],
      }))
    );

    const { syncBootstrapData } = await import("./bootstrap");
    await syncBootstrapData();

    const updatedPlayer = mockPrisma
      .tableRows("FPLPlayer")
      .find((p) => p.player_id === 102);
    expect(updatedPlayer?.total_points).toBe(20);
  });
});
