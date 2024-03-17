import { FPLGameweekPlayerStats, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type JSONResponse = Omit<FPLGameweekPlayerStats, "id">[];
function getData(): Promise<Promise<JSONResponse>[]> {
  const players = prisma.fPLPlayer.findMany({
    orderBy: {
      total_points: "desc",
    },
  });

  return players
    .then((players) => {
      return players.map(async (player) => {
        return await fetch(
          `https://fantasy.premierleague.com/api/element-summary/${player.player_id}/`
        ).then((res) => res.json());
      });
    })
    .then(async (players) => {
      const data = players.map(async (player) => {
        return await parseElementsData(player);
      });
      return data;
    });
}

async function parseElementsData(data: any): Promise<JSONResponse> {
  /**
   * parse data for each player element and return the formatted data
   */

  return data.then((res: any) => {
    const history = res["history"];
    return Promise.all(
      history.map(async (element: any) => {
        const player = await getPlayerByElement(
          element.element,
          // season id
          "133e854c-8817-47a9-888e-d07bd2cd76b6"
        );
        return {
          fpl_player_id: player?.id,
          gameweek: element.round,
          total_points: element.total_points,
          goals_scored: element.goals_scored,
          assists: element.assists,
          expected_goals: parseFloat(element.expected_goals),
          expected_assists: parseFloat(element.expected_assists),
          value: element.value,
        };
      })
    );
  });
}

try {
  // get all players
  const data = getData();
  data.then(async (res) => {
    Promise.all(res).then(async (data) => {
      await prisma.fPLGameweekPlayerStats.createMany({
        data: data.flat(),
      });
    });
  });
  prisma.$disconnect();
} catch (e) {
  console.error(e);
  prisma.$disconnect();
}

export async function getPlayerByElement(element: number, season_id: string) {
  return await prisma.fPLPlayer.findFirst({
    where: {
      player_id: element,
      season_id,
    },
  });
}
