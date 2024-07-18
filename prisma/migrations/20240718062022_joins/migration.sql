-- AddForeignKey
ALTER TABLE "FPLPlayer" ADD CONSTRAINT "FPLPlayer_team_code_season_id_fkey" FOREIGN KEY ("team_code", "season_id") REFERENCES "FPLPlayerTeam"("code", "season_id") ON DELETE RESTRICT ON UPDATE CASCADE;
