import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function getData() {
  return fetch("https://fantasy.premierleague.com/api/bootstrap-static/")
    .then((res) => res.json())
    .then((data) => {
      parseBoostrapData(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function parseBoostrapData(data: any) {
  const elements = data["elements"];

  // get id, team, team_code, web_name, element_type
  const players: FPLPlayer[] = elements.map((player: any) => {
    return {
      id: player.id,
      web_name: player.web_name,
      team: player.team,
      element_type: player.element_type,
      team_code: player.team_code,
      first_name: player.first_name,
      second_name: player.second_name,
    };
  });

  // insert into prisma
  players.forEach(async (player) => {
    try {
      await prisma.fPLPlayer.create({
        data: {
          player_id: player.id,
          web_name: player.web_name,
          first_name: player.first_name || "",
          second_name: player.second_name || "",
          team: player.team,
          element_type: player.element_type,
          team_code: player.team_code,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          console.log(
            "Player already exists in database.",
            player.id,
            player.web_name
          );
        }
        return;
      }
      console.log(e);
    }
  });
}

getData();

type FPLPlayer = {
  id: number;
  web_name: string;
  team: number;
  element_type: number;
  team_code: number;
  first_name: string;
  second_name: string;
};
