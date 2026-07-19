// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { picksStore } from "@/app/store";
import type { PlayerData } from "@/app/store/utils";
import { RemoveAll } from "./remove";

afterEach(cleanup);

function makeFplPlayer(player_id: number, element_type: number) {
  return {
    fpl_player: {
      player_id,
      element_type,
      web_name: `Player ${player_id}`,
      now_value: 50,
      fpl_player_team: { short_name: "TST", home_fixtures: [], away_fixtures: [] },
      fpl_gameweek_player_stats: [],
    },
    position: 1,
    selling_price: 50,
  } as any;
}

function makeSlotPlayer(overrides: Partial<PlayerData> = {}): PlayerData {
  return {
    id: "1",
    player_id: 1,
    position: 1,
    team_code: 1,
    team_name: "Test FC",
    web_name: "Player",
    expected_goal_involvements_per_90: 0,
    total_points: 0,
    element_type: 2,
    fixtures: [],
    selling_price: 50,
    now_value: 50,
    fpl_gameweek_player_stats: {},
    fpl_player_team: {},
    ...overrides,
  } as PlayerData;
}

describe("RemoveAll", () => {
  beforeEach(() => {
    picksStore.setState({
      transferSlots: [],
      activeSlotId: null,
      picks: {
        data: [makeFplPlayer(1, 2), makeFplPlayer(2, 3)],
        overall: { bank: 100 } as any,
      } as any,
    });
  });

  it("marks every squad player out in one action", async () => {
    const user = userEvent.setup();
    render(<RemoveAll />);

    await user.click(screen.getByRole("button"));

    const state = picksStore.getState();
    expect(state.transferSlots).toHaveLength(2);
    expect(state.transferSlots.map((s) => s.out.player_id).sort()).toEqual([
      1, 2,
    ]);
  });

  it("preserves already-filled in-player assignments", async () => {
    const user = userEvent.setup();
    const alreadyFilled = makeSlotPlayer({ player_id: 1, element_type: 2 });
    const replacement = makeSlotPlayer({ player_id: 99, element_type: 2 });
    picksStore.setState({
      transferSlots: [{ id: "1", out: alreadyFilled, in: replacement }],
    });

    render(<RemoveAll />);
    await user.click(screen.getByRole("button"));

    const state = picksStore.getState();
    const slot1 = state.transferSlots.find((s) => s.out.player_id === 1)!;
    expect(slot1.in?.player_id).toBe(99);
  });
});
