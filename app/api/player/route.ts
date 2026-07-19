import { NextRequest } from "next/server";
import { getPlayerData, getPlayerGameweekHistory } from "..";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const player_id = parseInt(searchParams.get("id")!);

  const [player, history] = await Promise.all([
    getPlayerData(player_id, 1, process.env.FPL_SEASON_ID!),
    getPlayerGameweekHistory(player_id, process.env.FPL_SEASON_ID!),
  ]);

  return Response.json({ data: { player, history } });
}
