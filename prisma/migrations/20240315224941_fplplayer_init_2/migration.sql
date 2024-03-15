/*
  Warnings:

  - Added the required column `player_id` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FPLPlayer" ADD COLUMN     "player_id" INTEGER NOT NULL;
