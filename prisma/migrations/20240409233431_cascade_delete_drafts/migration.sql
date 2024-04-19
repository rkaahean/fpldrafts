-- DropForeignKey
ALTER TABLE "FPLDraftTransfers" DROP CONSTRAINT "FPLDraftTransfers_fpl_draft_id_fkey";

-- AddForeignKey
ALTER TABLE "FPLDraftTransfers" ADD CONSTRAINT "FPLDraftTransfers_fpl_draft_id_fkey" FOREIGN KEY ("fpl_draft_id") REFERENCES "FPLDrafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
