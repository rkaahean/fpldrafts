"use client";

import { picksStore } from "@/app/store";
import { removeTransfer } from "@/app/store/utils";
import { FPLPlayerDataToPlayerData } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { DataType, priceFilter, teamFilter } from "./table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<DataType>[] = [
  {
    id: "team_crest",
    cell: ({ row }) => {
      return (
        <div className="w-4 h-4 2xl:h-6 2xl:w-6">
          <Image
            src={`https://resources.premierleague.com/premierleague/badges/t${row.original.team_code}.png`}
            alt="crest"
            width={20}
            height={20}
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
    id: "now_value",
    accessorKey: "now_value",
    header: "£",
    cell: ({ row }) => row.original.now_value / 10,
    filterFn: priceFilter,
  },
  {
    id: "team_code",
    accessorKey: "team_code",
    header: "team_code",
    filterFn: teamFilter,
  },
  {
    accessorKey: "total_points",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Points
        </button>
      );
    },
  },
  {
    accessorKey: "expected_goal_involvements_per_90",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          xGI/90
        </button>
      );
    },
  },
  {
    accessorKey: "expected_goals_per_90",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          xG/90
        </button>
      );
    },
  },
  {
    accessorKey: "expected_assists_per_90",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          xGA/90
        </button>
      );
    },
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
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mins
        </button>
      );
    },
  },
  {
    id: "is_in_team",
  },
  {
    id: "player_add",
    cell: ({ row, table }) => {
      const transfersIn = picksStore((store) => store.transfersIn);
      const setTransferIn = picksStore((store) => store.setTransferIn);

      const makeTransfers = picksStore((store) => store.makeTransfers);

      const isSelectedForTransfer =
        transfersIn[row.original.element_type].filter(
          (transfer) => transfer.player_id == row.original.player_id
        ).length > 0;

      return (
        <Button
          variant="secondary"
          size="table"
          disabled={row.original.is_in_team}
          className="h-4 lg:h-5 p-1 text-[11px] 2xl:text-lg rounded-sm"
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
                team_name: formatted.team_name,
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
          Add
          {/* <PlusIcon className="w-[14px] h-[14px] 2xl:w-6 2xl:h-6 text-accent hover:text-primary transition-all hover:bg-accent rounded-full" /> */}
        </Button>
      );
    },
  },
  {
    accessorKey: "element_type",
    header: "element_type",
    filterFn: "equalsString",
  },
];
