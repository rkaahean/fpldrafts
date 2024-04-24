/*
  Warnings:

  - A unique constraint covering the columns `[player_id]` on the table `FPLPlayer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FPLPlayer_player_id_key" ON "FPLPlayer"("player_id");
