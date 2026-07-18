import { picksStore } from "@/app/store";
import { updateTransfer } from "@/app/store/utils";
import { FPLPlayerDataToPlayerData } from "@/scripts/lib/utils";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function RemoveAll() {
  const transfersOut = picksStore((state) => state.transfersOut);
  const setTransferOut = picksStore((state) => state.setTransferOut);

  const picks = picksStore((state) => state.picks);

  const addToBank = picksStore((state) => state.addToBank);
  const removeFromBank = picksStore((state) => state.removeFromBank);

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-6 w-6 p-1 text-xs rounded-sm 2xl:h-8 2xl:w-8"
              onClick={() => {
                picks?.data.map((player) =>
                  updateTransfer(
                    transfersOut,
                    FPLPlayerDataToPlayerData(player),
                    addToBank,
                    removeFromBank
                  )
                );
                setTransferOut(transfersOut);
              }}
            >
              <X className="w-4 h-4 2xl:w-6 2xl:h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs text-muted-foreground">
              Removes all players in the current team.
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
