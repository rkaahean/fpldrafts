/*
  Warnings:

  - You are about to drop the column `element` on the `FPLGameweekPicks` table. All the data in the column will be lost.
  - The primary key for the `FPLPlayer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `fpl_player_id` to the `FPLGameweekPicks` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `FPLPlayer` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `season_id` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fpl_season_id` to the `FPLTeam` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FPLGameweekPicks" DROP CONSTRAINT "FPLGameweekPicks_element_fkey";

-- DropIndex
DROP INDEX "FPLPlayer_player_id_key";

-- AlterTable
ALTER TABLE "FPLGameweekPicks" DROP COLUMN "element",
ADD COLUMN     "fpl_player_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FPLPlayer" DROP CONSTRAINT "FPLPlayer_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "season_id" TEXT NOT NULL,
ADD CONSTRAINT "FPLPlayer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "FPLTeam" ADD COLUMN     "fpl_season_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "FPLGameweekPlayerStats" (
    "id" TEXT NOT NULL,
    "fpl_player_id" TEXT NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "total_points" INTEGER NOT NULL,
    "goals_scored" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "expected_goals" DOUBLE PRECISION NOT NULL,
    "expected_assists" DOUBLE PRECISION NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "FPLGameweekPlayerStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FPLSeason" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "FPLSeason_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FPLPlayer" ADD CONSTRAINT "FPLPlayer_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "FPLSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FPLGameweekPicks" ADD CONSTRAINT "FPLGameweekPicks_fpl_player_id_fkey" FOREIGN KEY ("fpl_player_id") REFERENCES "FPLPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FPLGameweekPlayerStats" ADD CONSTRAINT "FPLGameweekPlayerStats_fpl_player_id_fkey" FOREIGN KEY ("fpl_player_id") REFERENCES "FPLPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FPLTeam" ADD CONSTRAINT "FPLTeam_fpl_season_id_fkey" FOREIGN KEY ("fpl_season_id") REFERENCES "FPLSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
