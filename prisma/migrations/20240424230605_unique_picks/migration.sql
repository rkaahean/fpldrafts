/*
  Warnings:

  - A unique constraint covering the columns `[fpl_team_id,gameweek,position]` on the table `FPLGameweekPicks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FPLGameweekPicks_fpl_team_id_gameweek_position_key" ON "FPLGameweekPicks"("fpl_team_id", "gameweek", "position");
