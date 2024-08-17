/*
  Warnings:

  - A unique constraint covering the columns `[fpl_player_id,fixture_id]` on the table `FPLGameweekPlayerStats` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FPLGameweekPlayerStats_fpl_player_id_gameweek_key";

-- CreateIndex
CREATE UNIQUE INDEX "FPLGameweekPlayerStats_fpl_player_id_fixture_id_key" ON "FPLGameweekPlayerStats"("fpl_player_id", "fixture_id");
