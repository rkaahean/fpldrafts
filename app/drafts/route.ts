import { NextRequest } from "next/server";
import { createDraft } from "../api/data";

export async function POST(req: NextRequest) {
  const request = await req.json();

  let data;
  // if (request.draftId) {
  //   data = await updateDraftTransfers(request);
  // } else {
  data = await createDraft(request);
  // }

  return Response.json({ data });
}
