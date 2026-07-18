import { PlayerData } from "@/app/store/utils";
import Player from "./Player";

export default function PitchRow(props: {
  position: string;
  data: PlayerData[];
  gameweek: number;
}) {
  // sort props.data with position == "GK being the first"
  return props.position === "subs" ? (
    <div className="flex flex-row w-full h-full min-h-0 items-center justify-evenly gap-1 py-0.5">
      {props.data.map((player) => (
        <Player
          key={player.player_id}
          data={player}
          gameweek={props.gameweek}
        />
      ))}
    </div>
  ) : (
    <div className="flex flex-row w-full h-full min-h-0 items-center justify-evenly gap-1 py-0.5">
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
