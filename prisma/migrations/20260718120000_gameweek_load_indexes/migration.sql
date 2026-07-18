-- CreateIndex
CREATE INDEX "FPLGameweekPlayerStats_fpl_player_id_gameweek_idx" ON "FPLGameweekPlayerStats"("fpl_player_id", "gameweek");

-- CreateIndex
CREATE INDEX "FPLGameweekTransfers_fpl_team_id_gameweek_idx" ON "FPLGameweekTransfers"("fpl_team_id", "gameweek");

-- CreateIndex
CREATE INDEX "FPLGameweekTransfers_fpl_team_id_in_player_id_idx" ON "FPLGameweekTransfers"("fpl_team_id", "in_player_id");
