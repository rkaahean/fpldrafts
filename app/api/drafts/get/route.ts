import { NextRequest } from "next/server";
import {
  getDraftTransfers,
  getLastTransferValue,
  getPlayerData,
  getPlayerValueByGameweek,
} from "../..";

export async function POST(req: NextRequest) {
  const request = await req.json();

  let data = await getDraftTransfers(request.draftId);
  let newData = data.map(async (player) => {
    // if no profit, sell at current price
    return {
      in: {
        data: await getPlayerData(player.player_in_id, request.gameweek),
        price: player.in_cost,
      },
      out: {
        data: await getPlayerData(player.player_out_id, request.gameweek),
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
