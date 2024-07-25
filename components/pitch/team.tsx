"use client";

import { picksStore } from "@/app/store";
import { CubeIcon, ResetIcon, UpdateIcon } from "@radix-ui/react-icons";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import DraftChanges from "../drafts/changes";
import DraftSave from "../drafts/save";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { toast } from "../ui/use-toast";
import Gameweek from "./Gameweek";

export default function Team() {
  const drafts = picksStore((state) => state.drafts);
  const gameweek = picksStore((state) => state.currentGameweek);
  const picks = picksStore((state) => state.picks);

  const setDrafts = picksStore((state) => state.setDrafts);
  const resetTransfers = picksStore((state) => state.resetTransfers);

  const { data: session, status } = useSession();
  if (status == "authenticated" && !session) {
    redirect("/landing");
  } else if (status == "authenticated" && !session!.hasTeam) {
    // use is signed in but no team ID
    redirect("/link");
  }

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
        <DraftSave teamId={session?.team_id!} />
        <DraftChanges />
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="xs"
                  variant="ghost"
                  disabled={!drafts.id}
                  onClick={async () => {
                    console.log(drafts.changes);
                    await fetch("/api/drafts/update", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        id: drafts.id,
                        changes: drafts.changes,
                        team_id: session?.team_id,
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
      </nav>
      <div className="flex flex-col flex-grow">
        <Gameweek teamId={session?.team_id!} />
      </div>
    </div>
  );
}
