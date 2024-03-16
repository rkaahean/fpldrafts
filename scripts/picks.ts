import { FPLGameweekPicks, Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function getData(teamId: number, gameweek: number) {
  return fetch(
    `https://fantasy.premierleague.com/api/entry/44421/event/${gameweek}/picks/`
  )
    .then((res) => res.json())
    .then((data) => {
      parsePicksData(data, gameweek);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function parsePicksData(data: any, gameweek: number) {
  let picks = data["picks"];

  // get id, team, team_code, web_name, element_type
  const formattedPicks: Omit<FPLGameweekPicks, "id" | "fpl_team_id">[] =
    picks.map((pick: any) => {
      return {
        element: pick.element,
        position: pick.position,
        multiplier: pick.multiplier,
        is_captain: pick.is_captain,
        is_vice_captain: pick.is_vice_captain,
        gameweek,
      };
    });

  // insert into prisma
  formattedPicks.forEach(async (pick) => {
    try {
      await prisma.fPLGameweekPicks.create({
        data: {
          fpl_team_id: "53ed0ea1-7298-4069-b609-f8108468c885",
          ...pick,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          console.log("Pick already exists in database.", pick.element);
        }
        return;
      }
      console.log(e);
    }
  });
}

getData(44421, 28);
