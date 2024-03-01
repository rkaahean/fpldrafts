"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type PlayerData = {
  id: string;
  name: string;
  team: string;
  points: number;
  xGI_90: number;
  xA_90: number;
  price: number;
};

export const columns: ColumnDef<PlayerData>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "team",
    header: "Team",
  },
  {
    accessorKey: "points",
    header: "Points",
  },
  {
    accessorKey: "xGI_90",
    header: "xGI/90",
  },
  {
    accessorKey: "xA_90",
    header: "xA/90",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
];
