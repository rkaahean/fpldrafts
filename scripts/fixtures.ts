import { FPLFixtures, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type JSONResponse = Omit<FPLFixtures, "id">[];
function getData() {
  return fetch(`https://fantasy.premierleague.com/api/fixtures`)
    .then((res) => res.json())
    .then(async (data) => {
      return await parseFixtureData(data);
    })
    .then(async (data) => {
      await prisma.fPLFixtures.createMany({
        data,
        skipDuplicates: true,
      });
    });
}

async function parseFixtureData(data: any): Promise<JSONResponse> {
  // get id, team, team_code, web_name, element_type

  const teams = await getPlayerTeams(process.env.FPL_SEASON_ID!);
  const formattedPicks: JSONResponse = data.map((fixture: any) => {
    const [team_h] = teams.filter((team) => team.team_id == fixture.team_h);
    const [team_a] = teams.filter((team) => team.team_id == fixture.team_a);

    if (!team_h || !team_a) {
      console.warn(
        `Skipping fixture with team_h: ${fixture.team_h} and team_a: ${fixture.team_a} as they don't exist in the database.`
      );
      return null; // Skip this fixture
    }
    return {
      season_id: process.env.FPL_SEASON_ID!,
      code: fixture.code,
      fixture_id: fixture.id,
      event: fixture.event,
      finished: fixture.finished,
      team_h_id: team_h?.id,
      team_a_id: team_a?.id,
      team_h_difficulty: fixture.team_h_difficulty,
      team_a_difficulty: fixture.team_a_difficulty,
      team_h_score: fixture.team_h_score,
      team_a_score: fixture.team_a_score,
    };
  });
  return formattedPicks;
}

try {
  getData();
  prisma.$disconnect();
} catch (e) {
  console.error(e);
  prisma.$disconnect();
}

async function getPlayerTeams(season_id: string) {
  return await prisma.fPLPlayerTeam.findMany({
    where: {
      season_id,
    },
  });
}
