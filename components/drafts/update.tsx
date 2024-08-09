import { UpdateIcon } from "@radix-ui/react-icons";

import { picksStore } from "@/app/store";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { toast } from "../ui/use-toast";

export default function DraftUpdate() {
  const drafts = picksStore((state) => state.drafts);
  const picks = picksStore((state) => state.picks);

  const { data: session } = useSession();

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-6 px-2 py-1 text-xs rounded-sm 2xl:h-10 2xl:px-4 2xl:py-2"
              variant="ghost"
              disabled={!drafts.id}
              onClick={async () => {
                await fetch("/api/drafts/update", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                  },
                  body: JSON.stringify({
                    id: drafts.id,
                    changes: drafts.changes,
                    gameweek: Math.min(
                      ...drafts.changes.map((draft) => draft.gameweek)
                    ),
                    bank: picks?.overall.bank,
                  }),
                });
                toast({
                  title: "Draft updated.",
                  description: `${drafts.name} has been updated.`,
                  variant: "success",
                });
              }}
            >
              <UpdateIcon className="w-4 h-4 2xl:w-8 2xl:h-8" />
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
