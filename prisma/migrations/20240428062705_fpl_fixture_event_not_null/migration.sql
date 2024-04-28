/*
  Warnings:

  - Made the column `event` on table `FPLFixtures` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FPLFixtures" ALTER COLUMN "event" SET NOT NULL;
