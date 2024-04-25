/*
  Warnings:

  - You are about to alter the column `gameweek_rank` on the `FPLGameweekOverallStats` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `overall_rank` on the `FPLGameweekOverallStats` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "FPLGameweekOverallStats" ALTER COLUMN "gameweek_rank" SET DATA TYPE INTEGER,
ALTER COLUMN "overall_rank" SET DATA TYPE INTEGER;
