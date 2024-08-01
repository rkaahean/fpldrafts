import prisma from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import { getUserTeamFromEmail } from "../..";

export async function POST(req: NextRequest) {
  const request = await req.json();

  const jwt = req.headers.get("authorization");

  if (!jwt) {
    return NextResponse.json(
      { error: "Authorization header missing" },
      { status: 401 }
    );
  }
  const token = jwt.split(" ")[1];
  const decoded = jwtDecode<{ email: string }>(token);

  const { userId, teamId } = await getUserTeamFromEmail(
    decoded.email,
    process.env.FPL_SEASON_ID!
  );

  // update main drafts
  await prisma.fPLDrafts.update({
    where: {
      id: request.id,
      fpl_team_id: teamId,
    },
    data: {
      bank: request.bank,
      base_gameweek: request.gameweek,
    },
  });

  const data = request.changes.map((change: any) => {
    return {
      player_in_id: change.in.data.id,
      player_out_id: change.out.data.id,
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
