import { PlayerData } from "@/app/store/utils";
import Player from "./Player";

export default function PitchRow(props: {
  position: string;
  data: PlayerData[];
  gameweek: number;
}) {
  // sort props.data with position == "GK being the first"
  return props.position === "subs" ? (
    <div className="flex flex-row w-full h-1/5 items-center justify-around mt-5 py-2">
      {props.data.map((player) => (
        <Player
          key={player.player_id}
          data={player}
          gameweek={props.gameweek}
        />
      ))}
    </div>
  ) : (
    <div className="flex flex-row w-full h-1/5 items-center justify-evenly py-2">
      {props.data.map((player) => (
        <Player
          key={player.player_id}
          data={player}
          gameweek={props.gameweek}
        />
      ))}
    </div>
  );
}
