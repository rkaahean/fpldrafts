import { FPLGameweekPicks } from "@prisma/client";
import prisma from "./lib/db";

type JSONResponsePicks = Omit<FPLGameweekPicks, "id">[];
type JSONResponseHistory = NonNullable<
  Awaited<ReturnType<typeof parseHistoryData>>
>;

function getPicksData(
  fpl_team_numer: number,
  gameweek: number,
  teamId: string
) {
  return fetch(
    `https://fantasy.premierleague.com/api/entry/${fpl_team_numer}/event/${gameweek}/picks/`
  )
    .then((res) => res.json())
    .then(async (data) => {
      if (data["detail"] != "Not found.") {
        return {
          picks: await parsePicksData(data, gameweek, teamId),
          history: await parseHistoryData(data, gameweek, teamId),
        };
      }
    })
    .catch((e) => {
      console.log("Error processing picks data...", e);
      return {
        picks: undefined,
        history: undefined,
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
  gameweek: number,
  teamId: string
): Promise<JSONResponsePicks | undefined> {
  if (data["detail"] !== "Not found.") {
    const picks = data["picks"];
    const elementIds = picks.map((pick: any) => pick.element);

    const players = await prisma.fPLPlayer.findMany({
      where: {
        player_id: {
          in: elementIds,
        },
        season_id: process.env.FPL_SEASON_ID!,
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
      fpl_team_id: teamId,
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

async function parseHistoryData(data: any, gameweek: number, teamId: string) {
  if (data["detail"] != "Not found.") {
    let history = data["entry_history"];

    return {
      fpl_team_id: teamId,
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

export async function updateFPLTeamData(
  team_id: string,
  fpl_team_number: number
) {
  const data = [];
  const picks: JSONResponsePicks = [];
  const history: JSONResponseHistory[] = [];

  for (let i = 1; i <= 38; i++) {
    const gameweekData = getPicksData(fpl_team_number, i, team_id);
    data.push(gameweekData);
  }

  const alldata = await Promise.all(data);
  const validData = alldata.filter((gameweekData) => !!gameweekData);

  console.log(validData);
  validData.map(async (data) => {
    if (!data) {
      return;
    }
    // data.map((gw) => {
    picks.push(...data.picks!);
    history.push(data.history!);
    // });

    console.log("Inserting picks...", picks.length);
    await prisma.fPLGameweekPicks.createMany({
      data: picks,
      skipDuplicates: true,
    });

    console.log("Inserting overall stats...", history.length);
    console.log(history);
    await Promise.all(
      history.map(async (gameweekStat) => {
        await prisma.fPLGameweekOverallStats.upsert({
          where: {
            fpl_team_id_gameweek: {
              fpl_team_id: team_id,
              gameweek: gameweekStat.gameweek,
            },
          },
          update: gameweekStat,
          create: gameweekStat,
        });
      })
    );
  });

  console.log("Inserting transfer data...");
  await getTransfersData(fpl_team_number).then(async (data) => {
    const inPlayers = await prisma.fPLPlayer.findMany({
      where: {
        player_id: {
          in: data.map(
            (transfer: { element_in: number }) => transfer.element_in
          ),
        },
        season_id: process.env.FPL_SEASON_ID!,
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
        season_id: process.env.FPL_SEASON_ID!,
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
        fpl_team_id: team_id,
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
}
