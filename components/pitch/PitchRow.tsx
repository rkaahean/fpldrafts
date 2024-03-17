import Player from "./Player";

export function getPitchRowElements(
  data: any,
  position: "DEF" | "MID" | "FWD" | "GK" | "subs"
) {
  return data
    .filter((player: any) => {
      switch (position) {
        case "DEF":
          return player.fpl_player.element_type == 2 && player.position <= 11;
        case "MID":
          return player.fpl_player.element_type == 3 && player.position <= 11;
        case "FWD":
          return player.fpl_player.element_type == 4 && player.position <= 11;
        case "GK":
          return player.fpl_player.element_type == 1 && player.position <= 11;
        case "subs":
          return player.position > 11;
      }
    })
    .map((player: any) => player.element);
}

export default function PitchRow(props: {
  position: "DEF" | "MID" | "FWD" | "GK" | "subs";
  data: any;
}) {
  return props.position === "subs" ? (
    <div className="flex flex-row w-full h-1/5 items-center justify-around mt-5 bg-green-50 py-2">
      {props.data.map((id: any) => (
        <Player key={id} id={id} />
      ))}
    </div>
  ) : (
    <div className="flex flex-row w-full h-1/5 items-center justify-evenly py-2">
      {props.data.map((id: any) => (
        <Player key={id} id={id} />
      ))}
    </div>
  );
}
