import { NextRequest } from "next/server";
import {
  getGameweekOverallData,
  getGameweekPicksData,
  getLastTransferValue,
  getPlayerValueByGameweek,
} from "..";

export async function POST(req: NextRequest) {
  const request = await req.json();

  // get overall gameweek data
  const overall = await getGameweekOverallData(request.gameweek);
  // get gameweek picks data
  let data = await getGameweekPicksData(request.gameweek);

  let newData = data.map(async (player) => {
    // get transfer in price of player_id
    const transferInPrice = await getLastTransferValue(
      "53ed0ea1-7298-4069-b609-f8108468c885",
      player.fpl_player.id
    );
    // current price
    const currentPrice = await getPlayerValueByGameweek(
      player.fpl_player.id,
      request.gameweek
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
      selling_price: currentPrice?.value,
    };
  });

  return Response.json({
    data: await Promise.all(newData),
    overall,
  });
}
