/*
  Warnings:

  - You are about to drop the column `name` on the `FPLPlayer` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `second_name` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FPLPlayer" DROP COLUMN "name",
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "second_name" TEXT NOT NULL;
