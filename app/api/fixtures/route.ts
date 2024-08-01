import { NextRequest } from "next/server";
import { getAllFixtures } from "..";

export async function POST(req: NextRequest) {
  const request = await req.json();
  const data = await getAllFixtures(
    request.gameweek,
    request.count,
    process.env.FPL_SEASON_ID!
  );

  return Response.json({ data });
}
