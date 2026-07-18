import { auth } from "@/auth/main";
import { buildInitialGameweekPayload } from "@/lib/fpl/gameweek";
import {
  computeSellingPrice,
  latestTransferCostByPlayer,
  priceByPlayer,
} from "@/lib/fpl/pricing";
import prisma from "@/scripts/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import {
  FPLPlayerData2,
  getGameweekOverallData,
  getGameweekPicksData,
  getLastTransferValues,
  getPlayerDataBySeason,
  getPlayerValuesByGameweek,
  getUserTeamFromEmail,
} from "..";

export const GET = auth(async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const gameweek = parseInt(searchParams.get("gameweek")!);

  // decode token from header
  const jwt = req.headers.get("authorization");
  if (!jwt) {
    return NextResponse.json(
      { error: "Authorization header missing" },
      { status: 401 }
    );
  }
  const token = jwt.split(" ")[1];
  const decoded = jwtDecode<{ email: string }>(token);

  console.time("[gameweek] getUserTeamFromEmail");
  const { teamId } = await getUserTeamFromEmail(
    decoded.email,
    process.env.FPL_SEASON_ID!
  );
  console.timeEnd("[gameweek] getUserTeamFromEmail");

  // get team and user from token

  // special basecase
  if (gameweek == 1) {
    // kelleher: 101
    // roefs: 670

    // truffert: 74
    // mukiele: 694
    // van hecke: 151
    // mitchell: 258
    // keane: 295

    // anderson: 517
    // wilson: 329
    // casemiro: 457
    // garner: 303
    // enzo: 237

    // calvert-lewin: 691
    // welbeck: 178
    // richarlison: 597

    const allPlayers: FPLPlayerData2[] = await getPlayerDataBySeason(
      process.env.FPL_SEASON_ID!,
      [101, 670, 74, 694, 151, 258, 295, 517, 329, 457, 303, 237, 691, 178, 597]
    );

    return Response.json(buildInitialGameweekPayload(allPlayers));
  }

  console.time("[gameweek] getGameweekOverallData");
  const overall = await getGameweekOverallData(gameweek - 1, teamId);
  console.timeEnd("[gameweek] getGameweekOverallData");

  console.time("[gameweek] getGameweekPicksData");
  let data = await getGameweekPicksData(gameweek - 1, teamId);
  console.timeEnd("[gameweek] getGameweekPicksData");

  const playerIds = data.map((player) => player.fpl_player.id);
  console.time("[gameweek] batched transfer+price queries");
  const [transfers, priceStats] = await Promise.all([
    getLastTransferValues(teamId, playerIds),
    getPlayerValuesByGameweek(playerIds, gameweek),
  ]);
  console.timeEnd("[gameweek] batched transfer+price queries");

  const transferInPriceByPlayer = latestTransferCostByPlayer(transfers);
  const currentPriceByPlayer = priceByPlayer(priceStats);

  const newData = data.map((player) => ({
    ...player,
    selling_price: computeSellingPrice(
      transferInPriceByPlayer.get(player.fpl_player.id)!,
      currentPriceByPlayer.get(player.fpl_player.id)!
    ),
  }));

  console.time("[gameweek] fPLGameweekTransfers.findMany");
  const recentTransfers = await prisma.fPLGameweekTransfers.findMany({
    where: {
      gameweek: {
        gte: gameweek - 5,
        lte: gameweek - 1,
      },
    },
  });
  console.timeEnd("[gameweek] fPLGameweekTransfers.findMany");

  return Response.json({
    data: newData,
    overall,
    transfers: recentTransfers,
  });
});
