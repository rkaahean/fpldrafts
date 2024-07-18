-- DropForeignKey
ALTER TABLE "FPLPlayer" DROP CONSTRAINT "FPLPlayer_team_code_fkey";

-- DropIndex
DROP INDEX "FPLPlayerTeam_code_key";
