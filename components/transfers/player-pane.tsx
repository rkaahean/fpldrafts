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
import { ReactNode } from "react";
import { Button } from "../ui/button";

export default function PlayerPane({ children }: { children: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          title="Browse players"
          aria-label="Browse players"
        >
          <UsersRound className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Players</SheetTitle>
          <SheetDescription>Find players and add them to your transfer plan.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 min-h-0 flex-1">{children}</div>
        <Link href="/players" className="pt-3 text-center text-xs text-muted-foreground underline">
          Open full player explorer
        </Link>
      </SheetContent>
    </Sheet>
  );
}
