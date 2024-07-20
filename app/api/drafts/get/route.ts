import { NextRequest } from "next/server";
import {
  getDraftTransfers,
  getLastTransferValue,
  getPlayerValueByGameweek,
} from "../..";

export async function POST(req: NextRequest) {
  const request = await req.json();
  const { draftId, teamId } = request;

  let data = await getDraftTransfers(draftId, teamId);
  let newData = data!.FPLDraftTransfers.map(async (player) => {
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
      gameweek: request.gameweek,
    };
  });

  return Response.json({ data: await Promise.all(newData) });
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
