// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { picksStore } from "@/app/store";
import type { PlayerData } from "@/app/store/utils";
import Player from "./Player";

function makePlayer(overrides: Partial<PlayerData> = {}): PlayerData {
  return {
    id: "1",
    player_id: 1,
    position: 1,
    team_code: 1,
    team_name: "Test FC",
    web_name: "Test Player",
    expected_goal_involvements_per_90: 0,
    total_points: 0,
    element_type: 1,
    fixtures: [],
    selling_price: 50,
    now_value: 50,
    fpl_gameweek_player_stats: {},
    fpl_player_team: {},
    ...overrides,
  };
}

describe("Player component", () => {
  beforeEach(() => {
    picksStore.setState({
      substitutedIn: undefined,
      substitutedOut: undefined,
      transfersOut: { 1: [], 2: [], 3: [], 4: [] },
    });
  });

  it("renders without crashing when the player has no fixture for the current gameweek", () => {
    const data = makePlayer({ fixtures: [] });

    render(<Player data={data} gameweek={5} />);

    expect(screen.getByText("Test Player")).toBeInTheDocument();
  });
});
