-- AlterTable
ALTER TABLE "FPLDraftTransfers" ALTER COLUMN "player_in_id" SET DATA TYPE TEXT,
ALTER COLUMN "player_out_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "FPLDraftTransfers" ADD CONSTRAINT "FPLDraftTransfers_player_in_id_fkey" FOREIGN KEY ("player_in_id") REFERENCES "FPLPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FPLDraftTransfers" ADD CONSTRAINT "FPLDraftTransfers_player_out_id_fkey" FOREIGN KEY ("player_out_id") REFERENCES "FPLPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
