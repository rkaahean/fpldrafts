import { FPLPlayer, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function getData() {
  return fetch("https://fantasy.premierleague.com/api/bootstrap-static/")
    .then((res) => res.json())
    .then((data) => {
      return parseBoostrapData(data);
    })
    .then(async (players) => {
      await prisma.fPLPlayer.createMany({
        data: players,
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function parseBoostrapData(data: any): FPLPlayer[] {
  const elements = data["elements"];

  // get player info
  const players: FPLPlayer[] = elements.map((player: any) => {
    return {
      player_id: player.id,
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
    };
  });
  return players;
}

try {
  getData();
} catch (e) {
  console.error(e);
}
