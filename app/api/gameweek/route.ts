export const revalidate = 3600;

import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {
  FPLPlayerData2,
  getGameweekOverallData,
  getGameweekPicksData,
  getLastTransferValue,
  getPlayerDataBySeason,
  getPlayerValueByGameweek,
} from "..";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const gameweek = parseInt(searchParams.get("gameweek")!);
  const jwt = req.headers.get("authorization");

  if (!jwt) {
    return NextResponse.json(
      { error: "Authorization header missing" },
      { status: 401 }
    );
  }

  const token = jwt.split(" ")[1];
  const user_data = await prisma.account.findFirst({
    select: {
      user: {
        select: {
          fpl_teams: {
            select: {
              id: true,
            },
          },
        },
      },
    },
    where: {
      id_token: token,
    },
  });

  const team_id = user_data?.user.fpl_teams[0].id!;

  // get team and user from token

  // special basecase
  if (gameweek == 1) {
    // allison: 310
    // ederson: 347

    // l.martinez: 380
    // tripper: 418
    // virgil: 339
    // gabriel: 3
    // gvardiol: 350

    // martinelli: 9
    // mbeumo: 99
    // sterling: 186
    // eze: 199
    // rashford: 385

    // watkins: 58
    // havertz: 4
    // toney: 108

    let playerData: any[] = [];

    const allPlayers: FPLPlayerData2[] = await getPlayerDataBySeason(
      "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865",
      [310, 347, 380, 418, 339, 3, 350, 9, 99, 186, 199, 385, 58, 4, 108]
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
    return Response.json({
      data: await Promise.all(playerData),
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
      },
    });
  }

  // get overall gameweek data
  const overall = await getGameweekOverallData(gameweek);
  // get gameweek picks data
  let data = await getGameweekPicksData(gameweek, team_id);

  let newData = data.map(async (player) => {
    // get transfer in price of player_id
    const transferInPrice = await getLastTransferValue(
      team_id,
      player.fpl_player.id
    );
    // current price
    const currentPrice = await getPlayerValueByGameweek(
      player.fpl_player.id,
      gameweek
    );
    const diff = currentPrice?.value! - transferInPrice?.in_player_cost!;
    // profit!
    if (diff > 0) {
      // for every 2 in profit, add 1 to selling price
      return {
        ...player,
        selling_price: transferInPrice?.in_player_cost! + Math.floor(diff / 2),
      };
    }

    // if no profit, sell at current price
    return {
      ...player,
      selling_price: currentPrice?.value!,
    };
  });

  return Response.json({
    data: await Promise.all(newData),
    overall,
  });
}
