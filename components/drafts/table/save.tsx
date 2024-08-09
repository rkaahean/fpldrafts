"use client";

import { picksStore } from "@/app/store";
import { DownloadIcon } from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export default function DraftSave() {
  const drafts = picksStore((state) => state.drafts);
  const setDrafts = picksStore((state) => state.setDrafts);

  const picks = picksStore((state) => state.picks);
  const gameweek = picksStore((state) => state.currentGameweek);

  const [open, setOpen] = useState(false);
  const [draftName, setDraftName] = useState(`GW ${gameweek} draft`);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [draftDescription, setDraftDescription] = useState(
    "A draft for chip strategy"
  );

  const { data: session } = useSession();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-6 px-2 py-1 text-xs rounded-sm 2xl:h-10 2xl:px-4 2xl:py-2"
          title="Save Draft"
          disabled={drafts.changes.length == 0}
        >
          <DownloadIcon className="w-4 h-4 2xl:w-8 2xl:h-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] 2xl:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Save draft</DialogTitle>
          <DialogDescription>
            Make changes to your draft here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={draftName}
              className="col-span-3"
              onChange={(e) => setDraftName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              defaultValue="A draft for chip strategy"
              className="col-span-3"
              onChange={(e) => setDraftDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            className="h-8 w-24 text-xs 2xl:h-12 2xl:w-32 2xl:text-base"
            onClick={async () => {
              // console.log(drafts.changes);
              // console.log("Saving draft...", drafts.changes);
              setLoading(true);
              const response = await fetch("/api/drafts/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({
                  changes: drafts.changes,
                  name: draftName,
                  description: draftDescription,
                  gameweek: Math.min(
                    ...drafts.changes.map((draft) => draft.gameweek)
                  ),
                  bank: picks?.overall.bank,
                }),
              }).then((res) => res.json());

              // setting the current drafts with the id
              setDrafts({
                id: response.id,
                name: draftName,
                changes: drafts.changes,
                description: draftDescription,
                bank: picks?.overall.bank,
              });

              queryClient.invalidateQueries({
                queryKey: ["draftsget"],
              });
              setLoading(false);
              setOpen(false);
            }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
