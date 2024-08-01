import { NextRequest } from "next/server";
import { getPlayerData } from "..";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const player_id = parseInt(searchParams.get("id")!);

  const data = await getPlayerData(player_id, 1, process.env.FPL_SEASON_ID!);

  return Response.json({ data });
}
