// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  columns,
  miniColumns,
  MetricHeader,
  PlayerIdentity,
} from "./columns";
import { playerColumnClassName } from "./table";

describe("PlayerIdentity", () => {
  it("presents a player name with team context for a scannable table row", () => {
    render(<PlayerIdentity name="Haaland" team="MCI" />);

    expect(screen.getByText("Haaland")).toBeInTheDocument();
    expect(screen.getByText("MCI")).toBeInTheDocument();
    expect(screen.getByTestId("player-identity")).toHaveClass("min-h-8");
  });
});

describe("Player columns", () => {
  it("prioritizes form and upcoming fixtures in the default player view", () => {
    const headers = columns.map((column) => column.header);

    expect(headers).toContain("Form");
    expect(headers).toContain("Upcoming");
  });

  it("keeps the quick selector focused on transfer decisions", () => {
    const columnIds = miniColumns.map((column) =>
      "accessorKey" in column ? column.accessorKey : column.id
    );

    expect(columnIds).toContain("web_name");
    expect(columnIds).toContain("fixtures");
    expect(columnIds).toContain("expected_goal_involvements_per_90");
    expect(columnIds).toContain("player_add");
    expect(columnIds).toContain("team_crest");
    expect(columnIds).not.toContain("expected_goals");
    expect(columnIds).not.toContain("expected_assists");
  });

  it("adds desktop comparison metrics with understandable abbreviated headers", () => {
    const accessorKeys = columns.map((column) =>
      "accessorKey" in column ? column.accessorKey : undefined
    );

    expect(accessorKeys).toContain("expected_goal_involvements");
    expect(accessorKeys).toContain("expected_goals");
    expect(accessorKeys).toContain("expected_assists");
    expect(accessorKeys).toContain("clean_sheets");
    expect(accessorKeys).toContain("saves");
    expect(accessorKeys).toContain("bonus");
    expect(accessorKeys).toContain("bps");
    expect(accessorKeys).toContain("defensive_contribution");

    render(
      <>
        <MetricHeader label="G+A" description="Goals and assists" />
        <MetricHeader label="xGI" description="Expected goal involvements" />
        <MetricHeader label="xG" description="Expected goals" />
        <MetricHeader label="xA" description="Expected assists" />
        <MetricHeader label="xG/90" description="Expected goals per 90 minutes" />
        <MetricHeader label="xA/90" description="Expected assists per 90 minutes" />
        <MetricHeader label="DefCon" description="Defensive contributions" />
      </>
    );

    expect(screen.getByTitle("Goals and assists")).toHaveTextContent("G+A");
    expect(screen.getByTitle("Expected goal involvements")).toHaveTextContent(
      "xGI"
    );
    expect(screen.getByTitle("Expected goals")).toHaveTextContent("xG");
    expect(screen.getByTitle("Expected assists")).toHaveTextContent("xA");
    expect(screen.getByTitle("Expected goals per 90 minutes")).toHaveTextContent(
      "xG/90"
    );
    expect(screen.getByTitle("Expected assists per 90 minutes")).toHaveTextContent(
      "xA/90"
    );
    expect(screen.getByTitle("Defensive contributions")).toHaveTextContent(
      "DefCon"
    );
  });

  it("keeps comparison-only metrics out of constrained table layouts", () => {
    expect(playerColumnClassName("goal_contributions")).toContain(
      "hidden lg:table-cell"
    );
    expect(playerColumnClassName("expected_goals_per_90")).toContain(
      "hidden lg:table-cell"
    );
    expect(playerColumnClassName("expected_assists_per_90")).toContain(
      "hidden lg:table-cell"
    );
    expect(playerColumnClassName("defensive_contribution")).toContain(
      "hidden lg:table-cell"
    );
  });
});
