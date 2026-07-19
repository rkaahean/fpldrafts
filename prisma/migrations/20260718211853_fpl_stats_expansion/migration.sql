/*
  Warnings:

  - Added the required column `bonus` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bps` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clean_sheets` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clearances_blocks_interceptions` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creativity` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defensive_contribution` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expected_goals_conceded` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goals_conceded` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ict_index` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `influence` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opponent_team` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `own_goals` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penalties_missed` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penalties_saved` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recoveries` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `red_cards` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saves` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selected` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `starts` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tackles` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threat` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transfers_balance` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transfers_in` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transfers_out` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `was_home` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yellow_cards` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bonus` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bps` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clean_sheets` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clean_sheets_per_90` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clearances_blocks_interceptions` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cost_change_event` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cost_change_start` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creativity` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defensive_contribution` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defensive_contribution_per_90` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expected_goals_conceded` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expected_goals_conceded_per_90` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `form` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goals_conceded` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goals_conceded_per_90` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ict_index` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `influence` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `own_goals` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penalties_missed` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penalties_saved` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `points_per_game` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recoveries` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `red_cards` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saves` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saves_per_90` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selected_by_percent` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `starts` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `starts_per_90` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tackles` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threat` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transfers_in` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transfers_in_event` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transfers_out` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transfers_out_event` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value_form` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value_season` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yellow_cards` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strength_attack_away` to the `FPLPlayerTeam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strength_attack_home` to the `FPLPlayerTeam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strength_defence_away` to the `FPLPlayerTeam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strength_defence_home` to the `FPLPlayerTeam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strength_overall_away` to the `FPLPlayerTeam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strength_overall_home` to the `FPLPlayerTeam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FPLGameweekPlayerStats" ADD COLUMN     "bonus" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bps" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "clean_sheets" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "clearances_blocks_interceptions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "creativity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "defensive_contribution" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expected_goals_conceded" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "goals_conceded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ict_index" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "influence" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "kickoff_time" TIMESTAMP(3),
ADD COLUMN     "opponent_team" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "own_goals" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "penalties_missed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "penalties_saved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "recoveries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "red_cards" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "saves" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "selected" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "starts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tackles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "team_a_score" INTEGER,
ADD COLUMN     "team_h_score" INTEGER,
ADD COLUMN     "threat" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "transfers_balance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transfers_in" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transfers_out" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "was_home" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "yellow_cards" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "FPLPlayer" ADD COLUMN     "bonus" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bps" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "chance_of_playing_next_round" INTEGER,
ADD COLUMN     "chance_of_playing_this_round" INTEGER,
ADD COLUMN     "clean_sheets" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "clean_sheets_per_90" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "clearances_blocks_interceptions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "corners_and_indirect_freekicks_order" INTEGER,
ADD COLUMN     "cost_change_event" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cost_change_start" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "creativity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "creativity_rank" INTEGER,
ADD COLUMN     "creativity_rank_type" INTEGER,
ADD COLUMN     "defensive_contribution" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "defensive_contribution_per_90" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "direct_freekicks_order" INTEGER,
ADD COLUMN     "ep_next" DOUBLE PRECISION,
ADD COLUMN     "ep_this" DOUBLE PRECISION,
ADD COLUMN     "expected_goals_conceded" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "expected_goals_conceded_per_90" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "form" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "form_rank" INTEGER,
ADD COLUMN     "form_rank_type" INTEGER,
ADD COLUMN     "goals_conceded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "goals_conceded_per_90" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ict_index" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ict_index_rank" INTEGER,
ADD COLUMN     "ict_index_rank_type" INTEGER,
ADD COLUMN     "influence" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "influence_rank" INTEGER,
ADD COLUMN     "influence_rank_type" INTEGER,
ADD COLUMN     "news" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "news_added" TIMESTAMP(3),
ADD COLUMN     "now_cost_rank" INTEGER,
ADD COLUMN     "now_cost_rank_type" INTEGER,
ADD COLUMN     "own_goals" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "penalties_missed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "penalties_order" INTEGER,
ADD COLUMN     "penalties_saved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "points_per_game" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "points_per_game_rank" INTEGER,
ADD COLUMN     "points_per_game_rank_type" INTEGER,
ADD COLUMN     "recoveries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "red_cards" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "saves" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "saves_per_90" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "selected_by_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "selected_rank" INTEGER,
ADD COLUMN     "selected_rank_type" INTEGER,
ADD COLUMN     "starts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "starts_per_90" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'a',
ADD COLUMN     "tackles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "threat" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "threat_rank" INTEGER,
ADD COLUMN     "threat_rank_type" INTEGER,
ADD COLUMN     "transfers_in" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transfers_in_event" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transfers_out" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transfers_out_event" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "value_form" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "value_season" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "yellow_cards" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "FPLPlayerTeam" ADD COLUMN     "strength_attack_away" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "strength_attack_home" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "strength_defence_away" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "strength_defence_home" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "strength_overall_away" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "strength_overall_home" INTEGER NOT NULL DEFAULT 0;
