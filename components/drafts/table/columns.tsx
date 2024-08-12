"use client";

import { picksStore } from "@/app/store";
import { DraftTransfer } from "@/app/store/utils";
import { FPLDraftTransfers, FPLDrafts } from "@prisma/client";
import { TrashIcon } from "@radix-ui/react-icons";
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
  // {
  //   accessorKey: "base_gameweek",
  //   header: "Base",
  // },
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
        // <div className="flex h-full items-center justify-center w-full">
        <Button
          size="table"
          variant="success"
          className="h-4 lg:h-6 p-1 text-[11px] 2xl:text-lg"
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
          {/* <DownloadIcon className="w-3 h-3" /> */}
          Load
        </Button>
        // </div>
      );
    },
  },
  {
    id: "delete",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const queryClient = useQueryClient();
      return (
        <Button
          size="table"
          variant="ghost"
          className="h-4 lg:h-6 p-1 hover:bg-destructive"
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
          <TrashIcon className="w-4 h-4s 2xl:w-6 2xl:h-6" />
        </Button>
      );
    },
  },
];
