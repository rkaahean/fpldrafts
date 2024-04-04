import { NextRequest } from "next/server";
import { getGameweekPicksData } from "..";

export async function POST(req: NextRequest) {
  const request = await req.json();
  const data = await getGameweekPicksData(request.gameweek);

  return Response.json({ data });
}
