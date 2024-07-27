import { NextRequest } from "next/server";
import { getPlayerData } from "..";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const player_id = parseInt(searchParams.get("id")!);

  const data = await getPlayerData(
    player_id,
    1,
    "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865"
  );

  return Response.json({ data });
}
