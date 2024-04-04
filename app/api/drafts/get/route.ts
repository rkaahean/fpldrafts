import { NextRequest } from "next/server";
import { getDraftTransfers } from "../..";

export async function POST(req: NextRequest) {
  const request = await req.json();

  const data = await getDraftTransfers(request.draftId);

  return Response.json({ data });
}
