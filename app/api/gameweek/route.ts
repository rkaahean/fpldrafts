import { auth } from "@/auth/main";
import { computeSellingPrice } from "@/lib/fpl/pricing";
import prisma from "@/scripts/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import {
  FPLPlayerData2,
  getGameweekOverallData,
  getGameweekPicksData,
  getLastTransferValue,
  getPlayerDataBySeason,
  getPlayerValueByGameweek,
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

  const { teamId } = await getUserTeamFromEmail(
    decoded.email,
    process.env.FPL_SEASON_ID!
  );

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

    let playerData: any[] = [];

    const allPlayers: FPLPlayerData2[] = await getPlayerDataBySeason(
      process.env.FPL_SEASON_ID!,
      [101, 670, 74, 694, 151, 258, 295, 517, 329, 457, 303, 237, 691, 178, 597]
    );
    // get 2 goalkeeps
    const gks = allPlayers
      .filter((player) => player.element_type == 1)
      .slice(0, 2);
    gks[0].position = 1;
    gks[1].position = 12;

    // get 5 defenders
    const defs = allPlayers
      .filter((player) => player.element_type == 2)
      .slice(0, 5);
    defs[0].position = 2;
    defs[1].position = 3;
    defs[2].position = 4;
    defs[3].position = 13;
    defs[4].position = 14;

    // get 5 mids
    const mids = allPlayers
      .filter((player) => player.element_type == 3)
      .slice(0, 5);
    mids[0].position = 5;
    mids[1].position = 6;
    mids[2].position = 7;
    mids[3].position = 8;
    mids[4].position = 9;

    const fwds = allPlayers
      .filter((player) => player.element_type == 4)
      .slice(0, 3);
    fwds[0].position = 10;
    fwds[1].position = 11;
    fwds[2].position = 15;

    playerData = playerData.concat([gks, defs, mids, fwds]).flat();
    playerData = playerData.map((player) => {
      return {
        position: player.position,
        fpl_player: {
          player_id: player.id,
          fpl_player_team: {
            home_fixtures: [],
            away_fixtures: [],
          },
          selling_price: player.now_value,
          ...player,
        },
      };
    });
    return Response.json(
      JSON.stringify({
        data: playerData,
        overall: {
          bank:
            1000 -
            playerData.reduce(
              (sm, price) => sm + price.fpl_player.selling_price,
              0
            ),
          value: playerData.reduce(
            (sm, price) => sm + price.fpl_player.selling_price,
            0
          ),
          overall_rank: 0,
          total_points: 0,
        },
        transfers: [],
      })
    );
  }

  // get overall gameweek data
  const overall = await getGameweekOverallData(gameweek - 1, teamId);
  // ex: if loading gw2 data, need to base it off gameweeek 1 picks
  let data = await getGameweekPicksData(gameweek - 1, teamId);
  // console.log("Getting data for team", teamId, overall, gameweek);

  let newData = data.map(async (player) => {
    // get transfer in price of player_id
    const transferInPrice = await getLastTransferValue(
      teamId,
      player.fpl_player.id
    );
    // current price
    const currentPrice = await getPlayerValueByGameweek(
      player.fpl_player.id,
      gameweek
    );
    return {
      ...player,
      selling_price: computeSellingPrice(
        transferInPrice?.in_player_cost!,
        currentPrice?.value!
      ),
    };
  });

  return Response.json(
    JSON.stringify({
      data: await Promise.all(newData),
      overall,
      transfers: await prisma.fPLGameweekTransfers.findMany({
        where: {
          gameweek: {
            gte: gameweek - 5,
            lte: gameweek - 1,
          },
        },
      }),
    })
  );
});
