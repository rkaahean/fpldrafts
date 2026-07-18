import { describe, expect, it } from "vitest";
import { fixtureGameweeks, fixtureRunSummaries } from "./fixtures";

describe("fixtureGameweeks", () => {
  it("returns a five-gameweek planning window and shortens it at season end", () => {
    expect(fixtureGameweeks(12)).toEqual([12, 13, 14, 15, 16]);
    expect(fixtureGameweeks(37)).toEqual([37, 38]);
  });
});

describe("fixtureRunSummaries", () => {
  it("identifies the easiest and hardest displayed fixture runs", () => {
    const summaries = fixtureRunSummaries(
      [
        {
          team_id: "easy",
          full_name: "Easy FC",
          fixtures: [
            { event: 10, difficulty: 1 },
            { event: 11, difficulty: 2 },
          ],
        },
        {
          team_id: "hard",
          full_name: "Hard FC",
          fixtures: [
            { event: 10, difficulty: 5 },
            { event: 11, difficulty: 4 },
          ],
        },
      ],
      [10, 11]
    );

    expect(summaries.easiest?.full_name).toBe("Easy FC");
    expect(summaries.easiest?.averageDifficulty).toBe(1.5);
    expect(summaries.hardest?.full_name).toBe("Hard FC");
    expect(summaries.hardest?.averageDifficulty).toBe(4.5);
  });
});
