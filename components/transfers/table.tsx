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
import { playerPageSize } from "@/lib/fpl/player-insights";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, X } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export function playerColumnClassName(columnId: string) {
  switch (columnId) {
    case "team_crest":
      return "w-12 !max-w-none lg:w-[3%]";
    case "web_name":
      return "w-40 min-w-32 !max-w-none lg:w-[12%] lg:min-w-0";
    case "now_value":
    case "total_points":
      return "w-14 !max-w-none lg:w-[5%]";
    case "form":
      return "w-16 !max-w-none lg:w-[6%]";
    case "fixtures":
      return "w-36 !max-w-none lg:w-[12%]";
    case "expected_goal_involvements_per_90":
    case "minutes":
      return "w-16 !max-w-none hidden sm:table-cell lg:w-[6%]";
    case "goal_contributions":
    case "expected_goals_per_90":
    case "expected_assists_per_90":
    case "expected_goal_involvements":
    case "expected_goals":
    case "expected_assists":
    case "clean_sheets":
    case "saves":
    case "bonus":
    case "bps":
    case "defensive_contribution":
      return "w-16 !max-w-none hidden lg:table-cell lg:w-[5%]";
    case "player_add":
      return "w-20 !max-w-none lg:w-[6%]";
    default:
      return "";
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  name: string;
  showAdvancedFilters?: boolean;
  fillContainer?: boolean;
  compact?: boolean;
  externalElementTypeFilter?: number | null;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  name,
  showAdvancedFilters = true,
  fillContainer = true,
  compact = false,
  externalElementTypeFilter,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "now_value",
      value: 150,
    },
  ]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const tableViewportRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [highlightedRowIndex, setHighlightedRowIndex] = useState(0);

  useEffect(() => {
    if (!fillContainer || typeof ResizeObserver === "undefined") {
      return;
    }

    const viewport = tableViewportRef.current;
    if (!viewport) {
      return;
    }

    const updatePageSize = () => {
      const nextPageSize = playerPageSize(viewport.clientHeight - 34);
      setPagination((current) =>
        current.pageSize === nextPageSize
          ? current
          : { pageIndex: 0, pageSize: nextPageSize }
      );
    };

    updatePageSize();
    const observer = new ResizeObserver(updatePageSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [fillContainer]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // onRowSelectionChange: handleRowSelectionChange,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters, sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      priceFilter,
    },
    initialState: {
        columnVisibility: {
          element_type: false,
          team_code: false,
        },
    },
  });

  useEffect(() => {
    if (externalElementTypeFilter === undefined) {
      return;
    }
    table
      .getColumn("element_type")
      ?.setFilterValue(
        externalElementTypeFilter != null
          ? String(externalElementTypeFilter)
          : null
      );
  }, [externalElementTypeFilter, table]);

  const teamCodeToShortName = data.reduce((acc, team: any) => {
    acc[team.team_code] = team.fpl_player_team.short_name;
    return acc;
  }, {} as Record<number, string>);
  const playerCount = table.getFilteredRowModel().rows.length;
  const visibleRows = table.getRowModel().rows;

  useEffect(() => {
    setHighlightedRowIndex((index) =>
      visibleRows.length ? Math.min(index, visibleRows.length - 1) : 0
    );
  }, [visibleRows.length, pagination.pageIndex, columnFilters]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handlePlayerNavigation = (event: ReactKeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!visibleRows.length) return;
      setHighlightedRowIndex((index) =>
        event.key === "ArrowDown"
          ? (index + 1) % visibleRows.length
          : (index - 1 + visibleRows.length) % visibleRows.length
      );
      return;
    }

    if (event.key === "Enter" && visibleRows[highlightedRowIndex]) {
      event.preventDefault();
      const row = tableViewportRef.current?.querySelector(
        `[data-row-id="${visibleRows[highlightedRowIndex].id}"]`
      );
      row?.querySelector<HTMLButtonElement>('button[aria-label="Add"]')?.click();
    }
  };

  return (
    <Card
      className={clsx("flex flex-col overflow-hidden", {
        "h-full min-h-0": fillContainer,
      })}
    >
      {showAdvancedFilters && (
        <CardHeader className="flex-row items-center justify-between gap-4 border-b px-4 py-3 sm:px-5">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5 text-muted-foreground" />
              Player explorer
            </CardTitle>
            <CardDescription className="mt-1">
              Compare form, price, and underlying attacking data.
            </CardDescription>
          </div>
          <Badge variant="outline" className="shrink-0">
            {playerCount} {playerCount === 1 ? "player" : "players"}
          </Badge>
        </CardHeader>
      )}
      <CardContent
        onKeyDown={handlePlayerNavigation}
        className={clsx("flex flex-col gap-3 p-3 sm:p-4", {
          "min-h-0 flex-1 overflow-hidden": fillContainer,
        })}
      >
        <div className="flex flex-col gap-3 rounded-md border bg-background/40 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Input
            ref={searchInputRef}
            placeholder={`Filter ${name}...`}
            value={
              (table.getColumn("web_name")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("web_name")?.setFilterValue(event.target.value)
            }
            className="w-full lg:max-w-sm"
          />
          {showAdvancedFilters && (
            <ToggleGroup
              type="single"
              aria-label="Player position"
              className="justify-start rounded-md border bg-muted/40 p-1"
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
          )}
        </div>

        {showAdvancedFilters && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <div className="flex flex-row justify-between mb-2">
                <Label>Max Price</Label>
                <div className="text-xs font-medium text-muted-foreground">
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

            <div className="ring-0">
              <Label className="mb-2 block">Team</Label>
              <Select
                onValueChange={(e) =>
                  table.getColumn("team_code")!.setFilterValue(e)
                }
                value={
                  table.getColumn("team_code")?.getFilterValue()! as string
                }
              >
                <div className="flex flex-row gap-2">
                  <SelectTrigger>
                    <SelectValue placeholder="All teams" />
                  </SelectTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Clear team filter"
                    title="Clear team filter"
                    onClick={() =>
                      table
                        .getColumn("team_code")!
                        .setFilterValue("EMPTY_FILTER")
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
        )}
        </div>

        <div
          ref={tableViewportRef}
          className={clsx("rounded-md border bg-background/30", {
            "min-h-0 flex-1 overflow-hidden": fillContainer,
          })}
        >
          <Table
            className={clsx(
              "[&_tbody_td]:px-2 [&_tbody_td]:py-1.5 [&_tbody_td]:text-sm [&_tbody_tr]:h-12 [&_thead_th]:px-2",
              compact
                ? "table-auto [&_tbody_td]:!max-w-none [&_tbody_td]:!overflow-visible [&_tbody_td]:!text-clip [&_thead_th]:!max-w-none [&_thead_th]:!overflow-visible [&_thead_th]:!text-clip"
                : "min-w-[72rem] table-fixed lg:min-w-full"
            )}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                    <TableHead
                      key={header.id}
                      className={clsx(
                        "sticky top-0 bg-bgsecondary/95 backdrop-blur",
                        playerColumnClassName(header.column.id)
                      )}
                    >
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
                visibleRows.map((row, rowIndex) => (
                  <TableRow
                    key={row.id}
                    data-row-id={row.id}
                    aria-selected={rowIndex === highlightedRowIndex}
                    className={clsx(
                      "hover:bg-muted/40",
                      rowIndex === highlightedRowIndex && "bg-accent/40"
                    )}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell, idx) => (
                      <TableCell
                        key={cell.id}
                          className={clsx({
                            "max-w-48": idx == 1,
                          }, playerColumnClassName(cell.column.id))}
                      >
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
      </CardContent>

      <div className="flex items-center justify-between border-t px-4 py-3">
        <Button
          variant="secondary"
          size="xs"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <div className="text-xs text-muted-foreground">{`Page ${
          table.getState().pagination.pageIndex + 1
        } of ${table.getPageCount()}`}</div>
        <Button
          variant="secondary"
          size="xs"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </Card>
  );
}

export interface DataType extends FPLPlayerData2 {
  is_in_team: boolean;
  goals_scored: number;
  assists: number;
  expected_goal_involvements: number;
  expected_goals: number;
  expected_assists: number;
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
