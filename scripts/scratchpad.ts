import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function getData() {
  const result = prisma.fPLGameweekPicks.findMany({
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
              },
              away_fixtures: {
                include: {
                  fpl_team_h: {
                    select: {
                      short_name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    where: {
      gameweek: 28,
    },
  });
  return result;
}

try {
  // get all players
  const data = getData();
  data.then((res) => {
    console.log(res);
  });
  prisma.$disconnect();
} catch (e) {
  console.error(e);
  prisma.$disconnect();
}
