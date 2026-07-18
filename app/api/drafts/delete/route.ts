import prisma from "@/scripts/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import { getUserTeamFromEmail } from "../..";

export async function POST(req: NextRequest) {
  const request = await req.json();
  const jwt = req.headers.get("authorization");

  if (!jwt) {
    return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
  }

  const decoded = jwtDecode<{ email: string }>(jwt.split(" ")[1]);
  const { teamId } = await getUserTeamFromEmail(decoded.email, process.env.FPL_SEASON_ID!);
  const data = await prisma.fPLDrafts.updateMany({
    where: { id: request.draftId, fpl_team_id: teamId, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  if (data.count === 0) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
