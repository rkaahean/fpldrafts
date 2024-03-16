import { ResetIcon } from "@radix-ui/react-icons";
import { QueryClient } from "@tanstack/react-query";
import DraftChanges from "../drafts/DraftChanges";
import DraftSave from "../drafts/DraftSave";
import Timeline from "../timeline/Timeline";
import { Button } from "../ui/button";
import Gameweek from "./Gameweek";

export default function Team() {
  const queryClient = new QueryClient();
  return (
    <div className="w-full min-h-full flex flex-col justify-around gap-5">
      <div className="flex flex-row justify-between">
        <div className="flex gap-2">
          <DraftSave />
          <Timeline />
          <DraftChanges />
          <Button variant="destructive">
            <ResetIcon />
          </Button>
        </div>
      </div>
      <Gameweek />
    </div>
  );
}
