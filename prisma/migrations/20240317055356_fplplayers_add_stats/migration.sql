/*
  Warnings:

  - Added the required column `assists` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expected_assists` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expected_assists_per_90` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expected_goal_involvements` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expected_goal_involvements_per_90` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expected_goals` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expected_goals_per_90` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goals_scored` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_points` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FPLPlayer" ADD COLUMN     "assists" INTEGER NOT NULL,
ADD COLUMN     "expected_assists" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "expected_assists_per_90" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "expected_goal_involvements" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "expected_goal_involvements_per_90" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "expected_goals" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "expected_goals_per_90" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "goals_scored" INTEGER NOT NULL,
ADD COLUMN     "total_points" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "FPLGameweekPicks" ADD CONSTRAINT "FPLGameweekPicks_element_fkey" FOREIGN KEY ("element") REFERENCES "FPLPlayer"("player_id") ON DELETE RESTRICT ON UPDATE CASCADE;
