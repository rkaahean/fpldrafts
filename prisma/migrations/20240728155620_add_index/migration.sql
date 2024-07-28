-- CreateIndex
CREATE INDEX "FPLFixtures_season_id_idx" ON "FPLFixtures"("season_id");

-- CreateIndex
CREATE INDEX "FPLFixtures_team_h_id_idx" ON "FPLFixtures"("team_h_id");

-- CreateIndex
CREATE INDEX "FPLFixtures_team_a_score_idx" ON "FPLFixtures"("team_a_score");

-- CreateIndex
CREATE INDEX "FPLPlayer_season_id_idx" ON "FPLPlayer"("season_id");

-- CreateIndex
CREATE INDEX "FPLPlayer_team_season_id_idx" ON "FPLPlayer"("team", "season_id");

-- CreateIndex
CREATE INDEX "FPLPlayerTeam_season_id_idx" ON "FPLPlayerTeam"("season_id");
