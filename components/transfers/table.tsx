"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FPLPlayerData2 } from "@/app/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Cross1Icon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  name: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  name,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "now_value",
      value: 150,
    },
  ]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // onRowSelectionChange: handleRowSelectionChange,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters, sorting },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      priceFilter,
    },
    initialState: {
      pagination: {
        pageSize: 22,
      },
      columnVisibility: {
        element_type: false,
        team_code: false,
      },
    },
  });

  const teamCodeToShortName = data.reduce((acc, team: any) => {
    acc[team.team_code] = team.fpl_player_team.short_name;
    return acc;
  }, {} as Record<number, string>);

  return (
    <div className="flex flex-col rounded-sm h-full justify-between bg-bgsecondary">
      <div className="flex flex-col gap-1 2xl:gap-3 bg-background overflow-scroll">
        <div className="flex items-center mb-1 justify-between">
          <Input
            placeholder={`Filter ${name}...`}
            value={
              (table.getColumn("web_name")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("web_name")?.setFilterValue(event.target.value)
            }
            className="w-1/2 max-w-sm"
          />
          <ToggleGroup
            type="single"
            onValueChange={(value) => {
              const column = table.getColumn("element_type")!;
              column.setFilterValue(null);

              if (value) {
                column.setFilterValue(value);
              }
            }}
          >
            <ToggleGroupItem value="1">GK</ToggleGroupItem>
            <ToggleGroupItem value="2">DEF</ToggleGroupItem>
            <ToggleGroupItem value="3">MID</ToggleGroupItem>
            <ToggleGroupItem value="4">FWD</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-row w-full gap-4">
          <div className="pb-3 w-1/2">
            <div className="flex flex-row justify-between mb-2 2xl:mb-3">
              <Label>Max Price</Label>
              <div className="text-xs 2xl:text-base">
                {`£${
                  (table.getColumn("now_value")?.getFilterValue() as number) /
                  10
                }`}
              </div>
            </div>
            <Slider
              defaultValue={[150]}
              max={155}
              min={35}
              step={5}
              onValueChange={(value) =>
                table.getColumn("now_value")?.setFilterValue(value[0])
              }
            />
          </div>

          <div className="flex-grow pr-2 ring-0">
            <Select
              onValueChange={(e) =>
                table.getColumn("team_code")!.setFilterValue(e)
              }
              value={table.getColumn("team_code")?.getFilterValue()! as string}
            >
              <div className="flex flex-row gap-2">
                <SelectTrigger>
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <button
                  onClick={() =>
                    table.getColumn("team_code")!.setFilterValue("EMPTY_FILTER")
                  }
                >
                  <Cross1Icon className="w-4 h-4 2xl:w-6 2xl:h-6" />
                </button>
              </div>

              <SelectContent>
                {Object.entries(teamCodeToShortName).map(
                  ([code, name], index) => {
                    return (
                      <SelectItem
                        value={code}
                        className="flex flex-row w-full"
                        key={index}
                      >
                        <div className="flex flex-row w-full gap-2 lg:gap-4 items-center">
                          <div className="w-4 h-4 lg:w-6 lg:h-6">
                            <Image
                              src={`https://resources.premierleague.com/premierleague/badges/t${code}.png`}
                              alt="crest"
                              width={20}
                              height={20}
                              priority
                            />
                          </div>
                          <div>{name}</div>
                        </div>
                      </SelectItem>
                    );
                  }
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-bgsecondary rounded-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      const isSelected = row.getIsSelected();
                      row.toggleSelected(!isSelected);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-around space-x-2 py-2">
        <Button
          variant="secondary"
          size="xs"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <div className="text-xs">{`${
          table.getState().pagination.pageIndex + 1
        }  / ${table.getPageCount()}`}</div>
        <Button
          variant="secondary"
          size="xs"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export interface DataType extends FPLPlayerData2 {
  is_in_team: boolean;
}
export const priceFilter: FilterFn<DataType> = (row, columnId, value) => {
  const rowValue = row.getValue(columnId) as number;
  return rowValue <= value;
};

export const teamFilter: FilterFn<DataType> = (row, columnId, value) => {
  if (value == "EMPTY_FILTER" || !value) {
    return true;
  }
  const rowValue = row.getValue(columnId) as string;
  return rowValue == value;
};
