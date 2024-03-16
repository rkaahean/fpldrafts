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
  // const res = await fetch(
  //   PROXY_URL + `https://fantasy.premierleague.com/api/bootstrap-static/`,
  //   {
  //     headers: {
  //       origin: "localhost:3000",
  //     },
  //   }
  // );
  // return res.json().then((data) =>
  //   data["elements"]
  //     .filter((player: any) => ids.includes(player.id))
  //     .map((player: any) => {
  //       // console.log(player);
  //       return {
  //         id: player.id,
  //         web_name: player.web_name,
  //         team: player.team,
  //         element_type: player.element_type,
  //         team_code: player.team_code,
  //       };
  //     })
  // );
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
