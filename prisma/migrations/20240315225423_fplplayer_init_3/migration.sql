/*
  Warnings:

  - The primary key for the `FPLPlayer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `FPLPlayer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[player_id]` on the table `FPLPlayer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FPLPlayer" DROP CONSTRAINT "FPLPlayer_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "FPLPlayer_player_id_key" ON "FPLPlayer"("player_id");
