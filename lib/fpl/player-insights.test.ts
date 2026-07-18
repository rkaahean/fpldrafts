import { describe, expect, it } from "vitest";
import { recentForm, upcomingFixtures } from "./player-insights";

describe("recentForm", () => {
  it("sums the five most recent gameweek scores", () => {
    expect(
      recentForm([
        { gameweek: 1, total_points: 10 },
        { gameweek: 2, total_points: 2 },
        { gameweek: 3, total_points: 4 },
        { gameweek: 4, total_points: 6 },
        { gameweek: 5, total_points: 8 },
        { gameweek: 6, total_points: 12 },
      ])
    ).toEqual({ points: 32, games: 5 });
  });
});

describe("playerPageSize", () => {
  it("uses the available table height to choose a bounded page size", async () => {
    const { playerPageSize } = await import("./player-insights");

    expect(playerPageSize(510)).toBe(10);
    expect(playerPageSize(20)).toBe(5);
  });
});

describe("upcomingFixtures", () => {
  it("returns the next three fixtures in gameweek order", () => {
    expect(
      upcomingFixtures(
        [
          { event: 10, opponent: "MCI", difficulty: 5, isHome: false },
          { event: 8, opponent: "FUL", difficulty: 2, isHome: true },
          { event: 9, opponent: "AVL", difficulty: 3, isHome: false },
          { event: 11, opponent: "CHE", difficulty: 4, isHome: true },
        ],
        9
      )
    ).toEqual([
      { event: 9, opponent: "AVL", difficulty: 3, isHome: false },
      { event: 10, opponent: "MCI", difficulty: 5, isHome: false },
      { event: 11, opponent: "CHE", difficulty: 4, isHome: true },
    ]);
  });
});
