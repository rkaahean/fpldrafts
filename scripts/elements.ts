import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function getData() {
  console.log("Fetching player information from DB...");
  const players = prisma.fPLPlayer.findMany({
    orderBy: {
      total_points: "desc",
    },
    where: {
      season_id: process.env.FPL_SEASON_ID!,
    },
  });

  return players
    .then((players) => {
      console.log("Fetching player information from FPL...");
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
      console.log("Upadting Gameweek Player Stats...");
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

      await prisma.$transaction(
        async (tx) => {
          for (const player of formattedData) {
            console.log(
              "Updating player for player stats: ",
              player[0].fpl_player_id
            );
            await tx.fPLGameweekPlayerStats.upsert({
              where: {
                fpl_player_id_gameweek: {
                  fpl_player_id: player[0].fpl_player_id,
                  gameweek: player[0].gameweek,
                },
              },
              create: player[0],
              update: player[0],
            });
          }
        },
        {
          timeout: 1000000,
        }
      );

      // await Promise.all(
      //   formattedData.map(async (player) => {
      //     console.log(player);
      //     await prisma.fPLGameweekPlayerStats.upsert({
      //       where: {
      //         fpl_player_id_gameweek: {
      //           fpl_player_id: player[0].fpl_player_id,
      //           gameweek: player[0].gameweek,
      //         },
      //       },
      //       create: player[0],
      //       update: player[0],
      //     });
      //   })
      // );
    });
}

try {
  // get all players
  getData();
  prisma.$disconnect();
} catch (e) {
  console.error(e);
  prisma.$disconnect();
}
