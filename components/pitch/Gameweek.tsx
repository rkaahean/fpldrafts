"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import PitchRow from "./PitchRow";

export default function Gameweek() {
  const [gameweek, setgameweek] = useState(28);

  return (
    <div>
      <div className="flex flex-row justify-between">
        <button onClick={() => setgameweek(gameweek - 1)}>Left</button>
        <div className="text-lg font-bold">{`Gameweek ${gameweek}`}</div>
        <div>
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
      <div className="h-full">
        <PitchRow position="GK" gameweek={gameweek} />
        <PitchRow position="DEF" gameweek={gameweek} />
        <PitchRow position="MID" gameweek={gameweek} />
        <PitchRow position="FWD" gameweek={gameweek} />
        <PitchRow position="subs" gameweek={gameweek} />
      </div>
    </div>
  );
}
