-- CreateTable
CREATE TABLE "FPLDrafts" (
    "id" TEXT NOT NULL,
    "fpl_team_id" TEXT NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "base_gameweek" INTEGER NOT NULL,
    "transfers" INTEGER NOT NULL,

    CONSTRAINT "FPLDrafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FPLDraftTransfers" (
    "id" TEXT NOT NULL,
    "fpl_draft_id" TEXT NOT NULL,
    "player_in_id" TEXT NOT NULL,
    "player_out_id" TEXT NOT NULL,
    "gameweek" INTEGER NOT NULL,

    CONSTRAINT "FPLDraftTransfers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FPLDraftTransfers" ADD CONSTRAINT "FPLDraftTransfers_fpl_draft_id_fkey" FOREIGN KEY ("fpl_draft_id") REFERENCES "FPLDrafts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
