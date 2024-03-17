"use client";

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
    header: "XGI/90",
  },
  {
    accessorKey: "goals_scored",
    header: "Goals",
  },
  {
    accessorKey: "assists",
    header: "Assists",
  },
  {
    accessorKey: "minutes",
    header: "Minutes",
  },
];
