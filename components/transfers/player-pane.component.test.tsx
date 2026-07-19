// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { picksStore } from "@/app/store";
import type { PlayerData } from "@/app/store/utils";
import PlayerPane from "./player-pane";

afterEach(cleanup);

function makePlayer(overrides: Partial<PlayerData> = {}): PlayerData {
  return {
    id: "1",
    player_id: 1,
    position: 1,
    team_code: 1,
    team_name: "Test FC",
    web_name: "Out Player",
    expected_goal_involvements_per_90: 0,
    total_points: 0,
    element_type: 2,
    fixtures: [],
    selling_price: 55,
    now_value: 55,
    fpl_gameweek_player_stats: {},
    fpl_player_team: {},
    ...overrides,
  } as PlayerData;
}

describe("PlayerPane", () => {
  beforeEach(() => {
    picksStore.setState({
      transferSlots: [],
      activeSlotId: null,
    });
  });

  it("is closed by default", () => {
    render(
      <PlayerPane>
        <div>players table</div>
      </PlayerPane>
    );

    expect(screen.queryByText("players table")).not.toBeInTheDocument();
  });

  it("opens the manual trigger without showing a Replacing banner", async () => {
    const user = userEvent.setup();
    render(
      <PlayerPane>
        <div>players table</div>
      </PlayerPane>
    );

    await user.click(screen.getByRole("button", { name: "Browse players" }));

    expect(screen.getByText("players table")).toBeInTheDocument();
    expect(screen.queryByText(/Replacing:/)).not.toBeInTheDocument();
  });

  it("opens automatically when activeSlotId is set externally and shows a Replacing banner", () => {
    const outPlayer = makePlayer({ player_id: 9, web_name: "Kane" });
    picksStore.setState({
      transferSlots: [{ id: "9", out: outPlayer, in: null }],
      activeSlotId: "9",
    });

    render(
      <PlayerPane>
        <div>players table</div>
      </PlayerPane>
    );

    expect(screen.getByText("players table")).toBeInTheDocument();
    expect(screen.getByText(/Replacing:/)).toBeInTheDocument();
    expect(screen.getByText("Kane")).toBeInTheDocument();
  });

  it("clears activeSlotId when the sheet is closed", async () => {
    const user = userEvent.setup();
    const outPlayer = makePlayer({ player_id: 9, web_name: "Kane" });
    picksStore.setState({
      transferSlots: [{ id: "9", out: outPlayer, in: null }],
      activeSlotId: "9",
    });

    render(
      <PlayerPane>
        <div>players table</div>
      </PlayerPane>
    );

    await user.keyboard("{Escape}");

    expect(picksStore.getState().activeSlotId).toBeNull();
  });
});
