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
  return (
    <div className="w-full min-h-full max-h-screen flex flex-row justify-start gap-1">
      <nav className="flex flex-col justify-center gap-4">
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="xs" title="Save Draft">
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
          <Button variant="ghost" size="xs" title="Save Draft">
            <CubeIcon />
          </Button>
        </div>
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <DraftSave />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs text-muted-foreground">
                  Saves the drafts with all the changes so far.
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <DraftChanges />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs text-muted-foreground">
                  Preview all the draft changes.
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </nav>
      <div className="flex flex-col flex-grow">
        <Gameweek />
      </div>
    </div>
  );
}
