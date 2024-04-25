/*
  Warnings:

  - A unique constraint covering the columns `[fpl_player_id,fixture_id]` on the table `FPLGameweekPlayerStats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fixture_id` to the `FPLGameweekPlayerStats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FPLGameweekPlayerStats" ADD COLUMN     "fixture_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FPLGameweekPlayerStats_fpl_player_id_fixture_id_key" ON "FPLGameweekPlayerStats"("fpl_player_id", "fixture_id");
