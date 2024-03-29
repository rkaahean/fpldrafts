"use client";

import { picksStore } from "@/app/store/picks";
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

export default function DraftSave() {
  const drafts = picksStore((state) => state.drafts);
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="xs">
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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="username"
              defaultValue="A draft for chip strategy"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            className="h-8 w-24 text-xs"
            onClick={async () => {
              console.log("Saving draft...");
              await fetch("/drafts", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  changes: drafts.changes,
                  name: "GW 27 draft",
                  team_id: "53ed0ea1-7298-4069-b609-f8108468c885",
                  description: "A draft for chip strategy",
                  gameweek: 27,
                }),
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
