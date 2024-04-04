import { NextRequest } from "next/server";
import { createDraft } from "../..";

export async function POST(req: NextRequest) {
  const request = await req.json();
  const data = await createDraft(request);

  return Response.json({ data });
}
