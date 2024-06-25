"use client";

import { picksStore } from "@/app/store";
import { removeTransfer } from "@/app/store/utils";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "../ui/use-toast";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type PlayerData = {
  player_id: number;
  web_name: string;
  total_points: number;
  expected_goal_involvements_per_90: number;
  goals_scored: number;
  assists: number;
  now_value: number;
  element_type: number;
};

export const columns: ColumnDef<PlayerData>[] = [
  {
    accessorKey: "web_name",
    header: "Name",
  },
  {
    accessorKey: "now_value",
    header: "£",
    cell: ({ row }) => row.original.now_value / 10,
  },
  {
    accessorKey: "total_points",
    header: "Points",
  },
  {
    accessorKey: "expected_goal_involvements_per_90",
    header: "xGI/90",
  },
  {
    accessorKey: "expected_goals_per_90",
    header: "xG/90",
  },
  {
    accessorKey: "expected_assists_per_90",
    header: "xA/90",
  },
  {
    accessorKey: "goals_scored",
    header: "G",
  },
  {
    accessorKey: "assists",
    header: "A",
  },
  {
    accessorKey: "minutes",
    header: "Minutes",
  },
  {
    id: "player_add",
    cell: ({ row }) => {
      const transfersIn = picksStore((store) => store.transfersIn);
      const makeTransfers = picksStore((store) => store.makeTransfers);
      const addToBank = picksStore((store) => store.addToBank);
      const removeFromBank = picksStore((store) => store.removeFromBank);

      const isSelectedForTransfer =
        transfersIn[row.original.element_type].filter(
          (transfer) => transfer.player_id == row.original.player_id
        ).length > 0;

      return (
        <button
          onClick={async () => {
            // if not already selected, push into state
            if (!isSelectedForTransfer) {
              transfersIn[row.original.element_type].push({
                player_id: row.original.player_id,
                value: row.original.now_value,
                name: row.original.web_name,
              });
            }
            // if already selected, remove from state
            else {
              transfersIn[row.original.element_type] = transfersIn[
                row.original.element_type
              ].filter(
                (transfer) => transfer.player_id != row.original.player_id
              );
            }
            const { isvalid, reason } = await makeTransfers();
            if (!isvalid) {
              // remove the transfer in as it is invalid
              removeTransfer(transfersIn, {
                player_id: row.original.player_id,
                element_type: row.original.element_type,
                selling_price: row.original.now_value,
              });
              toast({
                title: "Cannot make transfer",
                description: reason,
              });
            }
          }}
        >
          <PlusCircledIcon className="w-3 h-3" />
        </button>
      );
    },
  },
];
