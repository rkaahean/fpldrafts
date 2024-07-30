import prisma from "@/lib/db";
import { updateFPLTeamData } from "@/scripts/picks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const request = await req.json();

  console.log("PICK", request);

  const team = await prisma.fPLTeam.create({
    data: {
      name: "Temp",
      team_id: parseInt(request.teamNumber),
      fpl_season_id: "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865",
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
