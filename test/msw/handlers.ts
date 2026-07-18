import type { FPLGameweekPicksData } from "@/app/api";
import { http, HttpResponse } from "msw";

function buildSquad(): FPLGameweekPicksData {
  const data: FPLGameweekPicksData["data"] = [];
  let position = 1;
  const add = (element_type: number, n: number) => {
    for (let i = 0; i < n; i++) {
      data.push({
        position: position++,
        selling_price: 50,
        fpl_player: {
          player_id: 1000 + data.length,
          element_type,
          team_code: (data.length % 15) + 1,
          web_name: `Player${data.length}`,
          now_value: 50,
          total_points: 0,
          expected_goal_involvements_per_90: 0,
          fpl_player_team: {
            short_name: "TST",
            home_fixtures: [
              {
                id: `fx-${data.length}`,
                event: 2,
                team_h_difficulty: 3,
                team_a_difficulty: 3,
                fpl_team_a: { short_name: "OPP" },
              },
            ],
            away_fixtures: [],
          },
          fpl_gameweek_player_stats: [],
        },
      } as unknown as FPLGameweekPicksData["data"][number]);
    }
  };
  add(1, 2);
  add(2, 5);
  add(3, 5);
  add(4, 3);
  return {
    data,
    overall: {
      bank: 25,
      points: 0,
      overall_rank: 1000,
    } as FPLGameweekPicksData["overall"],
    transfers: [],
  };
}

export const gameweekPayload = buildSquad();

export const handlers = [
  http.get("/api/gameweek", () => HttpResponse.json(gameweekPayload)),
];
