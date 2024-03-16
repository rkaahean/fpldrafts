import prisma from "@/lib/db";

const PROXY_URL = "https://web-production-e2df.up.railway.app/";

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

export async function getGameweekData(gameWeek: number) {
  const res = await fetch(
    PROXY_URL +
      `https://fantasy.premierleague.com/api/entry/44421/event/${gameWeek}/picks/`,
    {
      headers: {
        origin: "localhost:3000",
      },
    }
  ).then((res) => res.json());
  return res;
}
