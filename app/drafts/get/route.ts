import { NextRequest } from "next/server";
import { getDraftTransfers } from "../../api";

export async function POST(req: NextRequest) {
  const request = await req.json();

  console.log("Loading draft transfers...");
  const data = await getDraftTransfers(request.draftId);

  return Response.json({ data });
}
