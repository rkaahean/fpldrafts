import { NextRequest } from "next/server";
import { getPlayerStaticData } from "..";

export async function POST(req: NextRequest) {
  /**
   * This endpoint is responsible for telling the client if a transfer
   * can be made or not. There are multiple restrictions that are placed.
   */
  const request = await req.json();
  const { drafts, substitutedIn, substitutedOut } = request;

  const inData = await getPlayerStaticData(substitutedIn);
  const outData = await getPlayerStaticData(substitutedOut);

  // Condition 1: Both in and out players are of same type
  const isSameType = inData?.element_type == outData?.element_type;
  if (!isSameType) {
    return Response.json({
      isValid: false,
      reason: "Unable to transfer players in different positions.",
    });
  }

  return Response.json({ isValid: true, reason: "All good!" });
}
