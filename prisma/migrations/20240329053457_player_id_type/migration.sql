/*
  Warnings:

  - Changed the type of `player_in_id` on the `FPLDraftTransfers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `player_out_id` on the `FPLDraftTransfers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "FPLDraftTransfers" DROP COLUMN "player_in_id",
ADD COLUMN     "player_in_id" INTEGER NOT NULL,
DROP COLUMN "player_out_id",
ADD COLUMN     "player_out_id" INTEGER NOT NULL;
