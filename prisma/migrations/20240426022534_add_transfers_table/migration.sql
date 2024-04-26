-- CreateTable
CREATE TABLE "FPLGameweekTransfers" (
    "id" TEXT NOT NULL,
    "fpl_team_id" TEXT NOT NULL,
    "in_player_id" TEXT NOT NULL,
    "in_player_cost" INTEGER NOT NULL,
    "out_player_id" TEXT NOT NULL,
    "out_player_cost" INTEGER NOT NULL,
    "gameweek" INTEGER NOT NULL,

    CONSTRAINT "FPLGameweekTransfers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FPLGameweekTransfers" ADD CONSTRAINT "FPLGameweekTransfers_in_player_id_fkey" FOREIGN KEY ("in_player_id") REFERENCES "FPLPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FPLGameweekTransfers" ADD CONSTRAINT "FPLGameweekTransfers_out_player_id_fkey" FOREIGN KEY ("out_player_id") REFERENCES "FPLPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
