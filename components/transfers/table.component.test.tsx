// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it } from "vitest";
import { DataTable } from "./table";

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
