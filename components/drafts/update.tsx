import { UpdateIcon } from "@radix-ui/react-icons";

import { picksStore } from "@/app/store";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { toast } from "../ui/use-toast";

export default function DraftUpdate(props: { teamId: string }) {
  const drafts = picksStore((state) => state.drafts);
  const gameweek = picksStore((state) => state.currentGameweek);
  const picks = picksStore((state) => state.picks);

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="xs"
              variant="ghost"
              disabled={!drafts.id}
              onClick={async () => {
                await fetch("/api/drafts/update", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    id: drafts.id,
                    changes: drafts.changes,
                    team_id: props.teamId,
                    gameweek: Math.min(
                      ...drafts.changes.map((draft) => draft.gameweek)
                    ),
                    bank: picks?.overall.bank,
                  }),
                });
                toast({
                  title: "Draft updated.",
                  description: `${drafts.name} has been updated.`,
                });
              }}
            >
              <UpdateIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs text-muted-foreground">
              Save any change made to the draft.
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
