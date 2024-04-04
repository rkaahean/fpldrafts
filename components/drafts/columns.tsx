"use client";

import { useDraftLoader } from "@/app/hooks";
import { ReloadIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Draft = {
  id: string;
  name: string;
  description: string | null;
  base_gameweek: number;
};

export const columns: ColumnDef<Draft>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "base_gameweek",
    header: "Base",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { loadDrafts } = useDraftLoader();
      return (
        <div className="flex h-full items-center justify-center w-full">
          <Button
            size="table"
            variant="ghost"
            onClick={async () => {
              loadDrafts(
                row.original.id,
                row.original.name,
                row.original.description || ""
              );
            }}
          >
            <ReloadIcon className="w-3 h-3" />
          </Button>
        </div>
      );
    },
  },
];
