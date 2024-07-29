import { auth } from "@/auth/main";
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import {
  FPLPlayerData2,
  getGameweekOverallData,
  getGameweekPicksData,
  getLastTransferValue,
  getPlayerValueByGameweek,
} from "../..";

export const runtime = "edge";

export const GET = auth(async function GET(req: NextRequest) {
  const neon = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(neon);
  const prisma = new PrismaClient({ adapter });

  console.log(prisma);
  console.time("gameweek");
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

  console.time("user-team-email");
  // const { teamId } = await getUserTeamFromEmail(decoded.email);
  const user_data = await prisma.user.findFirst({
    select: {
      id: true,
      fpl_teams: {
        select: {
          id: true,
        },
        where: {
          fpl_season_id: "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865",
        },
      },
    },
    where: {
      email: decoded.email,
    },
  })!;
  const teamId = user_data!.fpl_teams[0].id!;
  console.timeEnd("user-team-email");

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

    console.time("player-data");
    // const allPlayers: FPLPlayerData2[] = await getPlayerDataBySeason(
    //   "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865",
    //   [310, 347, 380, 418, 339, 3, 350, 9, 99, 186, 199, 385, 58, 4, 108]
    // );
    const allPlayers: FPLPlayerData2[] = await prisma.fPLPlayer.findMany({
      // Include the related FPLPlayer record
      select: {
        id: true,
        player_id: true,
        web_name: true,
        team_code: true,
        element_type: true,
        total_points: true,
        expected_assists: true,
        expected_assists_per_90: true,
        expected_goals: true,
        expected_goals_per_90: true,
        expected_goal_involvements: true,
        expected_goal_involvements_per_90: true,
        now_value: true,
        goals_scored: true,
        assists: true,
        fpl_player_team: {
          select: {
            short_name: true,
            home_fixtures: {
              where: {
                season_id: "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865",
              },
              select: {
                fpl_team_a: {
                  select: {
                    short_name: true,
                  },
                },
                id: true,
                event: true,
              },
            },
            away_fixtures: {
              where: {
                season_id: "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865",
              },
              select: {
                fpl_team_h: {
                  select: {
                    short_name: true,
                  },
                },
                id: true,
                event: true,
              },
            },
          },
        },
        fpl_gameweek_player_stats: {
          select: {
            value: true,
          },
        },
      },
      where: {
        season_id: "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865",
        player_id: {
          in: [
            310, 347, 380, 418, 339, 3, 350, 9, 99, 186, 199, 385, 58, 4, 108,
          ],
        },
      },
      orderBy: {
        total_points: "desc",
      },
    });
    console.timeEnd("player-data");
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
    console.timeEnd("gameweek");
    return Response.json({
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
      },
    });
  }

  // get overall gameweek data
  const overall = await getGameweekOverallData(gameweek);
  // get gameweek picks data
  let data = await getGameweekPicksData(gameweek, teamId);

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
});
