import { FPLGameweekPicks, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type JSONResponse = Omit<FPLGameweekPicks, "id" | "fpl_team_id">[];
function getData(teamId: number, gameweek: number) {
  return fetch(
    `https://fantasy.premierleague.com/api/entry/44421/event/${gameweek}/picks/`
  )
    .then((res) => res.json())
    .then(async (data) => {
      return await parsePicksData(data, gameweek);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

async function parsePicksData(data: any, gameweek: number) {
  let picks = data["picks"];

  // get id, team, team_code, web_name, element_type
  const formattedPicks: JSONResponse = picks.map((pick: any) => {
    return {
      fpl_team_id: "53ed0ea1-7298-4069-b609-f8108468c885",
      element: pick.element,
      position: pick.position,
      multiplier: pick.multiplier,
      is_captain: pick.is_captain,
      is_vice_captain: pick.is_vice_captain,
      gameweek,
    };
  });
  return formattedPicks;
  // insert into prisma
  // const promises = formattedPicks.map(async (pick) => {
  //   try {
  //     return await prisma.fPLGameweekPicks.create({
  //       data: {
  //         fpl_team_id: "53ed0ea1-7298-4069-b609-f8108468c885",
  //         ...pick,
  //       },
  //     });
  //   } catch (e) {
  //     if (e instanceof Prisma.PrismaClientKnownRequestError) {
  //       if (e.code === "P2002") {
  //         console.log("Pick already exists in database.", pick.element);
  //       }
  //       return;
  //     }
  //     console.log(e);
  //   }
  // });
  // await Promise.all(promises);
}

try {
  const data: any = [];
  for (let i = 1; i <= 28; i++) {
    data.push(getData(44421, i));
  }

  Promise.all(data).then(async (res) => {
    await prisma.fPLGameweekPicks.createMany({
      data: res.flat(),
    });
  });
} catch (e) {
  console.error(e);
}
