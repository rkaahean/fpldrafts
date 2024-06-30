"use client";

import { picksStore } from "@/app/store";
import { CubeIcon, ResetIcon } from "@radix-ui/react-icons";
import DraftChanges from "../drafts/changes";
import DraftSave from "../drafts/save";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Gameweek from "./Gameweek";

export default function Team() {
  const drafts = picksStore((state) => state.drafts);
  const gameweek = picksStore((state) => state.currentGameweek);

  const setDrafts = picksStore((state) => state.setDrafts);

  return (
    <div className="w-full min-h-full max-h-screen flex flex-row justify-start gap-1">
      <nav className="flex flex-col justify-center gap-4">
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  title="Save Draft"
                  onClick={() =>
                    setDrafts({
                      ...drafts,
                      changes: [],
                    })
                  }
                >
                  <ResetIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs text-muted-foreground">
                  Resets all the changes in the draft.
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  title="Reset changes this gameweek."
                  onClick={() =>
                    setDrafts({
                      ...drafts,
                      changes: drafts.changes.filter(
                        (transfer) => transfer.gameweek != gameweek
                      ),
                    })
                  }
                >
                  <CubeIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs text-muted-foreground">
                  Resets all changes in this gameweek.
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div>
          <DraftSave />
        </div>
        <div>
          <DraftChanges />
        </div>
      </nav>
      <div className="flex flex-col flex-grow">
        <Gameweek />
      </div>
    </div>
  );
}
