-- CreateTable
CREATE TABLE "FPLGameweekOverallStats" (
    "id" TEXT NOT NULL,
    "fpl_team_id" TEXT NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "bank" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "total_points" INTEGER NOT NULL,
    "gameweek_rank" BIGINT NOT NULL,
    "overall_rank" BIGINT NOT NULL,
    "event_transfers" INTEGER NOT NULL,
    "event_transfers_cost" INTEGER NOT NULL,

    CONSTRAINT "FPLGameweekOverallStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FPLGameweekOverallStats_fpl_team_id_gameweek_key" ON "FPLGameweekOverallStats"("fpl_team_id", "gameweek");
