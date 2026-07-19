import { describe, expect, it } from "vitest";
import { computeRollingXgTrend, rollingAverage } from "./player-history";

describe("rollingAverage", () => {
  it("averages over the trailing window once enough data exists", () => {
    const result = rollingAverage([1, 2, 3, 4, 5, 6], 3);
    expect(result[5]).toBeCloseTo((4 + 5 + 6) / 3);
  });

  it("averages over whatever is available when the window is larger than the data", () => {
    const result = rollingAverage([2, 4], 5);
    expect(result[0]).toBe(2);
    expect(result[1]).toBe(3);
  });

  it("returns the value itself for a single point", () => {
    expect(rollingAverage([7], 5)).toEqual([7]);
  });

  it("returns an empty array for empty input", () => {
    expect(rollingAverage([], 5)).toEqual([]);
  });
});

describe("computeRollingXgTrend", () => {
  it("combines rolling xG and xA into xGI per gameweek", () => {
    const history = [
      { gameweek: 1, total_points: 5, value: 55, expected_goals: 0.2, expected_assists: 0.1 },
      { gameweek: 2, total_points: 8, value: 56, expected_goals: 0.4, expected_assists: 0.3 },
    ];

    const trend = computeRollingXgTrend(history, 2);

    expect(trend[0].gameweek).toBe(1);
    expect(trend[0].xg).toBeCloseTo(0.2);
    expect(trend[0].xa).toBeCloseTo(0.1);
    expect(trend[0].xgi).toBeCloseTo(0.3);
    expect(trend[1].xg).toBeCloseTo((0.2 + 0.4) / 2);
    expect(trend[1].xa).toBeCloseTo((0.1 + 0.3) / 2);
    expect(trend[1].xgi).toBeCloseTo(trend[1].xg + trend[1].xa);
  });

  it("preserves gameweek ordering", () => {
    const history = [
      { gameweek: 3, total_points: 1, value: 50, expected_goals: 0, expected_assists: 0 },
      { gameweek: 4, total_points: 2, value: 51, expected_goals: 0.1, expected_assists: 0 },
    ];

    const trend = computeRollingXgTrend(history);

    expect(trend.map((point) => point.gameweek)).toEqual([3, 4]);
  });
});
