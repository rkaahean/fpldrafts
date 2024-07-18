/*
  Warnings:

  - A unique constraint covering the columns `[season_id,code]` on the table `FPLFixtures` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FPLFixtures_code_key";

-- CreateIndex
CREATE UNIQUE INDEX "FPLFixtures_season_id_code_key" ON "FPLFixtures"("season_id", "code");
