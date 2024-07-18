import { FPLGameweekPlayerStats, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type JSONResponse = Omit<FPLGameweekPlayerStats, "id">[];
function getData() {
  const players = prisma.fPLPlayer.findMany({
    orderBy: {
      total_points: "desc",
    },
  });

  return players
    .then((players) => {
      return Promise.all(
        players.map(async (player) => {
          try {
            const data = await fetch(
              `https://fantasy.premierleague.com/api/element-summary/${player.player_id}/`
            ).then((res) => res.json());
            return {
              id: player.id,
              ...data,
            };
          } catch (e) {
            return {};
          }
        })
      );
    })
    .then(async (playersData) => {
      // for all players

      // console.log(playersData);
      const formattedData = playersData
        .filter((value) => Object.keys(value).length != 0)
        .map((player) => {
          if (player) {
            const history = player["history"];
            return history.map((h: any) => {
              return {
                fpl_player_id: player?.id,
                gameweek: h.round,
                total_points: h.total_points,
                goals_scored: h.goals_scored,
                assists: h.assists,
                expected_goals: parseFloat(h.expected_goals),
                expected_assists: parseFloat(h.expected_assists),
                value: h.value,
                fixture_id: h.fixture,
              };
            });
          }
        });
      // console.log(formattedData);
      await prisma.fPLGameweekPlayerStats.createMany({
        data: formattedData.flat(),
        skipDuplicates: true,
      });
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
          "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865"
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
          fixture_id: element.fixture,
        };
      })
    );
  });
}

try {
  // get all players
  const data = getData();
  // data.then(async (res) => {
  //   Promise.all(res).then(async (playerData) => {
  //     playerData.flat().map(async (data) => {
  //       await prisma.fPLGameweekPlayerStats.upsert({
  //         where: {
  //           fpl_player_id_fixture_id: {
  //             fpl_player_id: data.fpl_player_id,
  //             fixture_id: data.fixture_id,
  //           },
  //         },
  //         update: data,
  //         create: data,
  //       });
  //     });
  //   });
  // });
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
