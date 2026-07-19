import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "@/test/msw/server";
import {
  picksHandler,
  transfersHandler,
  notFoundPicksResponse,
} from "@/test/msw/fpl-handlers";
import { createMockPrisma, type MockPrisma } from "./lib/db.mock";

let mockPrisma: MockPrisma;

vi.mock("./lib/db", () => ({
  get default() {
    return mockPrisma;
  },
}));

describe("syncGameweeks", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma();
    mockPrisma.seed("FPLPlayer", [
      { id: "player-db-1", player_id: 1, season_id: "season-1" },
      { id: "player-db-2", player_id: 2, season_id: "season-1" },
    ]);
    process.env.FPL_SEASON_ID = "season-1";
  });

  it("inserts picks and history for each requested gameweek", async () => {
    server.use(
      picksHandler(() => ({
        picks: [
          {
            element: 1,
            position: 1,
            multiplier: 1,
            is_captain: true,
            is_vice_captain: false,
          },
        ],
        entry_history: {
          bank: 5,
          value: 1000,
          points: 60,
          total_points: 60,
          rank: 100,
          overall_rank: 100,
          event_transfers: 0,
          event_transfers_cost: 0,
        },
      })),
      transfersHandler(() => [])
    );

    const { syncGameweeks } = await import("./utils");
    await syncGameweeks("team-db-1", 12345, [1, 2]);

    const picks = mockPrisma.tableRows("FPLGameweekPicks");
    const history = mockPrisma.tableRows("FPLGameweekOverallStats");

    expect(picks).toHaveLength(2);
    expect(history).toHaveLength(2);
    expect(picks.map((p) => p.gameweek)).toEqual([1, 2]);
  });

  it("captures active_chip from the picks response onto the overall stats row", async () => {
    server.use(
      picksHandler((_teamId, gameweek) => ({
        active_chip: gameweek === "1" ? "wildcard" : null,
        picks: [
          {
            element: 1,
            position: 1,
            multiplier: 1,
            is_captain: false,
            is_vice_captain: false,
          },
        ],
        entry_history: {
          bank: 0,
          value: 1000,
          points: 50,
          total_points: 50,
          rank: 1,
          overall_rank: 1,
          event_transfers: 0,
          event_transfers_cost: 0,
        },
      })),
      transfersHandler(() => [])
    );

    const { syncGameweeks } = await import("./utils");
    await syncGameweeks("team-db-1", 12345, [1, 2]);

    const history = mockPrisma.tableRows("FPLGameweekOverallStats");
    const gw1 = history.find((h) => h.gameweek === 1);
    const gw2 = history.find((h) => h.gameweek === 2);

    expect(gw1?.active_chip).toBe("wildcard");
    expect(gw2?.active_chip).toBeNull();
  });

  it("skips gameweeks the FPL API reports as not found without failing the sync", async () => {
    server.use(
      picksHandler((_teamId, gameweek) =>
        gameweek === "1"
          ? {
              picks: [
                {
                  element: 1,
                  position: 1,
                  multiplier: 1,
                  is_captain: false,
                  is_vice_captain: false,
                },
              ],
              entry_history: {
                bank: 0,
                value: 1000,
                points: 50,
                total_points: 50,
                rank: 1,
                overall_rank: 1,
                event_transfers: 0,
                event_transfers_cost: 0,
              },
            }
          : notFoundPicksResponse
      ),
      transfersHandler(() => [])
    );

    const { syncGameweeks } = await import("./utils");
    await syncGameweeks("team-db-1", 12345, [1, 2]);

    const picks = mockPrisma.tableRows("FPLGameweekPicks");
    expect(picks).toHaveLength(1);
    expect(picks[0].gameweek).toBe(1);
  });

  it("syncs transfers alongside picks and history", async () => {
    mockPrisma.seed("FPLPlayer", [
      { id: "player-db-3", player_id: 3, season_id: "season-1" },
      { id: "player-db-4", player_id: 4, season_id: "season-1" },
    ]);

    server.use(
      picksHandler(() => ({
        picks: [],
        entry_history: {
          bank: 0,
          value: 1000,
          points: 0,
          total_points: 0,
          rank: 1,
          overall_rank: 1,
          event_transfers: 1,
          event_transfers_cost: 4,
        },
      })),
      transfersHandler(() => [
        {
          element_in: 3,
          element_in_cost: 55,
          element_out: 4,
          element_out_cost: 60,
          time: "2026-01-01T00:00:00Z",
          event: 1,
        },
      ])
    );

    const { syncGameweeks } = await import("./utils");
    await syncGameweeks("team-db-1", 12345, [1]);

    const transfers = mockPrisma.tableRows("FPLGameweekTransfers");
    expect(transfers).toHaveLength(1);
    expect(transfers[0]).toMatchObject({
      fpl_team_id: "team-db-1",
      in_player_id: "player-db-3",
      out_player_id: "player-db-4",
    });
  });
});

describe("syncFullHistory", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma();
    mockPrisma.seed("FPLPlayer", [
      { id: "player-db-1", player_id: 1, season_id: "season-1" },
    ]);
    process.env.FPL_SEASON_ID = "season-1";
  });

  it("requests all 38 gameweeks", async () => {
    const requestedGameweeks: string[] = [];
    server.use(
      picksHandler((_teamId, gameweek) => {
        requestedGameweeks.push(gameweek);
        return notFoundPicksResponse;
      }),
      transfersHandler(() => [])
    );

    const { syncFullHistory } = await import("./utils");
    await syncFullHistory("team-db-1", 12345);

    expect(new Set(requestedGameweeks).size).toBe(38);
    expect(requestedGameweeks).toContain("1");
    expect(requestedGameweeks).toContain("38");
  });
});
