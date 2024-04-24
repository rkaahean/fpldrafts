import { NextRequest } from "next/server";
import { getPlayerStaticData } from "..";

export async function POST(req: NextRequest) {
  /**
   * This endpoint is responsible for telling the client if a transfer
   * can be made or not. There are multiple restrictions that are placed.
   */
  const request = await req.json();
  const { picks, substitutedIn, substitutedOut } = request;

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

  // Condition 2: No more than 3 players from any team
  const data = picks.filter(
    (player: any) =>
      // get players in team who are from the player's team being substituted in
      player.fpl_player.team_code == inData?.fpl_player_team.code &&
      // exclude players in team who are from player's team being substituted out
      player.fpl_player.team_code != outData?.fpl_player_team.code
  );
  if (data.length >= 3) {
    // if number of players already 3
    return Response.json({
      isValid: false,
      reason: `More than 3 players from ${inData?.fpl_player_team.name}`,
    });
  }

  return Response.json({ isValid: true, reason: "All good!" });
}
