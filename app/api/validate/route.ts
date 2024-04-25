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

  const inIdx = picks.findIndex(
    (pick: any) => pick.fpl_player.player_id == substitutedIn
  );
  const outIdx = picks.findIndex(
    (pick: any) => pick.fpl_player.player_id == substitutedOut
  );
  // Condition 1: Both in and out players are of same type
  const isSameType = inData?.element_type == outData?.element_type;
  const isInTeam = inIdx != -1 && outIdx != -1;
  if (!isSameType && !isInTeam) {
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

  const LIMIT = inIdx != -1 ? 4 : 3;
  if (data.length >= LIMIT) {
    // if number of players already 3
    return Response.json({
      isValid: false,
      reason: `More than 3 players from ${inData?.fpl_player_team.name}`,
    });
  }

  return Response.json({ isValid: true, reason: "All good!" });
}
