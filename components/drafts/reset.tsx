import { picksStore } from "@/app/store";
import { CubeIcon, ResetIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function ResetCurrentGameweek() {
  const drafts = picksStore((state) => state.drafts);
  const gameweek = picksStore((state) => state.currentGameweek);

  const setDrafts = picksStore((state) => state.setDrafts);
  const resetTransfers = picksStore((state) => state.resetTransfers);
  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setDrafts({
                  ...drafts,
                  changes: drafts.changes.filter(
                    (transfer) => transfer.gameweek != gameweek
                  ),
                });
                resetTransfers();
              }}
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
  );
}

export function ResetAll() {
  const drafts = picksStore((state) => state.drafts);

  const setDrafts = picksStore((state) => state.setDrafts);
  const resetTransfers = picksStore((state) => state.resetTransfers);
  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setDrafts({
                  ...drafts,
                  changes: [],
                });
                resetTransfers();
              }}
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
  );
}
