/*
  Warnings:

  - A unique constraint covering the columns `[fpl_draft_id,gameweek,player_in_id,player_out_id]` on the table `FPLDraftTransfers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FPLDraftTransfers_gameweek_player_in_id_player_out_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "FPLDraftTransfers_fpl_draft_id_gameweek_player_in_id_player_key" ON "FPLDraftTransfers"("fpl_draft_id", "gameweek", "player_in_id", "player_out_id");
