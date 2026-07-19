import { FPLPlayer, FPLPlayerTeam } from "@prisma/client";
import prisma from "./lib/db";
import { runWithConcurrencyLimit } from "./lib/concurrency";

const PLAYER_WRITE_CONCURRENCY = 15;

function toFloat(value: unknown): number {
  return parseFloat(value as string);
}

function toNullableFloat(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return parseFloat(value as string);
}

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
      expected_goals: toFloat(player.expected_goals),
      expected_assists: toFloat(player.expected_assists),
      expected_goal_involvements: toFloat(player.expected_goal_involvements),
      expected_goals_per_90: toFloat(player.expected_goals_per_90),
      expected_assists_per_90: toFloat(player.expected_assists_per_90),
      expected_goal_involvements_per_90: toFloat(
        player.expected_goal_involvements_per_90
      ),
      total_points: player.total_points,
      minutes: player.minutes,
      now_value: player.now_cost,
      clean_sheets: player.clean_sheets,
      goals_conceded: player.goals_conceded,
      own_goals: player.own_goals,
      penalties_saved: player.penalties_saved,
      penalties_missed: player.penalties_missed,
      yellow_cards: player.yellow_cards,
      red_cards: player.red_cards,
      saves: player.saves,
      bonus: player.bonus,
      bps: player.bps,
      influence: toFloat(player.influence),
      creativity: toFloat(player.creativity),
      threat: toFloat(player.threat),
      ict_index: toFloat(player.ict_index),
      clearances_blocks_interceptions: player.clearances_blocks_interceptions,
      recoveries: player.recoveries,
      tackles: player.tackles,
      defensive_contribution: player.defensive_contribution,
      starts: player.starts,
      expected_goals_conceded: toFloat(player.expected_goals_conceded),
      saves_per_90: player.saves_per_90,
      expected_goals_conceded_per_90: player.expected_goals_conceded_per_90,
      goals_conceded_per_90: player.goals_conceded_per_90,
      starts_per_90: player.starts_per_90,
      clean_sheets_per_90: player.clean_sheets_per_90,
      defensive_contribution_per_90: player.defensive_contribution_per_90,
      selected_by_percent: toFloat(player.selected_by_percent),
      transfers_in: player.transfers_in,
      transfers_out: player.transfers_out,
      transfers_in_event: player.transfers_in_event,
      transfers_out_event: player.transfers_out_event,
      cost_change_event: player.cost_change_event,
      cost_change_start: player.cost_change_start,
      form: toFloat(player.form),
      points_per_game: toFloat(player.points_per_game),
      value_season: toFloat(player.value_season),
      value_form: toFloat(player.value_form),
      ep_next: toNullableFloat(player.ep_next),
      ep_this: toNullableFloat(player.ep_this),
      influence_rank: player.influence_rank,
      influence_rank_type: player.influence_rank_type,
      creativity_rank: player.creativity_rank,
      creativity_rank_type: player.creativity_rank_type,
      threat_rank: player.threat_rank,
      threat_rank_type: player.threat_rank_type,
      ict_index_rank: player.ict_index_rank,
      ict_index_rank_type: player.ict_index_rank_type,
      now_cost_rank: player.now_cost_rank,
      now_cost_rank_type: player.now_cost_rank_type,
      form_rank: player.form_rank,
      form_rank_type: player.form_rank_type,
      points_per_game_rank: player.points_per_game_rank,
      points_per_game_rank_type: player.points_per_game_rank_type,
      selected_rank: player.selected_rank,
      selected_rank_type: player.selected_rank_type,
      chance_of_playing_next_round: player.chance_of_playing_next_round,
      chance_of_playing_this_round: player.chance_of_playing_this_round,
      status: player.status,
      news: player.news,
      news_added: player.news_added ? new Date(player.news_added) : null,
      corners_and_indirect_freekicks_order:
        player.corners_and_indirect_freekicks_order,
      direct_freekicks_order: player.direct_freekicks_order,
      penalties_order: player.penalties_order,
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
      strength_overall_home: team.strength_overall_home,
      strength_overall_away: team.strength_overall_away,
      strength_attack_home: team.strength_attack_home,
      strength_attack_away: team.strength_attack_away,
      strength_defence_home: team.strength_defence_home,
      strength_defence_away: team.strength_defence_away,
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
