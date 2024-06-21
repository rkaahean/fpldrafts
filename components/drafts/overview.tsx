import prisma from "@/lib/db";
import { unstable_cache } from "next/cache";
import { DataTable } from "../ui/data-table";
import { columns } from "./columns";

const getData = unstable_cache(
  async () => {
    const data = await prisma.fPLDrafts.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        base_gameweek: true,
        FPLDraftTransfers: true,
        bank: true,
      },
    });
    return data;
  },
  ["drafts"],
  {
    tags: ["drafts"],
  }
);

export type Draft = Awaited<ReturnType<typeof getData>>[number];

export default async function Drafts() {
  const drafts = await getData();
  return (
    <div className="flex flex-col h-1/3">
      <div className="text-sm font-black">Drafts</div>
      <DataTable
        columns={columns}
        data={drafts!}
        name="drafts"
        isFilterable={false}
      />
    </div>
  );
}
