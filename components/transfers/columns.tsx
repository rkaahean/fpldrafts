"use client";

import { picksStore } from "@/app/store";
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
          onClick={async () => {
            setSubstituteIn(row.original.player_id, row.original.now_value);
            const { isValid, reason } = await makeSubs();
            if (!isValid) {
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
