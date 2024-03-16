import prisma from "@/lib/db";
import result from "postcss/lib/result";

export async function getPlayerData(ids: number[]) {
  // get from prisma
  const players = await prisma.fPLPlayer.findMany({
    where: {
      player_id: {
        in: ids,
      },
    },
  });
  return players;
}

export async function getGameweekData(gameweek: number) {
  const picks = await prisma.fPLGameweekPicks.findMany({
    where: {
      gameweek,
    },
  });
  return picks;
}

export async function getGameweekPicksData(gameweek: number) {
  const result = await prisma.fPLGameweekPicks.findMany({
    include: {
      fpl_player: {
        // Include the related FPLPlayer record
        select: {
          player_id: true,
          first_name: true,
          second_name: true,
          team: true,
          web_name: true,
          team_code: true,
          element_type: true,
        },
      },
    },
    where: {
      gameweek,
    },
  });
  return result;
}
