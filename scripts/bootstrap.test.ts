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
    ...overrides,
  };
}

function fakeTeam(code: number) {
  return {
    id: code,
    code,
    name: `Team${code}`,
    short_name: `T${code}`,
    strength: 3,
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
