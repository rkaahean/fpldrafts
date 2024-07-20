"use client";

import { revalidateDrafts } from "@/app/actions";
import { picksStore } from "@/app/store";
import { DownloadIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function DraftSave(props: { teamId: string }) {
  const drafts = picksStore((state) => state.drafts);
  const picks = picksStore((state) => state.picks);
  const [open, setOpen] = useState(false);
  const [draftName, setDraftName] = useState("GW 27 draft");
  const [draftDescription, setDraftDescription] = useState(
    "A draft for chip strategy"
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="xs" title="Save Draft">
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
              console.log(drafts.changes);
              console.log("Saving draft...", drafts.changes);
              await fetch("/api/drafts/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  changes: drafts.changes,
                  name: draftName,
                  team_id: props.teamId,
                  description: draftDescription,
                  gameweek: Math.min(
                    ...drafts.changes.map((draft) => draft.gameweek)
                  ),
                  bank: picks?.overall.bank,
                }),
              });
              setOpen(false);
              revalidateDrafts();
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
