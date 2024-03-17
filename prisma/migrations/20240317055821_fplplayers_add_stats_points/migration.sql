/*
  Warnings:

  - Added the required column `minutes` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FPLPlayer" ADD COLUMN     "minutes" INTEGER NOT NULL;
