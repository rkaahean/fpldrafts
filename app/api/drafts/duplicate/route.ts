import prisma from "@/scripts/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import { getUserTeamFromEmail } from "../..";

export async function POST(req: NextRequest) {
  const { draftId } = await req.json();
  const jwt = req.headers.get("authorization");

  if (!jwt) {
    return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
  }

  const decoded = jwtDecode<{ email: string }>(jwt.split(" ")[1]);
  const { teamId } = await getUserTeamFromEmail(decoded.email, process.env.FPL_SEASON_ID!);
  const draft = await prisma.fPLDrafts.findFirst({
    where: { id: draftId, fpl_team_id: teamId, deletedAt: null },
    include: { FPLDraftTransfers: true },
  });

  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const duplicate = await prisma.fPLDrafts.create({
    data: {
      name: `${draft.name} copy`,
      description: draft.description,
      fpl_team_id: teamId,
      base_gameweek: draft.base_gameweek,
      bank: draft.bank,
      FPLDraftTransfers: {
        create: draft.FPLDraftTransfers.map((transfer) => ({
          player_in_id: transfer.player_in_id,
          player_out_id: transfer.player_out_id,
          gameweek: transfer.gameweek,
          in_cost: transfer.in_cost,
          out_cost: transfer.out_cost,
        })),
      },
    },
  });

  return NextResponse.json({ id: duplicate.id });
}
