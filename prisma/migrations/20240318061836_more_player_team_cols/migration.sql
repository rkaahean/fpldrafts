/*
  Warnings:

  - You are about to drop the column `team_code` on the `FPLPlayerTeam` table. All the data in the column will be lost.
  - Made the column `team_h_difficulty` on table `FPLFixtures` required. This step will fail if there are existing NULL values in that column.
  - Made the column `team_a_difficulty` on table `FPLFixtures` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `code` to the `FPLPlayerTeam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_id` to the `FPLPlayerTeam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FPLFixtures" ALTER COLUMN "team_h_difficulty" SET NOT NULL,
ALTER COLUMN "team_a_difficulty" SET NOT NULL;

-- AlterTable
ALTER TABLE "FPLPlayerTeam" DROP COLUMN "team_code",
ADD COLUMN     "code" INTEGER NOT NULL,
ADD COLUMN     "team_id" INTEGER NOT NULL;
