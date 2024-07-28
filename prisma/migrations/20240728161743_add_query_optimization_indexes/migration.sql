-- DropIndex
DROP INDEX "FPLFixtures_team_a_score_idx";

-- CreateIndex
CREATE INDEX "FPLFixtures_team_a_id_idx" ON "FPLFixtures"("team_a_id");

-- CreateIndex
CREATE INDEX "FPLFixtures_season_id_team_h_id_idx" ON "FPLFixtures"("season_id", "team_h_id");

-- CreateIndex
CREATE INDEX "FPLFixtures_season_id_team_a_id_idx" ON "FPLFixtures"("season_id", "team_a_id");

-- CreateIndex
CREATE INDEX "FPLGameweekPlayerStats_fpl_player_id_value_idx" ON "FPLGameweekPlayerStats"("fpl_player_id", "value");

-- CreateIndex
CREATE INDEX "FPLPlayer_player_id_idx" ON "FPLPlayer"("player_id");

-- CreateIndex
CREATE INDEX "FPLPlayer_season_id_player_id_idx" ON "FPLPlayer"("season_id", "player_id");

-- CreateIndex
CREATE INDEX "FPLPlayerTeam_code_season_id_idx" ON "FPLPlayerTeam"("code", "season_id");

-- CreateIndex
CREATE INDEX "FPLPlayerTeam_id_short_name_idx" ON "FPLPlayerTeam"("id", "short_name");
