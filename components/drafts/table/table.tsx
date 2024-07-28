"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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
import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  name: string;
  isFilterable: boolean;
  isPaginated?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  name,
  isFilterable,
  isPaginated = false,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
      columnVisibility: {
        element_type: false,
      },
    },
  });

  return (
    <div>
      {isFilterable && (
        <div className="flex items-center pb-1 gap-2">
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
      )}
      <div className="rounded-sm border">
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
                  // data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    const isSelected = row.getIsSelected();
                    row.toggleSelected(!isSelected);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-[11px]">
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
      {isPaginated && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
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
    </div>
  );
}
