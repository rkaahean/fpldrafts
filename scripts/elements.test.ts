import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "@/test/msw/server";
import { elementSummaryHandler } from "@/test/msw/fpl-handlers";
import { createMockPrisma, type MockPrisma } from "./lib/db.mock";

let mockPrisma: MockPrisma;

vi.mock("./lib/db", () => ({
  get default() {
    return mockPrisma;
  },
}));

function historyEntry(round: number, overrides: Record<string, unknown> = {}) {
  return {
    round,
    total_points: round,
    goals_scored: 0,
    assists: 0,
    expected_goals: "0.1",
    expected_assists: "0.1",
    value: 50 + round,
    fixture: 1000 + round,
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
    team_h_score: 1,
    team_a_score: 0,
    kickoff_time: "2025-08-17T15:30:00Z",
    selected: 0,
    transfers_balance: 0,
    transfers_in: 0,
    transfers_out: 0,
    ...overrides,
  };
}

describe("elements sync", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma();
    process.env.FPL_SEASON_ID = "season-1";
    mockPrisma.seed("FPLPlayer", [
      { id: "player-db-1", player_id: 1, total_points: 10, season_id: "season-1" },
      { id: "player-db-2", player_id: 2, total_points: 20, season_id: "season-1" },
    ]);
  });

  it("writes every history entry per player, not just the first", async () => {
    server.use(
      elementSummaryHandler((playerId) => ({
        history:
          playerId === "1"
            ? [historyEntry(1), historyEntry(2), historyEntry(3)]
            : [historyEntry(1)],
      }))
    );

    const { syncElementsData } = await import("./elements");
    await syncElementsData();

    const stats = mockPrisma.tableRows("FPLGameweekPlayerStats");
    const player1Rows = stats.filter((s) => s.fpl_player_id === "player-db-1");
    const player2Rows = stats.filter((s) => s.fpl_player_id === "player-db-2");

    expect(player1Rows).toHaveLength(3);
    expect(player2Rows).toHaveLength(1);
  });

  it("never exceeds the fetch concurrency cap", async () => {
    mockPrisma.seed(
      "FPLPlayer",
      Array.from({ length: 20 }, (_, i) => ({
        id: `player-db-extra-${i}`,
        player_id: 100 + i,
        total_points: 0,
        season_id: "season-1",
      }))
    );

    let inFlight = 0;
    let maxInFlight = 0;

    server.use(
      elementSummaryHandler(() => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        inFlight--;
        return { history: [historyEntry(1)] };
      })
    );

    const { syncElementsData, FETCH_CONCURRENCY } = await import(
      "./elements"
    );
    await syncElementsData();

    expect(maxInFlight).toBeLessThanOrEqual(FETCH_CONCURRENCY);
  });

  it("does not drop other players' data when one player's fetch fails", async () => {
    server.use(
      elementSummaryHandler((playerId) => {
        if (playerId === "1") {
          throw new Error("network error");
        }
        return { history: [historyEntry(1)] };
      })
    );

    const { syncElementsData } = await import("./elements");
    await syncElementsData();

    const stats = mockPrisma.tableRows("FPLGameweekPlayerStats");
    expect(stats.some((s) => s.fpl_player_id === "player-db-2")).toBe(true);
  });

  it("writes the expanded per-gameweek fields through to FPLGameweekPlayerStats", async () => {
    server.use(
      elementSummaryHandler((playerId) =>
        playerId === "1"
          ? {
              history: [
                historyEntry(1, {
                  defensive_contribution: 12,
                  bps: 38,
                  influence: "49.2",
                  clean_sheets: 1,
                  saves: 7,
                  opponent_team: 14,
                  was_home: false,
                }),
              ],
            }
          : { history: [] }
      )
    );

    const { syncElementsData } = await import("./elements");
    await syncElementsData();

    const [row] = mockPrisma.tableRows("FPLGameweekPlayerStats");
    expect(row).toMatchObject({
      defensive_contribution: 12,
      bps: 38,
      influence: 49.2,
      clean_sheets: 1,
      saves: 7,
      opponent_team: 14,
      was_home: false,
    });
  });
});
