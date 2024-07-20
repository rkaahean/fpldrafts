import prisma from "@/lib/db";
import { unstable_cache } from "next/cache";

import { columns } from "./columns";
import { DataTable } from "./table";

const getData = unstable_cache(
  async (teamId: string) => {
    const data = await prisma.fPLDrafts.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        base_gameweek: true,
        FPLDraftTransfers: true,
        bank: true,
      },
      where: {
        fpl_team_id: teamId,
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

export default async function Drafts(props: { teamId: string }) {
  const drafts = await getData(props.teamId);
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
