// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { picksStore } from "@/app/store";
import type { PlayerData } from "@/app/store/utils";
import {
  columns,
  miniColumns,
  MetricHeader,
  PlayerIdentity,
} from "./columns";
import { playerColumnClassName } from "./table";
import { flexRender } from "@tanstack/react-table";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { PlayerDrawerCloseProvider } from "./player-drawer-context";

afterEach(cleanup);

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

function makePlayerData(overrides: Partial<PlayerData> = {}): PlayerData {
  return {
    id: "1",
    player_id: 1,
    position: 1,
    team_code: 1,
    team_name: "Test FC",
    web_name: "Row Player",
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

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    player_id: 1,
    element_type: 2,
    now_value: 55,
    web_name: "Row Player",
    is_in_team: false,
    total_points: 0,
    expected_goal_involvements_per_90: 0,
    fpl_gameweek_player_stats: [],
    fpl_player_team: {
      short_name: "TST",
      home_fixtures: [],
      away_fixtures: [],
    },
    team_code: 1,
    ...overrides,
  };
}

function AddCellHarness({
  row,
  onClose,
}: {
  row: Record<string, unknown>;
  onClose?: () => void;
}) {
  const table = useReactTable<any>({
    data: [row],
    columns: [miniColumns.find((c) => c.id === "player_add")!],
    getCoreRowModel: getCoreRowModel(),
  });
  const tableRow = table.getRowModel().rows[0];
  const cell = tableRow.getVisibleCells()[0];

  return (
    <PlayerDrawerCloseProvider value={onClose ?? (() => {})}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </PlayerDrawerCloseProvider>
  );
}

describe("player_add column (Add button)", () => {
  beforeEach(() => {
    picksStore.setState({
      transferSlots: [],
      activeSlotId: null,
      picks: { data: [], overall: { bank: 100 } as any } as any,
      drafts: { changes: [] },
      currentGameweek: 1,
    });
  });

  it("fills the active slot and closes the drawer when Add is clicked", async () => {
    const user = userEvent.setup();
    const outPlayer = makePlayerData({ player_id: 9, element_type: 2 });
    picksStore.setState({
      transferSlots: [{ id: "9", out: outPlayer, in: null }],
      activeSlotId: "9",
    });
    let closed = false;

    render(
      <AddCellHarness
        row={makeRow({ player_id: 42, element_type: 2 })}
        onClose={() => {
          closed = true;
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: "Add" }));

    const state = picksStore.getState();
    const committed = state.drafts.changes.find(
      (change) => change.out.data.player_id === 9
    );
    expect(committed?.in.data.player_id).toBe(42);
    expect(state.transferSlots.find((s) => s.id === "9")).toBeUndefined();
    expect(closed).toBe(true);
  });

  it("is disabled when there is no active transfer slot", () => {
    render(<AddCellHarness row={makeRow()} />);

    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("toggles the in-player off when Add is clicked again on the selected row", async () => {
    const user = userEvent.setup();
    const outPlayer = makePlayerData({ player_id: 9, element_type: 2 });
    const inPlayer = makePlayerData({ player_id: 42, element_type: 2 });
    picksStore.setState({
      transferSlots: [{ id: "9", out: outPlayer, in: inPlayer }],
      activeSlotId: "9",
    });

    render(<AddCellHarness row={makeRow({ player_id: 42, element_type: 2 })} />);

    await user.click(screen.getByRole("button", { name: "Add" }));

    const slot = picksStore
      .getState()
      .transferSlots.find((s) => s.id === "9")!;
    expect(slot.in).toBeNull();
  });

  it("does not leak selection state between two rows of the same position", async () => {
    const user = userEvent.setup();
    const outPlayer = makePlayerData({ player_id: 9, element_type: 2 });
    picksStore.setState({
      transferSlots: [{ id: "9", out: outPlayer, in: null }],
      activeSlotId: "9",
    });

    const { unmount } = render(
      <AddCellHarness row={makeRow({ player_id: 42, element_type: 2 })} />
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    unmount();

    render(<AddCellHarness row={makeRow({ player_id: 43, element_type: 2 })} />);
    expect(screen.getByRole("button", { name: "Add" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Add" })).toHaveTextContent("Add");
  });
});
