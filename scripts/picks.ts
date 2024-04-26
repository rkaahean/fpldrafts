import { FPLGameweekPicks, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type JSONResponse = Omit<FPLGameweekPicks, "id">[];
function getPicksData(teamId: number, gameweek: number) {
  return fetch(
    `https://fantasy.premierleague.com/api/entry/44421/event/${gameweek}/picks/`
  )
    .then((res) => res.json())
    .then(async (data) => {
      return {
        picks: await parsePicksData(data, gameweek),
        history: await parseHistoryData(data, gameweek),
      };
    });
}

function getTransfersData(teamId: number) {
  return fetch(`
  https://fantasy.premierleague.com/api/entry/44421/transfers/
  `).then((res) => res.json());
}

async function parsePicksData(
  data: any,
  gameweek: number
): Promise<JSONResponse | undefined> {
  if (data["detail"] != "Not found.") {
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
}

async function parseHistoryData(data: any, gameweek: number) {
  if (data["detail"] != "Not found.") {
    let history = data["entry_history"];

    return {
      fpl_team_id: "53ed0ea1-7298-4069-b609-f8108468c885",
      gameweek,
      bank: history.bank,
      value: history.value,
      points: history.points,
      total_points: history.total_points,
      gameweek_rank: history.rank,
      overall_rank: history.overall_rank,
      event_transfers: history.event_transfers,
      event_transfers_cost: history.event_transfers_cost,
    };
  }
}

try {
  const data = [];
  for (let i = 1; i <= 38; i++) {
    const gameweekData = getPicksData(44421, i);
    data.push(gameweekData);
  }

  data.map(async (obj) => {
    const { picks, history } = await obj;
    if (picks) {
      picks.map(async (pick: any) => {
        await prisma.fPLGameweekPicks.upsert({
          where: {
            fpl_team_id_gameweek_position: {
              fpl_team_id: pick.fpl_team_id,
              gameweek: pick.gameweek,
              position: pick.position,
            },
          },
          update: pick,
          create: pick,
        });
      });

      if (history) {
        await prisma.fPLGameweekOverallStats.upsert({
          where: {
            fpl_team_id_gameweek: {
              fpl_team_id: "53ed0ea1-7298-4069-b609-f8108468c885",
              gameweek: history.gameweek,
            },
          },
          update: history,
          create: history,
        });
      }
    }
  });

  getTransfersData(44421).then(async (data) => {
    const maxTime = await prisma.fPLGameweekTransfers.aggregate({
      _max: {
        time: true,
      },
    });

    let dataToInsert = data;
    if (maxTime._max.time) {
      dataToInsert = data.filter((obj: any) => {
        return new Date(obj.time) > maxTime._max.time!;
      });
    }

    dataToInsert.map(async (transfer: any) => {
      await prisma.fPLGameweekTransfers.create({
        data: {
          fpl_team_id: "53ed0ea1-7298-4069-b609-f8108468c885",
          in_player_id: (await getPlayerByElement(
            transfer.element_in,
            "133e854c-8817-47a9-888e-d07bd2cd76b6"
          ).then((player) => player?.id)) as string,
          in_player_cost: transfer.element_in_cost,
          out_player_id: (await getPlayerByElement(
            transfer.element_out,
            "133e854c-8817-47a9-888e-d07bd2cd76b6"
          ).then((player) => player?.id)) as string,
          out_player_cost: transfer.element_out_cost,
          time: transfer.time,
          gameweek: transfer.event,
        },
      });
    });
  });

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
