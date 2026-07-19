// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlayerData } from "@/app/store/utils";
import { server } from "@/test/msw/server";
import PlayerDetailSheet from "./player-detail-sheet";

vi.mock("react-chartjs-2", () => ({
  Line: ({
    data,
  }: {
    data: { labels: string[]; datasets: { label: string; data: number[] }[] };
  }) => (
    <div data-testid="line-chart" data-labels={data.labels.join("|")}>
      {data.datasets
        .map((dataset) => `${dataset.label}:${dataset.data.join("|")}`)
        .join(",")}
    </div>
  ),
}));

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
    expected_goal_involvements_per_90: 0.35,
    total_points: 88,
    element_type: 3,
    fixtures: [],
    selling_price: 65,
    now_value: 65,
    fpl_gameweek_player_stats: {},
    fpl_player_team: {},
    form: 4.2,
    status: "a",
    news: "",
    clean_sheets: 3,
    bonus: 9,
    bps: 412,
    defensive_contribution: 5,
    chance_of_playing_next_round: null,
    ...overrides,
  };
}

describe("PlayerDetailSheet", () => {
  it("shows the detailed stat grid on the Stats tab by default", () => {
    const data = makePlayer();

    renderWithClient(
      <PlayerDetailSheet
        data={data}
        gameweek={5}
        open
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText("Test Player")).toBeInTheDocument();
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("412")).toBeInTheDocument();
  });

  it("shows the news banner when the player is not fully available", () => {
    const data = makePlayer({
      status: "d",
      news: "Knock - 75% chance of playing",
    });

    renderWithClient(
      <PlayerDetailSheet
        data={data}
        gameweek={5}
        open
        onOpenChange={() => {}}
      />
    );

    expect(
      screen.getByText("Knock - 75% chance of playing")
    ).toBeInTheDocument();
  });

  it("does not show a news banner for a fully available player", () => {
    const data = makePlayer({ status: "a", news: "" });

    renderWithClient(
      <PlayerDetailSheet
        data={data}
        gameweek={5}
        open
        onOpenChange={() => {}}
      />
    );

    expect(screen.queryByText(/chance of playing/)).not.toBeInTheDocument();
  });

  it("fetches gameweek history only once the sheet is open, and shows it on the Trend tab", async () => {
    const user = userEvent.setup();
    let fetchCount = 0;
    server.use(
      http.get("/api/player", () => {
        fetchCount++;
        return HttpResponse.json({
          data: {
            player: makePlayer(),
            history: [
              { gameweek: 1, total_points: 5, value: 55, expected_goals: 0.2, expected_assists: 0.1 },
              { gameweek: 2, total_points: 8, value: 56, expected_goals: 0.4, expected_assists: 0.2 },
            ],
          },
        });
      })
    );
    const data = makePlayer();

    renderWithClient(
      <PlayerDetailSheet
        data={data}
        gameweek={5}
        open
        onOpenChange={() => {}}
      />
    );

    expect(fetchCount).toBe(0);

    await user.click(screen.getByRole("button", { name: "Trend" }));

    await waitFor(() => expect(fetchCount).toBeGreaterThan(0));
    await waitFor(() =>
      expect(screen.getByTestId("line-chart")).toHaveTextContent(
        /xG \(rolling\).*xA \(rolling\).*xGI \(rolling\)/
      )
    );
  });

  it("switches between Last 3 / Last 5 / Season rolling windows", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("/api/player", () =>
        HttpResponse.json({
          data: {
            player: makePlayer(),
            history: [
              { gameweek: 1, total_points: 2, value: 55, expected_goals: 0.1, expected_assists: 0 },
              { gameweek: 2, total_points: 4, value: 55, expected_goals: 0.3, expected_assists: 0 },
              { gameweek: 3, total_points: 6, value: 55, expected_goals: 0.5, expected_assists: 0 },
              { gameweek: 4, total_points: 8, value: 55, expected_goals: 0.7, expected_assists: 0 },
              { gameweek: 5, total_points: 10, value: 55, expected_goals: 0.9, expected_assists: 0 },
            ],
          },
        })
      )
    );
    const data = makePlayer();

    renderWithClient(
      <PlayerDetailSheet
        data={data}
        gameweek={6}
        open
        onOpenChange={() => {}}
      />
    );

    await user.click(screen.getByRole("button", { name: "Trend" }));
    await waitFor(() =>
      expect(screen.getByTestId("line-chart")).toHaveTextContent("xG (rolling)")
    );

    expect(
      screen.getByTestId("line-chart").getAttribute("data-labels")!.split("|")
    ).toHaveLength(5);
    const last5xg = screen.getByTestId("line-chart").textContent!.match(/xG \(rolling\):([^,]+)/)![1];

    await user.click(screen.getByRole("button", { name: "Last 3" }));
    expect(
      screen.getByTestId("line-chart").getAttribute("data-labels")!.split("|")
    ).toHaveLength(3);
    const last3xg = screen.getByTestId("line-chart").textContent!.match(/xG \(rolling\):([^,]+)/)![1];
    expect(last3xg).not.toBe(last5xg);

    await user.click(screen.getByRole("button", { name: "Season" }));
    expect(
      screen.getByTestId("line-chart").getAttribute("data-labels")!.split("|")
    ).toHaveLength(5);
    const seasonXg = screen.getByTestId("line-chart").textContent!.match(/xG \(rolling\):([^,]+)/)![1];
    expect(seasonXg).not.toBe(last3xg);

    const seasonPoints = seasonXg.split("|");
    expect(seasonPoints[seasonPoints.length - 1]).toBe(
      String((0.1 + 0.3 + 0.5 + 0.7 + 0.9) / 5)
    );
  });

  it("shows goalkeeper-specific stats and hides outfield-only stats", () => {
    const data = makePlayer({
      element_type: 1,
      saves: 84,
      expected_goals_per_90: 0.02,
      goals_conceded: 33,
    });

    renderWithClient(
      <PlayerDetailSheet
        data={data}
        gameweek={5}
        open
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText("Saves")).toBeInTheDocument();
    expect(screen.getByText("84")).toBeInTheDocument();
    expect(screen.getByText("Saves / 90")).toBeInTheDocument();
    expect(screen.getByText("Goals conceded")).toBeInTheDocument();
    expect(screen.queryByText("Threat")).not.toBeInTheDocument();
    expect(screen.queryByText("xG conceded")).not.toBeInTheDocument();
  });

  it("shows defender-specific stats and hides goalkeeper-only stats", () => {
    const data = makePlayer({
      element_type: 2,
      expected_goals_conceded: 1.4,
      expected_assists: 0.6,
      expected_assists_per_90: 0.08,
    });

    renderWithClient(
      <PlayerDetailSheet
        data={data}
        gameweek={5}
        open
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText("xG conceded")).toBeInTheDocument();
    expect(screen.getByText("xGI")).toBeInTheDocument();
    expect(screen.getByText("xA")).toBeInTheDocument();
    expect(screen.getByText("xA / 90")).toBeInTheDocument();
    expect(screen.getByText("Defensive contribution")).toBeInTheDocument();
    expect(screen.queryByText("Saves")).not.toBeInTheDocument();
  });

  it("shows midfielder-specific stats blending defensive and attacking", () => {
    const data = makePlayer({
      element_type: 3,
      expected_goals: 0.4,
      expected_goals_per_90: 0.05,
    });

    renderWithClient(
      <PlayerDetailSheet
        data={data}
        gameweek={5}
        open
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText("Defensive contribution")).toBeInTheDocument();
    expect(screen.getByText("Clean sheets")).toBeInTheDocument();
    expect(screen.getByText("xG")).toBeInTheDocument();
    expect(screen.getByText("xA")).toBeInTheDocument();
    expect(screen.getByText("xGI")).toBeInTheDocument();
    expect(screen.getByText("xG / 90")).toBeInTheDocument();
    expect(screen.getByText("xA / 90")).toBeInTheDocument();
    expect(screen.queryByText("Saves")).not.toBeInTheDocument();
  });

  it("shows purely attacking stats for forwards", () => {
    const data = makePlayer({
      element_type: 4,
      expected_goals: 0.7,
      expected_assists: 0.2,
    });

    renderWithClient(
      <PlayerDetailSheet
        data={data}
        gameweek={5}
        open
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText("xG")).toBeInTheDocument();
    expect(screen.getByText("xA")).toBeInTheDocument();
    expect(screen.getByText("xGI")).toBeInTheDocument();
    expect(screen.getByText("xG / 90")).toBeInTheDocument();
    expect(screen.getByText("xA / 90")).toBeInTheDocument();
    expect(screen.queryByText("Defensive contribution")).not.toBeInTheDocument();
    expect(screen.queryByText("Saves")).not.toBeInTheDocument();
  });

  it("does not fetch history while the sheet is closed", () => {
    let fetchCount = 0;
    server.use(
      http.get("/api/player", () => {
        fetchCount++;
        return HttpResponse.json({ data: { player: makePlayer(), history: [] } });
      })
    );
    const data = makePlayer();

    renderWithClient(
      <PlayerDetailSheet
        data={data}
        gameweek={5}
        open={false}
        onOpenChange={() => {}}
      />
    );

    expect(fetchCount).toBe(0);
  });
});
