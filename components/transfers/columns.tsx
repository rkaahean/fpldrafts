"use client";

import { FPLPlayerData2 } from "@/app/api";
import { picksStore } from "@/app/store";
import { removeTransfer } from "@/app/store/utils";
import { FPLPlayerDataToPlayerData } from "@/lib/utils";
import { PlusIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { toast } from "../ui/use-toast";
import { priceFilter } from "./table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<FPLPlayerData2>[] = [
  {
    id: "team_crest",
    cell: ({ row }) => {
      return (
        <div className="w-4 h-4">
          <Image
            src={`https://resources.premierleague.com/premierleague/badges/t${row.original.team_code}.png`}
            alt="crest"
            width={128}
            height={128}
            priority
          />
        </div>
      );
    },
  },
  {
    accessorKey: "web_name",
    header: "Name",
  },
  {
    accessorKey: "now_value",
    header: "£",
    cell: ({ row }) => row.original.now_value / 10,
    filterFn: priceFilter,
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
    id: "player_add",
    cell: ({ row, table }) => {
      const transfersIn = picksStore((store) => store.transfersIn);
      const setTransferIn = picksStore((store) => store.setTransferIn);

      const makeTransfers = picksStore((store) => store.makeTransfers);

      // console.log("TRANSFERS TABLE", transfersIn);

      const isSelectedForTransfer =
        transfersIn[row.original.element_type].filter(
          (transfer) => transfer.player_id == row.original.player_id
        ).length > 0;

      return (
        <button
          onClick={async () => {
            table.getColumn("web_name")?.setFilterValue("");
            const formatted = FPLPlayerDataToPlayerData({
              position: 1,
              fpl_player: row.original,
              selling_price: row.original.now_value,
            });
            // if not already selected, push into state
            if (!isSelectedForTransfer) {
              transfersIn[row.original.element_type].push({
                id: row.original.id,
                player_id: row.original.player_id,
                selling_price: row.original.now_value,
                web_name: row.original.web_name,
                // made up
                position: 1,
                team_code: row.original.team_code,
                expected_goal_involvements_per_90:
                  row.original.expected_goal_involvements_per_90,
                total_points: row.original.total_points,
                element_type: row.original.element_type,
                now_value: row.original.now_value,
                fpl_gameweek_player_stats:
                  row.original.fpl_gameweek_player_stats,
                fpl_player_team: row.original.fpl_player_team,
                fixtures: formatted.fixtures,
              });
            }
            // if already selected, remove from state
            else {
              transfersIn[row.original.element_type] = transfersIn[
                row.original.element_type
              ].filter(
                (transfer) => transfer.player_id != row.original.player_id
              );
              setTransferIn(transfersIn);
              return;
            }

            const { isvalid, reason } = await makeTransfers();
            if (!isvalid) {
              // remove the transfer in as it is invalid
              const newTransfers = removeTransfer(transfersIn, {
                player_id: row.original.player_id,
                element_type: row.original.element_type,
                selling_price: row.original.now_value,
              });
              setTransferIn(newTransfers);
              toast({
                title: "Cannot make transfer.",
                description: reason,
                variant: "destructive",
              });
            }
          }}
        >
          <PlusIcon className="w-3 h-3 text-green-500 hover:text-white transition-all hover:bg-green-500 rounded-full" />
        </button>
      );
    },
  },
  {
    accessorKey: "element_type",
    header: "element_type",
    filterFn: "equalsString",
  },
];
