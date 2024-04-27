/*
  Warnings:

  - Added the required column `bank` to the `FPLDrafts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FPLDrafts" ADD COLUMN     "bank" INTEGER NOT NULL;
