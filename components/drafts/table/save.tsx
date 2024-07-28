"use client";

import { picksStore } from "@/app/store";
import { DownloadIcon } from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
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
  const picks = picksStore((state) => state.picks);
  const [open, setOpen] = useState(false);
  const [draftName, setDraftName] = useState("GW 27 draft");
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
          size="xs"
          title="Save Draft"
          disabled={drafts.changes.length == 0}
        >
          <DownloadIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
              defaultValue="GW 27 draft"
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
            className="h-8 w-24 text-xs"
            onClick={async () => {
              // console.log(drafts.changes);
              // console.log("Saving draft...", drafts.changes);
              await fetch("/api/drafts/create", {
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
              });
              queryClient.invalidateQueries({
                queryKey: ["draftsget"],
              });
              setOpen(false);
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
