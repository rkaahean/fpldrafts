import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import { createDraft, getUserTeamFromEmail } from "../..";

export async function POST(req: NextRequest) {
  const request = await req.json();
  const jwt = req.headers.get("authorization");

  if (!jwt) {
    return NextResponse.json(
      { error: "Authorization header missing" },
      { status: 401 }
    );
  }
  const token = jwt.split(" ")[1];
  const decoded = jwtDecode<{ email: string }>(token);

  const { userId, teamId } = await getUserTeamFromEmail(decoded.email);
  const draftId = await createDraft({ ...request, teamId });

  return Response.json({ id: draftId });
}
