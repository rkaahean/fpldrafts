/*
  Warnings:

  - Made the column `now_value` on table `FPLPlayer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FPLPlayer" ALTER COLUMN "now_value" SET NOT NULL;
