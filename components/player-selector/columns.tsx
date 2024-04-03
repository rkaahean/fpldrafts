"use client";

import { picksStore } from "@/app/store/picks";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type PlayerData = {
  player_id: number;
  web_name: string;
  total_points: number;
  expected_goal_involvements_per_90: number;
  goals_scored: number;
  assists: number;
};

export const columns: ColumnDef<PlayerData>[] = [
  {
    accessorKey: "web_name",
    header: "Name",
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
      const setSubstituteIn = picksStore((store) => store.setSubstituteIn);
      const makeSubs = picksStore((store) => store.makeSubs);

      return (
        <button
          onClick={() => {
            setSubstituteIn(row.original.player_id);
            makeSubs();
          }}
        >
          <PlusCircledIcon className="w-3 h-3" />
        </button>
      );
    },
  },
];
