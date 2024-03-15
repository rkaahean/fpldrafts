import { ResetIcon } from "@radix-ui/react-icons";
import { ArrowLeft, ArrowRight } from "lucide-react";
import DraftChanges from "../drafts/DraftChanges";
import DraftSave from "../drafts/DraftSave";
import Timeline from "../timeline/Timeline";
import { Button } from "../ui/button";
import Player from "./Player";

export default async function Team(params: { gameWeek: number }) {
  let data = await getGameweekData(params.gameWeek);
  const players = data["picks"].map((pick: any) => {
    return {
      id: pick.element,
      position: pick.position,
    };
  });
  data = await getPlayerData(players.map((player: any) => player.id));

  // join player data with the position on the pitch
  data = data.map((player: any, i: number) => {
    return {
      ...player,
      position: players[i].position,
    };
  });
  console.log(data);
  // console.log(Object.keys(data));
  // console.log(data["picks"]);

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
async function getPlayerData(ids: number[]) {
  const res = await fetch(
    `https://fantasy.premierleague.com/api/bootstrap-static/`
  );
  return res.json().then((data) =>
    data["elements"]
      .filter((player: any) => ids.includes(player.id))
      .map((player: any) => {
        // console.log(player);
        return {
          id: player.id,
          web_name: player.web_name,
          team: player.team,
          element_type: player.element_type,
        };
      })
  );
}

async function getGameweekData(gameWeek: number) {
  const res = await fetch(
    `https://fantasy.premierleague.com/api/entry/44421/event/${gameWeek}/picks/`
  );
  return res.json();
}

function PitchRow(props: {
  num: number;
  position?: "subs" | "starters";
  ids?: number[];
}) {
  // create an array of 5 elements
  console.log("Pitch elements", props.ids);
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
