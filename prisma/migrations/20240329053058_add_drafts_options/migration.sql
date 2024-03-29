/*
  Warnings:

  - You are about to drop the column `gameweek` on the `FPLDrafts` table. All the data in the column will be lost.
  - You are about to drop the column `transfers` on the `FPLDrafts` table. All the data in the column will be lost.
  - Added the required column `name` to the `FPLDrafts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FPLDrafts" DROP COLUMN "gameweek",
DROP COLUMN "transfers",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;
