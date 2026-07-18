import { FPLPlayer, FPLPlayerTeam } from "@prisma/client";
import prisma from "./lib/db";
import { runWithConcurrencyLimit } from "./lib/concurrency";

const PLAYER_WRITE_CONCURRENCY = 15;

function parseBoostrapData(data: any): {
  players: FPLPlayer[];
  teams: FPLPlayerTeam[];
} {
  const elements = data["elements"];
  const teams = data["teams"];

  const players: FPLPlayer[] = elements.map((player: any) => {
    return {
      player_id: player.id,
      season_id: process.env.FPL_SEASON_ID!,
      web_name: player.web_name,
      team: player.team,
      element_type: player.element_type,
      team_code: player.team_code,
      first_name: player.first_name,
      second_name: player.second_name,
      goals_scored: player.goals_scored,
      assists: player.assists,
      expected_goals: parseFloat(player.expected_goals),
      expected_assists: parseFloat(player.expected_assists),
      expected_goal_involvements: parseFloat(player.expected_goal_involvements),
      expected_goals_per_90: parseFloat(player.expected_goals_per_90),
      expected_assists_per_90: parseFloat(player.expected_assists_per_90),
      expected_goal_involvements_per_90: parseFloat(
        player.expected_goal_involvements_per_90
      ),
      total_points: player.total_points,
      minutes: player.minutes,
      now_value: player.now_cost,
    };
  });

  const teamsData: FPLPlayerTeam[] = teams.map((team: any) => {
    return {
      season_id: process.env.FPL_SEASON_ID!,
      name: team.name,
      short_name: team.short_name,
      code: team.code,
      strength: team.strength,
      team_id: team.id,
    };
  });
  return {
    players,
    teams: teamsData,
  };
}

export async function syncBootstrapData() {
  const data = await fetch(
    "https://fantasy.premierleague.com/api/bootstrap-static/"
  ).then((res) => res.json());

  const { players, teams } = parseBoostrapData(data);

  await Promise.all(
    teams.map((team) =>
      prisma.fPLPlayerTeam.upsert({
        where: {
          season_id_code: {
            season_id: process.env.FPL_SEASON_ID!,
            code: team.code,
          },
        },
        update: team,
        create: team,
      })
    )
  );

  const existingPlayers = await prisma.fPLPlayer.findMany({
    select: { player_id: true },
    where: { season_id: process.env.FPL_SEASON_ID! },
  });
  const existingPlayerIds = new Set(existingPlayers.map((p) => p.player_id));

  const playersToCreate: FPLPlayer[] = [];
  const playersToUpdate: FPLPlayer[] = [];

  for (const player of players) {
    if (existingPlayerIds.has(player.player_id)) {
      playersToUpdate.push(player);
    } else {
      playersToCreate.push(player);
    }
  }

  if (playersToCreate.length > 0) {
    await prisma.fPLPlayer.createMany({
      data: playersToCreate,
    });
  }

  await runWithConcurrencyLimit(
    playersToUpdate,
    PLAYER_WRITE_CONCURRENCY,
    (player) =>
      prisma.fPLPlayer.update({
        where: {
          player_id_season_id: {
            player_id: player.player_id,
            season_id: process.env.FPL_SEASON_ID!,
          },
        },
        data: player,
      })
  );
}

if (require.main === module) {
  syncBootstrapData()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
