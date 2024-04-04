import { getAllDrafts } from "@/app/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const request = await req.json();

  const data = await getAllDrafts();

  return Response.json({ data });
}
