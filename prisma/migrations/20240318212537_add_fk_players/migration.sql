/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `FPLPlayerTeam` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FPLPlayerTeam_code_key" ON "FPLPlayerTeam"("code");

-- AddForeignKey
ALTER TABLE "FPLPlayer" ADD CONSTRAINT "FPLPlayer_team_code_fkey" FOREIGN KEY ("team_code") REFERENCES "FPLPlayerTeam"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
