import { NextRequest } from "next/server";
import { getPlayerData } from "..";

export async function POST(req: NextRequest) {
  const request = await req.json();
  const data = await getPlayerData(
    request.id,
    1,
    "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865"
  );

  return Response.json({ data });
}
