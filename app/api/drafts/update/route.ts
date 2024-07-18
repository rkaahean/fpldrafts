import prisma from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const request = await req.json();

  // update main drafts
  await prisma.fPLDrafts.update({
    where: {
      id: request.id,
    },
    data: {
      bank: request.bank,
      base_gameweek: request.gameweek,
    },
  });

  const data = request.changes.map((change: any) => {
    return {
      player_in_id: change.in.data.player_id,
      player_out_id: change.out.data.player_id,
      gameweek: change.gameweek,
      fpl_draft_id: request.id,
      in_cost: change.in.price,
      out_cost: change.out.price,
    };
  });

  // update changes
  await prisma.fPLDraftTransfers.createMany({
    data,
    skipDuplicates: true,
  });

  return Response.json({ status: "OK" });
}
