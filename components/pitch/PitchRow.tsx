import { PlayerData } from "@/app/store/utils";
import Player from "./Player";

export default function PitchRow(props: {
  position: string;
  data: PlayerData[];
  gameweek: number;
}) {
  // sort props.data with position == "GK being the first"
  const players = (
    <div className="relative z-10 flex h-full w-full min-h-0 items-center justify-center gap-3 overflow-x-auto px-2 py-0.5 sm:gap-4 lg:gap-5 xl:gap-6 2xl:gap-8">
      {props.data.map((player) => (
        <Player
          key={player.player_id}
          data={player}
          gameweek={props.gameweek}
        />
      ))}
    </div>
  );

  if (props.position !== "subs") {
    return players;
  }

  return (
    <div className="relative h-full w-full min-h-0">
      <div
        aria-hidden="true"
        className="absolute inset-x-2 bottom-0 top-0 rounded-t-[0.9rem] border border-b-0 border-white/65 bg-slate-300/90 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md sm:inset-x-4"
      />
      {players}
    </div>
  );
}
