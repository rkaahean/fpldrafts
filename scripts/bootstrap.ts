import { FPLPlayer, FPLPlayerTeam, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function getData() {
  return fetch("https://fantasy.premierleague.com/api/bootstrap-static/")
    .then((res) => res.json())
    .then((data) => {
      return parseBoostrapData(data);
    })
    .then(async (data) => {
      const { players, teams } = data;

      console.log("Updating player teams...");
      // upsert player team data.
      teams.map(async (team) => {
        await prisma.fPLPlayerTeam.upsert({
          where: {
            season_id_code: {
              season_id: process.env.FPL_SEASON_ID!,
              code: team.code,
            },
          },
          update: team,
          create: team,
        });
      });

      // upsert fpl player data
      // Step 1: Fetch existing player IDs
      console.log("Finding existing players...");
      const existingPlayers = await prisma.fPLPlayer.findMany({
        select: { player_id: true },
        where: { season_id: process.env.FPL_SEASON_ID! },
      });
      const existingPlayerIds = new Set(
        existingPlayers.map((p) => p.player_id)
      );

      // Step 2: Separate players to create and update
      const playersToCreate: FPLPlayer[] = [];
      const playersToUpdate: FPLPlayer[] = [];

      for (const player of data.players) {
        if (existingPlayerIds.has(player.player_id)) {
          playersToUpdate.push(player);
        } else {
          playersToCreate.push(player);
        }
      }

      // Step 3: Bulk create new players
      if (playersToCreate.length > 0) {
        console.log("Creating new players...", playersToCreate.length);
        await prisma.fPLPlayer.createMany({
          data: playersToCreate,
        });
      }

      // Step 4: Bulk update existing players
      console.log("Updating existing players...", playersToUpdate.length);
      await prisma.$transaction(
        async (tx) => {
          for (const player of playersToUpdate) {
            await tx.fPLPlayer.update({
              where: {
                player_id_season_id: {
                  player_id: player.player_id,
                  season_id: process.env.FPL_SEASON_ID!,
                },
              },
              data: player,
            });
          }
        },
        {
          timeout: 1000000,
        }
      );
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function parseBoostrapData(data: any): {
  players: FPLPlayer[];
  teams: FPLPlayerTeam[];
} {
  const elements = data["elements"];
  const teams = data["teams"];

  console.log("Parsing bootstrap data into teams and players...");
  // get player info
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

try {
  getData();
  prisma.$disconnect();
} catch (e) {
  console.error(e);
}
