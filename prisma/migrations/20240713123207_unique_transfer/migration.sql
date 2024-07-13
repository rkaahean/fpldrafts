/*
  Warnings:

  - A unique constraint covering the columns `[in_player_id,out_player_id,time]` on the table `FPLGameweekTransfers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FPLGameweekTransfers_in_player_id_out_player_id_time_key" ON "FPLGameweekTransfers"("in_player_id", "out_player_id", "time");
