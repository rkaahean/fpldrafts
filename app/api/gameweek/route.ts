import { NextRequest } from "next/server";
import { getGameweekOverallData, getGameweekPicksData } from "..";

export async function POST(req: NextRequest) {
  const request = await req.json();

  // get overall gameweek data
  const overall = await getGameweekOverallData(request.gameweek);
  // get gameweek picks data
  let data = await getGameweekPicksData(request.gameweek);

  return Response.json({
    data,
    overall,
  });
}
