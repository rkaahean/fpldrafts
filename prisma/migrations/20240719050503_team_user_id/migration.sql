/*
  Warnings:

  - Added the required column `user_id` to the `FPLTeam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FPLTeam" ADD COLUMN     "user_id" TEXT NOT NULL DEFAULT 'clyrhua1e0000e1gb59xwey2o';

-- AddForeignKey
ALTER TABLE "FPLTeam" ADD CONSTRAINT "FPLTeam_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
