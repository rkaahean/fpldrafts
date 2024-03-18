/*
  Warnings:

  - You are about to drop the column `year` on the `FPLTeam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FPLTeam" DROP COLUMN "year";

-- CreateTable
CREATE TABLE "FPLFixtures" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "fixture_id" INTEGER NOT NULL,
    "finished" BOOLEAN NOT NULL,
    "team_h_id" TEXT NOT NULL,
    "team_a_id" TEXT NOT NULL,
    "event" INTEGER,
    "team_h_score" INTEGER,
    "team_a_score" INTEGER,
    "team_h_difficulty" INTEGER,
    "team_a_difficulty" INTEGER,

    CONSTRAINT "FPLFixtures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FPLPlayerTeam" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "team_code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "strength" INTEGER NOT NULL,

    CONSTRAINT "FPLPlayerTeam_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FPLFixtures" ADD CONSTRAINT "FPLFixtures_team_h_id_fkey" FOREIGN KEY ("team_h_id") REFERENCES "FPLTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FPLFixtures" ADD CONSTRAINT "FPLFixtures_team_a_id_fkey" FOREIGN KEY ("team_a_id") REFERENCES "FPLTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FPLPlayerTeam" ADD CONSTRAINT "FPLPlayerTeam_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "FPLSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
