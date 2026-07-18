"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Input } from "../../ui/input";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  name: string;
  isFilterable: boolean;
  isPaginated?: boolean;
  filterColumnId?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  name,
  isFilterable,
  isPaginated = false,
  filterColumnId = "name",
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { columnFilters, sorting },
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
      columnVisibility: {
        element_type: false,
      },
    },
  });

  const isPaginationVisible = isPaginated;

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-4 border-b px-4 py-3 sm:px-5">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Draft library
          </CardTitle>
          <CardDescription className="mt-1">
            Saved transfer plans ready to load and refine.
          </CardDescription>
        </div>
        <Badge variant="outline" className="shrink-0">
          {data.length} saved {data.length === 1 ? "draft" : "drafts"}
        </Badge>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 sm:p-4">
      {isFilterable && (
        <div className="flex items-center gap-2 rounded-md border bg-background/40 p-3">
          <Input
            placeholder={`Filter ${name}...`}
            value={
              (table.getColumn(filterColumnId)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(filterColumnId)?.setFilterValue(event.target.value)
            }
            className="w-full max-w-sm"
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
      )}
      <div className="min-h-0 flex-1 overflow-auto rounded-md border bg-background/30">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="sticky top-0 bg-bgsecondary/95 backdrop-blur"
                    >
                      {header.isPlaceholder
                        ? null
                        : header.column.getCanSort()
                          ? (
                              <button
                                className="inline-flex items-center gap-1 text-left hover:text-foreground"
                                onClick={() =>
                                  header.column.toggleSorting(
                                    header.column.getIsSorted() === "asc"
                                  )
                                }
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getIsSorted() === "asc" ? "↑" : header.column.getIsSorted() === "desc" ? "↓" : ""}
                              </button>
                            )
                          : flexRender(header.column.columnDef.header, header.getContext())}
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
                  className="hover:bg-muted/40"
                  // data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    const isSelected = row.getIsSelected();
                    row.toggleSelected(!isSelected);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="max-w-24">
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
                  {data.length ? "No matching drafts." : "No drafts saved yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      </CardContent>
      {isPaginationVisible && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <Button
            variant="outline"
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
            variant="outline"
            size="xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  );
}
