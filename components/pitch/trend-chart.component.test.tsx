// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TrendChart from "./trend-chart";

vi.mock("react-chartjs-2", () => ({
  Line: ({ data }: { data: { labels: string[] } }) => (
    <div data-testid="line-chart">{data.labels.join(",")}</div>
  ),
}));

const history = Array.from({ length: 9 }, (_, index) => ({
  gameweek: index + 1,
  points: 40 + index,
  total_points: 40 * (index + 1),
  overall_rank: 1_000_000 - index * 10_000,
  value: 1000,
  bank: 10,
  event_transfers: 0,
  event_transfers_cost: 0,
}));

describe("TrendChart", () => {
  it("shows the latest eight gameweeks by default and the full season on request", async () => {
    const user = userEvent.setup();
    render(<TrendChart kind="value" history={history} />);

    expect(screen.getByRole("region", { name: "Team value" })).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toHaveTextContent("GW 2");
    expect(screen.getByTestId("line-chart")).not.toHaveTextContent("GW 1");

    await user.click(screen.getByRole("button", { name: "Season" }));

    expect(screen.getByTestId("line-chart")).toHaveTextContent("GW 1");
  });

  it("explains an empty trend history", () => {
    render(<TrendChart kind="rank" history={[]} />);

    expect(screen.getByText(/after your first completed gameweek/i)).toBeInTheDocument();
  });
});
