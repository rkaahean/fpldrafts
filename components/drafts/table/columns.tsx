"use client";

import { picksStore } from "@/app/store";
import { DraftTransfer } from "@/app/store/utils";
import { FPLDraftTransfers, FPLDrafts } from "@prisma/client";
import { DownloadIcon, TrashIcon } from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { Button } from "../../ui/button";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.Draft

// Existing types

export interface DraftsData extends FPLDrafts {
  FPLDraftTransfers: FPLDraftTransfers[];
}

export const columns: ColumnDef<DraftsData>[] = [
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
      const { data: session } = useSession();
      const setDrafts = picksStore((state) => state.setDrafts);
      return (
        <div className="flex h-full items-center justify-center w-full">
          <Button
            size="table"
            variant="ghost"
            onClick={async () => {
              const drafts: { data: DraftTransfer[] } = await fetch(
                `/api/drafts/get?id=${row.original.id}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                  },
                }
              ).then((res) => res.json());
              setDrafts({
                id: row.original.id,
                name: row.original.name,
                description: row.original.description || "",
                changes: drafts.data,
                bank: row.original.bank,
              });
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
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const queryClient = useQueryClient();
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
              queryClient.invalidateQueries({
                queryKey: ["draftsget"],
              });
            }}
          >
            <TrashIcon className="w-3 h-3" />
          </Button>
        </div>
      );
    },
  },
];
