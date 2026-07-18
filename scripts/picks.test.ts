import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockPrisma, type MockPrisma } from "./lib/db.mock";

let mockPrisma: MockPrisma;
const syncGameweeksMock = vi.fn(
  async (_teamId: string, _fplTeamNumber: number, _gameweeks: number[]) =>
    undefined
);

vi.mock("./lib/db", () => ({
  get default() {
    return mockPrisma;
  },
}));

vi.mock("./utils", () => ({
  syncGameweeks: (teamId: string, fplTeamNumber: number, gameweeks: number[]) =>
    syncGameweeksMock(teamId, fplTeamNumber, gameweeks),
}));

describe("syncAllTeams (picks.ts main)", () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma();
    syncGameweeksMock.mockClear();
    syncGameweeksMock.mockResolvedValue(undefined);
    process.env.FPL_SEASON_ID = "season-1";

    mockPrisma.seed("FPLFixtures", [
      { event: 1, finished: true, season_id: "season-1" },
      { event: 2, finished: true, season_id: "season-1" },
    ]);
  });

  it("syncs every team returned by findMany, not just one hardcoded team", async () => {
    mockPrisma.seed("FPLTeam", [
      { id: "team-1", team_id: 111, fpl_season_id: "season-1" },
      { id: "team-2", team_id: 222, fpl_season_id: "season-1" },
      { id: "team-3", team_id: 333, fpl_season_id: "season-1" },
    ]);

    const { syncAllTeams } = await import("./picks");
    await syncAllTeams();

    expect(syncGameweeksMock).toHaveBeenCalledTimes(3);
    const syncedTeamIds = syncGameweeksMock.mock.calls.map((call) => call[0]);
    expect(syncedTeamIds.sort()).toEqual(["team-1", "team-2", "team-3"]);
  });

  it("isolates one team's failure without stopping the others", async () => {
    mockPrisma.seed("FPLTeam", [
      { id: "team-1", team_id: 111, fpl_season_id: "season-1" },
      { id: "team-2", team_id: 222, fpl_season_id: "season-1" },
    ]);

    syncGameweeksMock.mockImplementation(async (teamId: string) => {
      if (teamId === "team-1") {
        throw new Error("boom");
      }
    });

    const { syncAllTeams } = await import("./picks");
    await expect(syncAllTeams()).resolves.not.toThrow();

    expect(syncGameweeksMock).toHaveBeenCalledTimes(2);
  });

  it("skips a team that is already caught up", async () => {
    mockPrisma.seed("FPLTeam", [
      { id: "team-1", team_id: 111, fpl_season_id: "season-1" },
    ]);
    mockPrisma.seed("FPLGameweekPicks", [
      { fpl_team_id: "team-1", gameweek: 2 },
    ]);

    const { syncAllTeams } = await import("./picks");
    await syncAllTeams();

    expect(syncGameweeksMock).not.toHaveBeenCalled();
  });

  it("disconnects prisma only after every team has settled", async () => {
    mockPrisma.seed("FPLTeam", [
      { id: "team-1", team_id: 111, fpl_season_id: "season-1" },
    ]);

    let syncResolved = false;
    syncGameweeksMock.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      syncResolved = true;
    });

    const { syncAllTeams } = await import("./picks");
    await syncAllTeams();

    expect(syncResolved).toBe(true);
    expect(mockPrisma.$disconnect).not.toHaveBeenCalled();
  });
});
