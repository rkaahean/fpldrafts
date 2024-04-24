import { FPLGameweekPicks, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type JSONResponse = Omit<FPLGameweekPicks, "id">[];
function getData(teamId: number, gameweek: number) {
  return fetch(
    `https://fantasy.premierleague.com/api/entry/44421/event/${gameweek}/picks/`
  )
    .then((res) => res.json())
    .then(async (data) => {
      return await parsePicksData(data, gameweek);
    });
}

async function parsePicksData(
  data: any,
  gameweek: number
): Promise<JSONResponse> {
  let picks = data["picks"];

  // get id, team, team_code, web_name, element_type
  const formattedPicks: JSONResponse = picks.map(async (pick: any) => {
    const player = await getPlayerByElement(
      pick.element,
      "133e854c-8817-47a9-888e-d07bd2cd76b6"
    );
    return {
      fpl_team_id: "53ed0ea1-7298-4069-b609-f8108468c885",
      fpl_player_id: player!.id,
      position: pick.position,
      multiplier: pick.multiplier,
      is_captain: pick.is_captain,
      is_vice_captain: pick.is_vice_captain,
      gameweek,
    };
  });
  return Promise.all(formattedPicks);
}

try {
  const data = [];
  for (let i = 36; i <= 38; i++) {
    const gameweekData = getData(44421, i);
    console.log(gameweekData);
    data.push(gameweekData);
  }

  // Promise.all(data).then(async (res) => {
  //   await prisma.fPLGameweekPicks.createMany({
  //     data: res.flat(),
  //   });
  // });

  prisma.$disconnect();
} catch (e) {
  console.error(e);
  prisma.$disconnect();
}

async function getPlayerByElement(element: number, season_id: string) {
  return await prisma.fPLPlayer.findFirst({
    where: {
      player_id: element,
      season_id,
    },
  });
}
