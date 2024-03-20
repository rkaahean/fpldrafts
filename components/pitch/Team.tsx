import { ResetIcon } from "@radix-ui/react-icons";
import DraftChanges from "../drafts/DraftChanges";
import DraftSave from "../drafts/DraftSave";
import { Button } from "../ui/button";
import Gameweek from "./Gameweek";

export default function Team() {
  return (
    <div className="w-full min-h-full flex flex-col justify-start gap-2">
      <div className="flex flex-row gap-2 h-4">
        <DraftSave />
        {/* <Timeline /> */}
        <DraftChanges />
        <Button variant="destructive" size="xs">
          <ResetIcon />
        </Button>
      </div>
      <Gameweek />
    </div>
  );
}
