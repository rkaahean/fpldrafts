-- AddForeignKey
ALTER TABLE "FPLFixtures" ADD CONSTRAINT "FPLFixtures_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "FPLSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FPLFixtures" ADD CONSTRAINT "FPLFixtures_team_h_id_fkey" FOREIGN KEY ("team_h_id") REFERENCES "FPLPlayerTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FPLFixtures" ADD CONSTRAINT "FPLFixtures_team_a_id_fkey" FOREIGN KEY ("team_a_id") REFERENCES "FPLPlayerTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
