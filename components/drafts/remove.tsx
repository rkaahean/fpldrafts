import { picksStore } from "@/app/store";
import { updateTransfer } from "@/app/store/utils";
import { FPLPlayerDataToPlayerData } from "@/lib/utils";
import { Cross1Icon } from "@radix-ui/react-icons";
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
              size="xs"
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
              <Cross1Icon />
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
