"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UsersRound } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { isMobile } from "react-device-detect";
import { Button } from "../ui/button";
import { PlayerDrawerCloseProvider } from "./player-drawer-context";

export default function PlayerPane({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="h-6 w-6 p-1 text-xs rounded-sm 2xl:h-8 2xl:w-8"
          title="Browse players"
          aria-label="Browse players"
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
        </SheetHeader>
        <PlayerDrawerCloseProvider value={() => setOpen(false)}>
          <div className="mt-4 min-h-0 flex-1">{children}</div>
        </PlayerDrawerCloseProvider>
        <Link href="/players" className="pt-3 text-center text-xs text-muted-foreground underline">
          Open full player explorer
        </Link>
      </SheetContent>
    </Sheet>
  );
}
