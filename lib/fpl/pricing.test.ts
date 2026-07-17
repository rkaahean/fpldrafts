import { describe, expect, it } from "vitest";
import { computeSellingPrice } from "./pricing";

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
