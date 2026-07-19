import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const history = [
  {
    gameweek: 1,
    points: 55,
    total_points: 55,
    overall_rank: 500_000,
    value: 1000,
    bank: 20,
    event_transfers: 1,
    event_transfers_cost: 0,
  },
];

vi.mock("@/auth/main", () => ({
  auth: vi.fn(async () => ({ team_id: "team-1" })),
}));

vi.mock("@/lib/fpl/pricing", () => ({
  applySellingPrices: vi.fn((data: unknown) => data),
}));

vi.mock("..", () => ({
  getGameweekBaseData: vi.fn(async () => ({
    overall: { value: 1000, bank: 20, points: 55, total_points: 55, overall_rank: 500_000 },
    data: [],
    transferCount: 1,
    transfers: [],
    transferActivity: [],
    activeChip: "wildcard",
    priceStats: [],
    history,
  })),
  getPlayerDataBySeason: vi.fn(),
}));

import { GET } from "./route";

describe("GET /api/gameweek", () => {
  it("includes completed gameweek history for the trend charts", async () => {
    const request = new NextRequest("http://localhost/api/gameweek?gameweek=2", {
      headers: { authorization: "Bearer test-token" },
    });

    const response = await GET(request);
    const body = await response.json();

    expect(body.history).toEqual(history);
  });

  it("includes the active chip for the gameweek", async () => {
    const request = new NextRequest("http://localhost/api/gameweek?gameweek=2", {
      headers: { authorization: "Bearer test-token" },
    });

    const response = await GET(request);
    const body = await response.json();

    expect(body.activeChip).toBe("wildcard");
  });
});
