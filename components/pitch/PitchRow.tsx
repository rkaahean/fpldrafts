import { PlayerData } from "@/app/store/utils";
import Player from "./Player";

export default function PitchRow(props: {
  position: string;
  data: PlayerData[];
  gameweek: number;
}) {
  // sort props.data with position == "GK being the first"
  return props.position === "subs" ? (
    <div className="flex h-full w-full min-h-0 items-center justify-center gap-3 overflow-x-auto py-0.5 sm:gap-8 lg:gap-12 xl:gap-16 2xl:gap-20">
      {props.data.map((player) => (
        <Player
          key={player.player_id}
          data={player}
          gameweek={props.gameweek}
        />
      ))}
    </div>
  ) : (
    <div className="flex h-full w-full min-h-0 items-center justify-center gap-3 overflow-x-auto py-0.5 sm:gap-8 lg:gap-12 xl:gap-16 2xl:gap-20">
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
