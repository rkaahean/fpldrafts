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
          total_points: true,
          expected_goal_involvements_per_90: true,
          fpl_player_team: {
            select: {
              short_name: true,
              home_fixtures: {
                select: {
                  fpl_team_a: {
                    select: {
                      short_name: true,
                    },
                  },
                  id: true,
                  event: true,
                },
                where: {
                  event: {
                    gte: gameweek,
                  },
                },
              },
              away_fixtures: {
                select: {
                  fpl_team_h: {
                    select: {
                      short_name: true,
                    },
                  },
                  id: true,
                  event: true,
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
export type FPLGameweekPicksData = Awaited<
  ReturnType<typeof getGameweekPicksData>
>;

export async function getAllPlayerData() {
  // sort by total_points
  const players = await prisma.fPLPlayer.findMany({
    orderBy: {
      total_points: "desc",
    },
  });
  return players;
}
