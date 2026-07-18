"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { Button } from "../ui/button";

export default function PlayerPane({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="w-full lg:w-80 flex-shrink-0"
    >
      <div className="flex items-center justify-between gap-2">
        <CollapsibleTrigger asChild>
          <Button variant="secondary" className="flex-grow justify-between">
            Players
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="flex flex-col gap-2 pt-2">
        {children}
        <Link href="/players" className="text-xs text-muted-foreground underline text-center">
          View all players
        </Link>
      </CollapsibleContent>
    </Collapsible>
  );
}
