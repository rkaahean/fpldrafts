import prisma from "../../../lib/db";

export async function getPlayerData(id: number) {
  // get from prisma
  const players = await prisma.fPLPlayer.findMany({
    where: {
      player_id: id,
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
          web_name: true,
          team_code: true,
          element_type: true,
          fpl_player_team: {
            include: {
              home_fixtures: {
                include: {
                  fpl_team_a: {
                    select: {
                      short_name: true,
                    },
                  },
                },
                where: {
                  event: {
                    gte: gameweek,
                  },
                },
              },
              away_fixtures: {
                include: {
                  fpl_team_h: {
                    select: {
                      short_name: true,
                    },
                  },
                },
                where: {
                  event: {
                    gte: gameweek,
                  },
                },
              },
            },
          },
        },
      },
    },
    where: {
      gameweek,
    },
  });
  return result;
}

export async function getAllPlayerData() {
  // sort by total_points
  const players = await prisma.fPLPlayer.findMany({
    orderBy: {
      total_points: "desc",
    },
  });
  return players;
}
