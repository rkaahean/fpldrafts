"use client";

import { revalidateDrafts } from "@/app/actions";
import { useDraftLoader } from "@/app/hooks";
import { DownloadIcon, TrashIcon } from "@radix-ui/react-icons";
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
            <DownloadIcon className="w-3 h-3" />
          </Button>
        </div>
      );
    },
  },
  {
    id: "delete",
    cell: ({ row }) => {
      return (
        <div className="flex h-full items-center justify-center w-full">
          <Button
            size="table"
            variant="ghost"
            onClick={async () => {
              // delete
              await fetch("/api/drafts/delete", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  draftId: row.original.id,
                }),
              }).then((res) => res.json());
              revalidateDrafts();
            }}
          >
            <TrashIcon className="w-3 h-3" />
          </Button>
        </div>
      );
    },
  },
];
