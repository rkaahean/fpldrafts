import DraftChanges from "../drafts/DraftChanges";
import DraftSave from "../drafts/DraftSave";
import Gameweek from "./Gameweek";

export default function Team() {
  return (
    <div className="w-full min-h-full flex flex-col justify-start gap-5">
      <div className="flex flex-row gap-2 h-4">
        <DraftSave />
        {/* <Timeline /> */}
        <DraftChanges />
      </div>
      <Gameweek />
    </div>
  );
}
