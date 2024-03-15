"use client";

import { getGameweekData, getPlayerData } from "@/app/api/data";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import Player from "./Player";

export default async function Gameweek() {
  const [gameWeek] = useState(28);

  let data = await getGameweekData(gameWeek);
  const players = data["picks"].map((pick: any) => {
    return {
      id: pick.element,
      position: pick.position,
    };
  });
  data = await getPlayerData(players.map((player: any) => player.id));

  // join player data with the position on the pitch
  data = data.map((player: any) => {
    players.map((p: any) => {
      if (p.id == player.id) {
        player.position = p.position;
      }
    });
    return player;
  });
  console.log(data);
  return (
    <div>
      <div className="flex flex-row justify-between">
        <div>
          <ArrowLeft className="w-5 h-5" />
        </div>
        <div className="text-lg font-bold">{`Gameweek ${gameWeek}`}</div>
        <div>
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
      <div className="h-full">
        <PitchRow num={1} ids={getPitchRowElements(data, 1)} />
        <PitchRow num={3} ids={getPitchRowElements(data, 2)} />
        <PitchRow num={5} ids={getPitchRowElements(data, 3)} />
        <PitchRow num={2} ids={getPitchRowElements(data, 4)} />
        <PitchRow
          num={4}
          position="subs"
          ids={getPitchRowElements(data, undefined, true)}
        />
      </div>
    </div>
  );
}

function getPitchRowElements(
  data: any,
  element_type?: number,
  subs: boolean = false
) {
  return data
    .filter((player: any) => {
      if (player.element_type == element_type && player.position < 11) {
        return player.id;
      }

      if (subs && player.position > 11) {
        return player.id;
      }
    })
    .map((player: any) => player.id);
}

function PitchRow(props: {
  num: number;
  position?: "subs" | "starters";
  ids: number[];
}) {
  /**
   * Get elements in position for gameweek?
   */
  const arr = Array.from({ length: props.num }, (_, i) => i);
  return props.position === "subs" ? (
    <div className="flex flex-row w-full h-1/5 items-center justify-around mt-5 bg-green-50 py-2">
      {props.ids.map((id) => (
        <Player key={id} id={id} />
      ))}
    </div>
  ) : (
    <div className="flex flex-row w-full h-1/5 items-center justify-evenly py-2">
      {props.ids.map((id) => (
        <Player key={id} id={id} />
      ))}
    </div>
  );
}
