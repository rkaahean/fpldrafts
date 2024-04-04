import { NextRequest } from "next/server";
import { getPlayerData } from "..";

export async function POST(req: NextRequest) {
  const request = await req.json();
  const data = await getPlayerData(request.id);

  return Response.json({ data });
}
