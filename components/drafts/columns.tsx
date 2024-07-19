"use client";

import { revalidateDrafts } from "@/app/actions";
import { useDraftLoader } from "@/app/hooks";
import { DownloadIcon, TrashIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { Draft } from "./overview";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.Draft

export const columns: ColumnDef<Draft>[] = [
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
    id: "bank",
    header: "Bank",
    cell: ({ row }) => {
      return <div>{row.original.bank / 10}</div>;
    },
  },
  {
    id: "num_changes",
    header: "Changes",
    cell: ({ row }) => {
      return <div>{row.original.FPLDraftTransfers.length}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { loadDrafts } = useDraftLoader();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: session } = useSession();
      return (
        <div className="flex h-full items-center justify-center w-full">
          <Button
            size="table"
            variant="ghost"
            onClick={async () => {
              loadDrafts(
                row.original.id,
                row.original.name,
                row.original.description || "",
                row.original.bank,
                session?.team_id!
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
