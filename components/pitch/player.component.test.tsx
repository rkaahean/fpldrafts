// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { picksStore } from "@/app/store";
import type { PlayerData } from "@/app/store/utils";
import Player from "./Player";

afterEach(cleanup);

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

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
    selling_price: 55,
    now_value: 55,
    fpl_gameweek_player_stats: {},
    fpl_player_team: {},
    form: 4.2,
    status: "a",
    news: "",
    clean_sheets: 0,
    bonus: 0,
    bps: 0,
    defensive_contribution: 0,
    chance_of_playing_next_round: null,
    ...overrides,
  };
}

describe("Player component", () => {
  beforeEach(() => {
    picksStore.setState({
      substitutedIn: undefined,
      substitutedOut: undefined,
      transferSlots: [],
      activeSlotId: null,
      picks: { data: [], overall: { bank: 100 } as any } as any,
    });
  });

  it("renders without crashing when the player has no fixture for the current gameweek", () => {
    const data = makePlayer({ fixtures: [] });

    renderWithClient(<Player data={data} gameweek={5} />);

    expect(screen.getByText("Test Player")).toBeInTheDocument();
  });

  it("shows price and total points at a glance", () => {
    const data = makePlayer({ selling_price: 65, total_points: 88 });

    renderWithClient(<Player data={data} gameweek={5} />);

    expect(screen.getByText("£6.5")).toBeInTheDocument();
    expect(screen.getByText("88")).toBeInTheDocument();
  });

  it("shows an injury/availability indicator when the player is not fully available", () => {
    const data = makePlayer({ status: "d", news: "Knock - 75% chance" });

    renderWithClient(<Player data={data} gameweek={5} />);

    expect(screen.getByLabelText("Availability concern")).toBeInTheDocument();
  });

  it("does not show an availability indicator for a fully available player", () => {
    const data = makePlayer({ status: "a" });

    renderWithClient(<Player data={data} gameweek={5} />);

    expect(
      screen.queryByLabelText("Availability concern")
    ).not.toBeInTheDocument();
  });

  it("opens the detail sheet when the card body is tapped", async () => {
    const user = userEvent.setup();
    const data = makePlayer();

    renderWithClient(<Player data={data} gameweek={5} />);

    expect(screen.queryByText("Total points")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "View player details" }));

    expect(screen.getByText("Total points")).toBeInTheDocument();
  });

  it("does not open the detail sheet when an action icon is clicked", async () => {
    const user = userEvent.setup();
    const data = makePlayer();

    renderWithClient(<Player data={data} gameweek={5} />);

    await user.click(screen.getByRole("button", { name: "Substitute player" }));

    expect(screen.queryByText("Total points")).not.toBeInTheDocument();
  });

  it("clicking the remove button marks the player out and sets it as the active transfer slot", async () => {
    const user = userEvent.setup();
    const data = makePlayer({ player_id: 7, element_type: 2, selling_price: 45 });

    renderWithClient(<Player data={data} gameweek={5} />);
    await user.click(screen.getByRole("button", { name: "Remove player" }));

    const state = picksStore.getState();
    expect(state.transferSlots).toHaveLength(1);
    expect(state.transferSlots[0].out.player_id).toBe(7);
    expect(state.activeSlotId).toBe(state.transferSlots[0].id);
  });

  it("shows a Replace badge and reduced opacity once a player is marked out, with no flat grey background", async () => {
    const user = userEvent.setup();
    const data = makePlayer({ player_id: 7 });

    renderWithClient(<Player data={data} gameweek={5} />);
    await user.click(screen.getByRole("button", { name: "Remove player" }));

    expect(
      screen.getByRole("button", { name: "Choose replacement" })
    ).toBeInTheDocument();
    expect(screen.getByText("Replace")).toBeInTheDocument();
  });

  it("clicking the remove button again un-marks the player and removes the badge", async () => {
    const user = userEvent.setup();
    const data = makePlayer({ player_id: 7 });

    renderWithClient(<Player data={data} gameweek={5} />);
    const removeButton = screen.getByRole("button", { name: "Remove player" });
    await user.click(removeButton);
    await user.click(removeButton);

    expect(picksStore.getState().transferSlots).toHaveLength(0);
    expect(
      screen.queryByRole("button", { name: "Choose replacement" })
    ).not.toBeInTheDocument();
  });

  it("clicking the badge on an already out-marked, unfilled slot re-sets the active slot", async () => {
    const user = userEvent.setup();
    const data = makePlayer({ player_id: 7 });

    renderWithClient(<Player data={data} gameweek={5} />);
    await user.click(screen.getByRole("button", { name: "Remove player" }));
    picksStore.setState({ activeSlotId: null });

    await user.click(screen.getByRole("button", { name: "Choose replacement" }));

    expect(picksStore.getState().activeSlotId).not.toBeNull();
  });

  it("shows the assigned in-player's name on the badge once the slot is filled", () => {
    const data = makePlayer({ player_id: 7, element_type: 2 });
    const inPlayer = makePlayer({
      player_id: 99,
      web_name: "Replacement Guy",
      element_type: 2,
    });
    picksStore.setState({
      transferSlots: [{ id: "7", out: data, in: inPlayer }],
      activeSlotId: null,
    });

    renderWithClient(<Player data={data} gameweek={5} />);

    expect(screen.getByText(/Replacement Guy/)).toBeInTheDocument();
  });
});
