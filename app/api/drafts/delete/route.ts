import { NextRequest } from "next/server";
import { deleteDraft } from "../..";

export async function POST(req: NextRequest) {
  const request = await req.json();
  const data = await deleteDraft(request.draftId);

  return Response.json({ data });
}
