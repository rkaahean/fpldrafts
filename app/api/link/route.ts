import prisma from "@/lib/db";
import { updateFPLTeamData } from "@/scripts/utils";

import { NextRequest } from "next/server";

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

  try {
    await updateFPLTeamData(team.id, parseInt(request.teamNumber));
  } catch (e) {
    console.log("Ran into error", e);
  }
  return Response.json({
    data: {
      teamId: team.id,
    },
  });
}
