import { describe, expect, it } from "vitest";
import {
  applySellingPrices,
  computeSellingPrice,
  latestTransferCostByPlayer,
  priceByPlayer,
} from "./pricing";

describe("computeSellingPrice", () => {
  it("gains half of profit, rounded down", () => {
    expect(computeSellingPrice(60, 63)).toBe(61);
    expect(computeSellingPrice(60, 64)).toBe(62);
  });

  it("returns current price when there is no profit", () => {
    expect(computeSellingPrice(60, 60)).toBe(60);
    expect(computeSellingPrice(60, 55)).toBe(55);
  });

  it("rounds odd profit down (no gain on +1)", () => {
    expect(computeSellingPrice(55, 56)).toBe(55);
  });
});

describe("latestTransferCostByPlayer", () => {
  it("returns the most recent transfer cost per player from a flat batch", () => {
    const result = latestTransferCostByPlayer([
      { in_player_id: "p1", in_player_cost: 50, time: new Date("2026-01-01") },
      { in_player_id: "p1", in_player_cost: 55, time: new Date("2026-03-01") },
      { in_player_id: "p2", in_player_cost: 60, time: new Date("2026-02-01") },
    ]);

    expect(result.get("p1")).toBe(55);
    expect(result.get("p2")).toBe(60);
  });

  it("returns an empty map for no transfers", () => {
    expect(latestTransferCostByPlayer([]).size).toBe(0);
  });
});

describe("priceByPlayer", () => {
  it("maps each player's stat value from a flat batch", () => {
    const result = priceByPlayer([
      { fpl_player_id: "p1", value: 45 },
      { fpl_player_id: "p2", value: 62 },
    ]);

    expect(result.get("p1")).toBe(45);
    expect(result.get("p2")).toBe(62);
  });
});

describe("applySellingPrices", () => {
  it("applies the latest transfer cost and current gameweek value to each pick", () => {
    const picks = [
      { fpl_player: { id: "p1" } },
      { fpl_player: { id: "p2" } },
    ];

    expect(
      applySellingPrices(
        picks,
        [
          { in_player_id: "p1", in_player_cost: 50, time: new Date("2026-01-01") },
          { in_player_id: "p1", in_player_cost: 60, time: new Date("2026-02-01") },
          { in_player_id: "p2", in_player_cost: 55, time: new Date("2026-01-01") },
        ],
        [
          { fpl_player_id: "p1", value: 64 },
          { fpl_player_id: "p2", value: 50 },
        ]
      )
    ).toEqual([
      { fpl_player: { id: "p1" }, selling_price: 62 },
      { fpl_player: { id: "p2" }, selling_price: 50 },
    ]);
  });
});
