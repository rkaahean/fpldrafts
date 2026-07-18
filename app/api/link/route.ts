import prisma from "@/scripts/lib/db";
import { syncFullHistory } from "@/scripts/utils";

import { NextRequest, after } from "next/server";

export async function POST(req: NextRequest) {
  const request = await req.json();

  const team = await prisma.fPLTeam.create({
    data: {
      name: "Temp",
      team_id: parseInt(request.teamNumber),
      fpl_season_id: process.env.FPL_SEASON_ID!,
      user_id: request.userId,
    },
  });

  after(async () => {
    try {
      await syncFullHistory(team.id, parseInt(request.teamNumber));
    } catch (e) {
      console.error("Background full-history sync failed", e);
    }
  });

  return Response.json({
    data: {
      teamId: team.id,
    },
  });
}
