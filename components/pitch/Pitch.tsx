import { ResetIcon } from "@radix-ui/react-icons";
import { ArrowLeft, ArrowRight } from "lucide-react";
import DraftChanges from "../drafts/DraftChanges";
import DraftSave from "../drafts/DraftSave";
import Timeline from "../timeline/Timeline";
import { Button } from "../ui/button";
import Player from "./Player";

export default function PlayerPitch() {
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
        <div>
          <div className="flex flex-col">
            <div className="font-semibold tracing-tighter text-sm">
              Viewing GW27 draft
            </div>
            <div className="font-light text-sm">4 changes, -4 hit</div>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div>
          <ArrowLeft className="w-5 h-5" />
        </div>
        <div className="text-lg font-bold">Gameweek 26</div>
        <div>
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
      <div>
        <PitchRow num={1} />
        <PitchRow num={3} />
        <PitchRow num={5} />
        <PitchRow num={2} />
        <PitchRow num={4} position="subs" />
      </div>
    </div>
  );
}

function PitchRow(props: { num: number; position?: "subs" | "starters" }) {
  // create an array of 5 elements
  const arr = Array.from({ length: props.num }, (_, i) => i);
  return props.position === "subs" ? (
    <div className="flex flex-row w-full h-1/5 items-center justify-around mt-5 bg-green-50 py-2">
      {arr.map((i) => (
        <Player key={i} />
      ))}
    </div>
  ) : (
    <div className="flex flex-row w-full h-1/5 items-center justify-evenly py-2">
      {arr.map((i) => (
        <Player key={i} />
      ))}
    </div>
  );
}
