"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Draft = {
  id: string;
  name: string;
  createdAt: string;
  basedOn: string;
  scenario: string;
};

export const columns: ColumnDef<Draft>[] = [
  {
    accessorKey: "scenario",
    header: "Scenario",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    accessorKey: "basedOn",
    header: "Based On",
  },
];
