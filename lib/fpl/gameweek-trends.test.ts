import { describe, expect, it } from "vitest";
import {
  rollingAverage,
  selectTrendHistory,
  type GameweekTrendPoint,
} from "./gameweek-trends";

const history = Array.from({ length: 10 }, (_, index) => ({
  gameweek: index + 1,
  points: (index + 1) * 10,
  total_points: (index + 1) * 10,
  overall_rank: index === 4 ? null : 1_000_000 - index * 10_000,
  value: 1000,
  bank: 10,
  event_transfers: 0,
  event_transfers_cost: 0,
})) satisfies GameweekTrendPoint[];

describe("gameweek trends", () => {
  it("sorts history and returns the latest eight gameweeks for the recent range", () => {
    expect(selectTrendHistory([...history].reverse(), "recent").map(({ gameweek }) => gameweek)).toEqual([
      3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it("keeps the entire completed season when requested", () => {
    expect(selectTrendHistory(history, "season")).toHaveLength(10);
  });

  it("calculates a partial rolling average at the start of the season", () => {
    expect(rollingAverage(history.slice(0, 6))).toEqual([10, 15, 20, 25, 30, 40]);
  });
});
