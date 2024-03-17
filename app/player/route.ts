import { NextRequest } from "next/server";
import { getPlayerData } from "../api/data";

export async function POST(req: NextRequest) {
  const request = await req.json();
  const data = await getPlayerData(request.ids);

  return Response.json({ data });
}
