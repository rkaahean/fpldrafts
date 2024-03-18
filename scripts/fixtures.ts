import { FPLFixtures, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type JSONResponse = Omit<FPLFixtures, "id">[];
function getData() {
  return fetch(`https://fantasy.premierleague.com/api/fixtures`)
    .then((res) => res.json())
    .then(async (data) => {
      return await parseFixtureData(data);
    });
}

async function parseFixtureData(data: any): Promise<JSONResponse> {
  // get id, team, team_code, web_name, element_type
  const formattedPicks: JSONResponse = data.map(async (fixture: any) => {
    const team_h = await getTeamById(
      fixture.team_h,
      "133e854c-8817-47a9-888e-d07bd2cd76b6"
    );
    const team_a = await getTeamById(
      fixture.team_a,
      "133e854c-8817-47a9-888e-d07bd2cd76b6"
    );
    if (!team_h || !team_a) {
      console.warn(
        `Skipping fixture with team_h: ${fixture.team_h} and team_a: ${fixture.team_a} as they don't exist in the database.`
      );
      return null; // Skip this fixture
    }
    return {
      season_id: "133e854c-8817-47a9-888e-d07bd2cd76b6",
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
  return Promise.all(formattedPicks);
}

try {
  getData().then(async (data) => {
    await prisma.fPLFixtures.createMany({
      data,
    });
  });
  prisma.$disconnect();
} catch (e) {
  console.error(e);
  prisma.$disconnect();
}

async function getTeamById(team_id: number, season_id: string) {
  return await prisma.fPLPlayerTeam.findFirst({
    where: {
      team_id,
      season_id,
    },
  });
}
