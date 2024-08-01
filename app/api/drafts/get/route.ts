import prisma from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import {
  getDraftTransfers,
  getLastTransferValue,
  getPlayerValueByGameweek,
  getUserTeamFromEmail,
} from "../..";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const draftId = searchParams.get("id")!;
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

  if (draftId) {
    let data = await getDraftTransfers(
      draftId,
      teamId,
      process.env.FPL_SEASON_ID!
    );
    let newData = data!.FPLDraftTransfers.map((player) => {
      // if no profit, sell at current price
      return {
        in: {
          data: player.in_fpl_player,
          price: player.in_cost,
        },
        out: {
          data: player.out_fpl_player,
          price: player.out_cost,
        },
        gameweek: player.gameweek,
      };
    });

    return Response.json({ data: newData });
  } else {
    const data = await prisma.fPLDrafts.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        FPLDraftTransfers: true,
        bank: true,
        base_gameweek: true,
      },
      where: {
        fpl_team_id: teamId,
      },
    });
    return Response.json({ data });
  }
}

async function computeSellingPrice(player_id: string, gameweek: number) {
  const transferInPrice = await getLastTransferValue(
    "53ed0ea1-7298-4069-b609-f8108468c885",
    player_id
  );
  const currentPrice = await getPlayerValueByGameweek(player_id, gameweek);
  const diff = currentPrice?.value! - transferInPrice?.in_player_cost!;
  // profit!
  if (diff > 0) {
    // for every 2 in profit, add 1 to selling price
    return transferInPrice?.in_player_cost! + Math.floor(diff / 2);
  }
  return currentPrice?.value!;
}
