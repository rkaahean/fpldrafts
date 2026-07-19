import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const playerData = {
  id: "player-1",
  player_id: 42,
  web_name: "Test Player",
  total_points: 88,
};

const history = [
  { gameweek: 1, total_points: 5, value: 55, expected_goals: 0.3, expected_assists: 0.1 },
  { gameweek: 2, total_points: 8, value: 56, expected_goals: 0.5, expected_assists: 0.2 },
];

vi.mock("..", () => ({
  getPlayerData: vi.fn(async () => playerData),
  getPlayerGameweekHistory: vi.fn(async () => history),
}));

import { GET } from "./route";

describe("GET /api/player", () => {
  it("returns both season-total player data and per-gameweek history", async () => {
    const request = new NextRequest("http://localhost/api/player?id=42");

    const response = await GET(request);
    const body = await response.json();

    expect(body.data.player).toEqual(playerData);
    expect(body.data.history).toEqual(history);
  });
});
