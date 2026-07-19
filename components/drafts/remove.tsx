import { picksStore } from "@/app/store";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function RemoveAll() {
  const markAllOut = picksStore((state) => state.markAllOut);

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-6 w-6 p-1 text-xs rounded-sm 2xl:h-8 2xl:w-8"
              onClick={() => markAllOut()}
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
