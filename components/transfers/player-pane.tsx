"use client";

import { picksStore } from "@/app/store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { elementTypeToPosition } from "@/scripts/lib/utils";
import { UsersRound } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { isMobile } from "react-device-detect";
import { Button } from "../ui/button";
import { PlayerDrawerCloseProvider } from "./player-drawer-context";

export default function PlayerPane({ children }: { children: ReactNode }) {
  const [manualOpen, setManualOpen] = useState(false);
  const activeSlotId = picksStore((store) => store.activeSlotId);
  const setActiveSlot = picksStore((store) => store.setActiveSlot);
  const transferSlots = picksStore((store) => store.transferSlots);

  const activeSlot = transferSlots.find((slot) => slot.id === activeSlotId) ?? null;
  const pendingReplacementCount = transferSlots.filter((slot) => !slot.in).length;
  const open = manualOpen || activeSlotId != null;

  const handleOpenChange = (next: boolean) => {
    setManualOpen(next);
    if (!next) {
      setActiveSlot(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="h-6 w-6 p-1 text-xs rounded-sm 2xl:h-8 2xl:w-8"
          title="Browse players"
          aria-label="Browse players"
          onClick={() => setManualOpen(true)}
        >
          <UsersRound className="w-4 h-4 2xl:w-6 2xl:h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "flex h-[85vh] flex-col overflow-y-auto rounded-t-xl"
            : "flex !w-full flex-col overflow-y-auto sm:!max-w-4xl"
        }
      >
        <SheetHeader>
          <SheetTitle>Players</SheetTitle>
          <SheetDescription>Find players and add them to your transfer plan.</SheetDescription>
          {activeSlot && (
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Replacing:</span>
              <span className="font-semibold">{activeSlot.out.web_name}</span>
              <span className="text-xs text-muted-foreground">
                ({elementTypeToPosition(activeSlot.out.element_type)})
              </span>
              <span className="ml-auto text-xs font-medium text-muted-foreground">
                {pendingReplacementCount} player{pendingReplacementCount === 1 ? "" : "s"} left
              </span>
            </div>
          )}
        </SheetHeader>
        <PlayerDrawerCloseProvider value={() => handleOpenChange(false)}>
          <div className="mt-4 min-h-0 flex-1">{children}</div>
        </PlayerDrawerCloseProvider>
        <Link href="/players" className="pt-3 text-center text-xs text-muted-foreground underline">
          Open full player explorer
        </Link>
      </SheetContent>
    </Sheet>
  );
}
