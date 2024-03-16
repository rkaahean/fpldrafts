import { getGameweekData, getPlayerData } from "@/app/api/data";
import { ArrowRight } from "lucide-react";
import PitchRow, { getPitchRowElements } from "./PitchRow";

// eslint-disable-next-line @next/next/no-async-client-component
export default async function Gameweek() {
  /**
   * Get elements in position for gameweek?
   */
  let gameweek = 28;
  let data = await getGameweekData(gameweek);
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
      if (p.id == player.player_id) {
        player.position = p.position;
      }
    });
    return player;
  });

  return (
    <div>
      <div className="flex flex-row justify-between">
        <button>Left</button>
        <div className="text-lg font-bold">{`Gameweek ${gameweek}`}</div>
        <div>
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
      <div className="h-full">
        <PitchRow position="GK" data={getPitchRowElements(data, "GK")} />
        <PitchRow position="DEF" data={getPitchRowElements(data, "DEF")} />
        <PitchRow position="MID" data={getPitchRowElements(data, "MID")} />
        <PitchRow position="FWD" data={getPitchRowElements(data, "FWD")} />
        <PitchRow position="subs" data={getPitchRowElements(data, "subs")} />
      </div>
    </div>
  );
}
