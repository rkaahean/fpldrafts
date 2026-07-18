"use client";

import { picksStore } from "@/app/store";
import { DraftTransfer } from "@/app/store/utils";
import { draftTransferSummary, formatDraftGameweeks } from "@/lib/fpl/drafts";
import { FPLDraftTransfers, FPLDrafts } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { Button } from "../../ui/button";
import { DraftActions } from "./actions";

export interface DraftsData extends FPLDrafts {
  FPLDraftTransfers: FPLDraftTransfers[];
}

function formatNetCost(netCost: number) {
  if (netCost === 0) return "Even";
  return netCost > 0 ? `£${(netCost / 10).toFixed(1)} spend` : `£${Math.abs(netCost / 10).toFixed(1)} saved`;
}

export const columns: ColumnDef<DraftsData>[] = [
  {
    accessorKey: "name",
    header: "Draft",
    filterFn: (row, _columnId, value) =>
      `${row.original.name} ${row.original.description ?? ""}`
        .toLowerCase()
        .includes(String(value).toLowerCase()),
    cell: ({ row }) => (
      <div className="min-w-36">
        <div className="font-semibold">{row.original.name}</div>
        {row.original.description && (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{row.original.description}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "base_gameweek",
    header: "Starts",
    cell: ({ row }) => `GW ${row.original.base_gameweek}`,
  },
  {
    id: "transfers",
    header: "Moves",
    accessorFn: (row) => row.FPLDraftTransfers.length,
    cell: ({ row }) => `${draftTransferSummary(row.original.FPLDraftTransfers).count} transfers`,
  },
  {
    id: "gameweeks",
    header: "Plan",
    accessorFn: (row) => formatDraftGameweeks(draftTransferSummary(row.FPLDraftTransfers).gameweeks),
    cell: ({ row }) => (
      <span title={formatDraftGameweeks(draftTransferSummary(row.original.FPLDraftTransfers).gameweeks)}>
        {formatDraftGameweeks(draftTransferSummary(row.original.FPLDraftTransfers).gameweeks)}
      </span>
    ),
  },
  {
    id: "net_cost",
    header: "Cost",
    accessorFn: (row) => draftTransferSummary(row.FPLDraftTransfers).netCost,
    cell: ({ row }) => formatNetCost(draftTransferSummary(row.original.FPLDraftTransfers).netCost),
  },
  {
    accessorKey: "bank",
    header: "Bank",
    cell: ({ row }) => `£${(row.original.bank / 10).toFixed(1)}`,
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => row.original.updatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  },
  {
    id: "load",
    enableSorting: false,
    cell: ({ row }) => <LoadDraft draft={row.original} />,
  },
  {
    id: "actions",
    enableSorting: false,
    cell: ({ row }) => <DraftActions draftId={row.original.id} draftName={row.original.name} />,
  },
];

function LoadDraft({ draft }: { draft: DraftsData }) {
  const { data: session } = useSession();
  const setDrafts = picksStore((state) => state.setDrafts);

  return (
    <Button
      size="sm"
      variant="success"
      onClick={async (event) => {
        event.stopPropagation();
        const response = await fetch(`/api/drafts/get?id=${draft.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        const loaded: { data: DraftTransfer[] } = await response.json();
        setDrafts({
          id: draft.id,
          name: draft.name,
          description: draft.description || "",
          changes: loaded.data,
          bank: draft.bank,
        });
      }}
    >
      Load
    </Button>
  );
}
