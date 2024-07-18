import { FPLGameweekPicks, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type JSONResponsePicks = Omit<FPLGameweekPicks, "id">[];
type JSONResponseHistory = NonNullable<
  Awaited<ReturnType<typeof parseHistoryData>>
>;

const TEAM_ID = 7894;
function getPicksData(teamId: number, gameweek: number) {
  return fetch(
    `https://fantasy.premierleague.com/api/entry/${teamId}/event/${gameweek}/picks/`
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
  https://fantasy.premierleague.com/api/entry/${teamId}/transfers/
  `).then((res) => res.json());
}

async function parsePicksData(
  data: any,
  gameweek: number
): Promise<JSONResponsePicks | undefined> {
  if (data["detail"] !== "Not found.") {
    const picks = data["picks"];
    const elementIds = picks.map((pick: any) => pick.element);

    const players = await prisma.fPLPlayer.findMany({
      where: {
        player_id: {
          in: elementIds,
        },
        season_id: "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865",
      },
      select: {
        id: true,
        player_id: true,
      },
    });

    const playerMap = new Map(
      players.map((player) => [player.player_id, player.id])
    );

    const formattedPicks: JSONResponsePicks = picks.map((pick: any) => ({
      fpl_team_id: "53ed0ea1-7298-4069-b609-f8108468c885",
      fpl_player_id: playerMap.get(pick.element),
      position: pick.position,
      multiplier: pick.multiplier,
      is_captain: pick.is_captain,
      is_vice_captain: pick.is_vice_captain,
      gameweek,
    }));

    return formattedPicks;
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
  const picks: JSONResponsePicks = [];
  const history: JSONResponseHistory[] = [];

  for (let i = 1; i <= 38; i++) {
    const gameweekData = getPicksData(TEAM_ID, i);
    data.push(gameweekData);
  }
  const alldata = Promise.all(data);

  console.log("Getting data...");
  alldata.then(async (data) => {
    data.map((gw) => {
      if (gw.picks) {
        picks.push(...gw.picks);
      }

      if (gw.history) {
        history.push(gw.history);
      }
    });

    // insert all data in one go;
    console.log("Inserting picks...");
    await prisma.fPLGameweekPicks.createMany({
      data: picks,
      skipDuplicates: true,
    });

    console.log("Inserting overall stats...");
    await prisma.fPLGameweekOverallStats.createMany({
      data: history,
      skipDuplicates: true,
    });
  });

  console.log("Inserting transfer data...");
  getTransfersData(TEAM_ID).then(async (data) => {
    const inPlayers = await prisma.fPLPlayer.findMany({
      where: {
        player_id: {
          in: data.map(
            (transfer: { element_in: number }) => transfer.element_in
          ),
        },
        season_id: "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865",
      },
      select: {
        id: true,
        player_id: true,
      },
    });

    const outPlayers = await prisma.fPLPlayer.findMany({
      where: {
        player_id: {
          in: data.map(
            (transfer: { element_out: number }) => transfer.element_out
          ),
        },
        season_id: "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865",
      },
      select: {
        id: true,
        player_id: true,
      },
    });

    const inPlayerMap = new Map(
      inPlayers.map((player) => [player.player_id, player.id])
    );
    const outPlayerMap = new Map(
      outPlayers.map((player) => [player.player_id, player.id])
    );

    const formattedData = data.map((transfer: any) => {
      return {
        fpl_team_id: "53ed0ea1-7298-4069-b609-f8108468c885",
        in_player_id: inPlayerMap.get(transfer.element_in),
        in_player_cost: transfer.element_in_cost,
        out_player_id: outPlayerMap.get(transfer.element_out),
        out_player_cost: transfer.element_out_cost,
        time: transfer.time,
        gameweek: transfer.event,
      };
    });

    await prisma.fPLGameweekTransfers.createMany({
      data: formattedData,
      skipDuplicates: true,
    });
  });

  prisma.$disconnect();
} catch (e) {
  console.error(e);
  prisma.$disconnect();
}
