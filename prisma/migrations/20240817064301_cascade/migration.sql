-- DropForeignKey
ALTER TABLE "FPLGameweekPicks" DROP CONSTRAINT "FPLGameweekPicks_fpl_team_id_fkey";

-- AddForeignKey
ALTER TABLE "FPLGameweekPicks" ADD CONSTRAINT "FPLGameweekPicks_fpl_team_id_fkey" FOREIGN KEY ("fpl_team_id") REFERENCES "FPLTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
