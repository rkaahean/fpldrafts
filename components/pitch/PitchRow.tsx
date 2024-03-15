"use client";

import { getGameweekData, getPlayerData } from "@/app/api/data";
import Player from "./Player";

export function getPitchRowElements(
  data: any,
  position: "DEF" | "MID" | "FWD" | "GK" | "subs"
) {
  return data
    .filter((player: any) => {
      switch (position) {
        case "DEF":
          return player.element_type == 2 && player.position < 11;
        case "MID":
          return player.element_type == 3 && player.position < 11;
        case "FWD":
          return player.element_type == 4 && player.position < 11;
        case "GK":
          return player.element_type == 1 && player.position < 11;
        case "subs":
          return player.position > 11;
      }
    })
    .map((player: any) => player.id);
}

// eslint-disable-next-line @next/next/no-async-client-component
export default async function PitchRow(props: {
  position: "DEF" | "MID" | "FWD" | "GK" | "subs";
  gameweek: number;
}) {
  /**
   * Get elements in position for gameweek?
   */
  let data = await getGameweekData(props.gameweek);
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

  // get data according to the position
  data = getPitchRowElements(data, props.position);

  return props.position === "subs" ? (
    <div className="flex flex-row w-full h-1/5 items-center justify-around mt-5 bg-green-50 py-2">
      {data.map((id: any) => (
        <Player key={id} id={id} />
      ))}
    </div>
  ) : (
    <div className="flex flex-row w-full h-1/5 items-center justify-evenly py-2">
      {data.map((id: any) => (
        <Player key={id} id={id} />
      ))}
    </div>
  );
}
