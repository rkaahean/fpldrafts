/*
  Warnings:

  - Added the required column `in_cost` to the `FPLDraftTransfers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `out_cost` to the `FPLDraftTransfers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FPLDraftTransfers" ADD COLUMN     "in_cost" INTEGER NOT NULL,
ADD COLUMN     "out_cost" INTEGER NOT NULL;
