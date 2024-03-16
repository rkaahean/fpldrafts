-- CreateTable
CREATE TABLE "FPLGameweekPicks" (
    "id" TEXT NOT NULL,
    "fpl_team_id" TEXT NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "element" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "multiplier" INTEGER NOT NULL,
    "is_captain" BOOLEAN NOT NULL,
    "is_vice_captain" BOOLEAN NOT NULL,

    CONSTRAINT "FPLGameweekPicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FPLTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,

    CONSTRAINT "FPLTeam_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FPLGameweekPicks" ADD CONSTRAINT "FPLGameweekPicks_fpl_team_id_fkey" FOREIGN KEY ("fpl_team_id") REFERENCES "FPLTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
