/*
  Warnings:

  - You are about to drop the column `elementType` on the `FPLPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `teamCode` on the `FPLPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `webName` on the `FPLPlayer` table. All the data in the column will be lost.
  - Added the required column `element_type` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_code` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `web_name` to the `FPLPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FPLPlayer" DROP COLUMN "elementType",
DROP COLUMN "teamCode",
DROP COLUMN "webName",
ADD COLUMN     "element_type" INTEGER NOT NULL,
ADD COLUMN     "team_code" INTEGER NOT NULL,
ADD COLUMN     "web_name" TEXT NOT NULL;
