// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it } from "vitest";
import { DataTable } from "./table";

type Row = { name: string };

describe("Drafts data table", () => {
  it("renders a draft-library header and saved-draft count", () => {
    const columns: ColumnDef<Row>[] = [{ accessorKey: "name", header: "Name" }];

    render(
      <DataTable
        columns={columns}
        data={[{ name: "Wildcard plan" }]}
        name="drafts"
        isFilterable={false}
        isPaginated
      />
    );

    expect(screen.getByText("Draft library")).toBeInTheDocument();
    expect(screen.getByText("1 saved draft")).toBeInTheDocument();
  });

  it("filters drafts by name and sorts a sortable column", async () => {
    const user = userEvent.setup();
    const columns: ColumnDef<{ name: string; gameweek: number }>[] = [
      { accessorKey: "name", header: "Draft" },
      { accessorKey: "gameweek", header: "Starts" },
    ];

    const { container } = render(
      <DataTable
        columns={columns}
        data={[
          { name: "Double gameweek", gameweek: 3 },
          { name: "Wildcard route", gameweek: 1 },
        ]}
        name="drafts"
        isFilterable
        isPaginated={false}
        filterColumnId="name"
      />
    );

    await user.type(screen.getByPlaceholderText("Filter drafts..."), "wild");
    expect(screen.getByText("Wildcard route")).toBeInTheDocument();
    expect(screen.queryByText("Double gameweek")).not.toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("Filter drafts..."));
    await user.click(screen.getByRole("button", { name: "Starts" }));
    expect(container.querySelector("tbody tr")).toHaveTextContent("Wildcard route");
  });
});
