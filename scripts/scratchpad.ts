import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function getData() {
  const playerFixtures = prisma.fPLPlayer.findFirst({
    where: {
      player_id: 77,
    },
    include: {
      fpl_team: {
        include: {
          home_fixtures: true,
          away_fixtures: true,
        },
      },
    },
  });
  return playerFixtures;
}

try {
  // get all players
  const data = getData();
  data.then((res) => {
    console.log(res?.fpl_team.home_fixtures);
  });
  prisma.$disconnect();
} catch (e) {
  console.error(e);
  prisma.$disconnect();
}
