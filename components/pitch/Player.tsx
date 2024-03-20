import { cn } from "@/lib/utils";
import { DoubleArrowDownIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useState } from "react";
import { picksStore } from "./Gameweek";
import { PlayerData } from "./PitchRow";

export default function Player(props: {
  data: PlayerData;
  gameweek: number;
  isSubstitute: boolean;
}) {
  const [isSelected, setSelected] = useState(false);

  const subIn = picksStore((store) => store.setPickIn);
  return (
    <div
      className={cn(
        "flex flex-row w-30 h-36 2xl:w-48 2xl:h-48 border rounded-md  p-2",
        isSelected ? "bg-yellow-100" : ""
      )}
    >
      <PlayerFixtureTicker
        fixtures={props.data.fixtures}
        gameweek={props.gameweek}
      />
      <div className="w-9/12 text-xs flex flex-col h-full items-end">
        <div className="h-1/12">
          <button
            className="text-xs w-4 h-4 rounded-sm"
            onClick={() => {
              setSelected(!isSelected);
              subIn(props.data.player_id);
            }}
          >
            <div className="flex flex-row justify-center">
              <DoubleArrowDownIcon className="w-3 h-3" />
            </div>
          </button>
        </div>
        <div className="flex flex-col h-full w-full">
          <PlayerDescription data={props.data} />
          <PlayerStatsTicker />
        </div>
      </div>
    </div>
  );
}

function PlayerFixtureTicker({
  fixtures,
  gameweek,
}: {
  fixtures: PlayerData["fixtures"];
  gameweek: number;
}) {
  const formattedFixtures = [];
  for (let idx = gameweek; idx < gameweek + 5; idx++) {
    const fixture = fixtures.filter((fixture) => fixture.event == idx);
    if (fixture.length === 0) {
      formattedFixtures.push({
        id: idx,
        event: idx,
        name: "-",
      });
    } else if (fixture.length == 1) {
      formattedFixtures.push(fixture[0]);
    } else {
      formattedFixtures.push(fixture);
    }
  }

  return (
    <div className="w-3/12 grid grid-rows-5 text-[10px] tracking-tighter">
      {formattedFixtures.map((fixture, idx) => {
        if (Array.isArray(fixture)) {
          return (
            <div
              className="grid grid-rows-2 text-[8px] tracking-tighter text-center border-[1px] rounded-sm border-stone-700"
              key={idx}
            >
              {fixture.map((double_fixture) => {
                return (
                  <div key={double_fixture.id} className="row-span-1">
                    {double_fixture.name}
                  </div>
                );
              })}
            </div>
          );
        } else {
          return (
            <div
              key={fixture.id}
              className="flex flex-col text-center justify-center"
            >
              <div>{fixture.name}</div>
            </div>
          );
        }
      })}
    </div>
  );
}

function PlayerStatsTicker() {
  return (
    <div className="h-1/6 grid grid-cols-3 text-[9px] 2xl:text-xs">
      <div className="flex flex-col text-center justify-center">
        <div>6.5$</div>
      </div>
      <div className="flex flex-col text-center justify-center">
        <div>100Pts</div>
      </div>
      <div className="flex flex-col text-center justify-center">
        <div>0.56</div>
      </div>
    </div>
  );
}

function PlayerDescription({
  data,
}: {
  data: {
    team_code: number;
    web_name: string;
  };
}) {
  return (
    <div className="flex flex-col h-5/6 items-center justify-around">
      <div className="h-4/6">
        <Image
          src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${data.team_code}-110.webp`}
          alt="Player"
          width={40}
          height={40}
        />
      </div>
      <div className="text-xs h-1/6 font-semibold 2xl:text-sm">
        {data.web_name}
      </div>
    </div>
  );
}
