import { NextRequest } from "next/server";
import { createDraft } from "../../api";

export async function POST(req: NextRequest) {
  const request = await req.json();

  let data;
  console.log("Creating draft", request);
  data = await createDraft(request);

  return Response.json({ data });
}
