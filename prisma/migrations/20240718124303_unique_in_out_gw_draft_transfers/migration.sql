/*
  Warnings:

  - A unique constraint covering the columns `[gameweek,player_in_id,player_out_id]` on the table `FPLDraftTransfers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FPLDraftTransfers_gameweek_player_in_id_player_out_id_key" ON "FPLDraftTransfers"("gameweek", "player_in_id", "player_out_id");
