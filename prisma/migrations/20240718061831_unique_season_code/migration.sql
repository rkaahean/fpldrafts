/*
  Warnings:

  - A unique constraint covering the columns `[season_id,code]` on the table `FPLPlayerTeam` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FPLPlayerTeam_season_id_code_key" ON "FPLPlayerTeam"("season_id", "code");
