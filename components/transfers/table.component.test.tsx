// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { afterEach, describe, expect, it } from "vitest";
import { DataTable } from "./table";

afterEach(cleanup);

type Row = {
  web_name: string;
  now_value: number;
  team_code: number;
  fpl_player_team: { short_name: string };
};

describe("Players data table", () => {
  it("renders the explorer header and a player count in full-page mode", () => {
    const columns: ColumnDef<Row>[] = [
      { accessorKey: "web_name", header: "Name" },
      {
        accessorKey: "now_value",
        header: "Price",
        filterFn: (row, columnId, value) =>
          (row.getValue(columnId) as number) <= value,
      },
      { accessorKey: "team_code", header: "Team" },
    ];

    render(
      <DataTable
        columns={columns}
        data={[
          {
            web_name: "Saka",
            now_value: 100,
            team_code: 1,
            fpl_player_team: { short_name: "ARS" },
          },
        ]}
        name="players"
      />
    );

    expect(screen.getByText("Player explorer")).toBeInTheDocument();
    expect(screen.getByText("1 player")).toBeInTheDocument();
  });
});

interface PositionRow {
  web_name: string;
  element_type: number;
  team_code: number;
  fpl_player_team: { short_name: string };
}

const positionColumns: ColumnDef<PositionRow>[] = [
  { accessorKey: "web_name", header: "Name" },
  {
    accessorKey: "element_type",
    header: "element_type",
    filterFn: "equalsString",
  },
];

const positionData: PositionRow[] = [
  {
    web_name: "Forward Fred",
    element_type: 4,
    team_code: 1,
    fpl_player_team: { short_name: "TST" },
  },
  {
    web_name: "Defender Dan",
    element_type: 2,
    team_code: 1,
    fpl_player_team: { short_name: "TST" },
  },
];

describe("DataTable position scoping", () => {
  it("shows all rows when no external position filter is set", () => {
    render(
      <DataTable
        columns={positionColumns}
        data={positionData}
        name="players"
        showAdvancedFilters={false}
      />
    );

    expect(screen.getByText("Forward Fred")).toBeInTheDocument();
    expect(screen.getByText("Defender Dan")).toBeInTheDocument();
  });

  it("only shows players matching the externally-scoped position", () => {
    render(
      <DataTable
        columns={positionColumns}
        data={positionData}
        name="players"
        showAdvancedFilters={false}
        externalElementTypeFilter={4}
      />
    );

    expect(screen.getByText("Forward Fred")).toBeInTheDocument();
    expect(screen.queryByText("Defender Dan")).not.toBeInTheDocument();
  });

  it("clears the position scope and shows all players again when the filter is set back to null", () => {
    const { rerender } = render(
      <DataTable
        columns={positionColumns}
        data={positionData}
        name="players"
        showAdvancedFilters={false}
        externalElementTypeFilter={4}
      />
    );
    expect(screen.queryByText("Defender Dan")).not.toBeInTheDocument();

    rerender(
      <DataTable
        columns={positionColumns}
        data={positionData}
        name="players"
        showAdvancedFilters={false}
        externalElementTypeFilter={null}
      />
    );

    expect(screen.getByText("Defender Dan")).toBeInTheDocument();
  });
});
