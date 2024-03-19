import { DoubleArrowDownIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { PlayerData } from "./PitchRow";

export default function Player(props: { data: PlayerData; gameweek: number }) {
  // console.log("Player", props.data);
  return (
    <div className="flex flex-row w-30 h-36 2xl:w-48 2xl:h-48 border rounded-md hover:bg-yellow-100 p-2">
      <PlayerFixtureTicker
        fixtures={props.data.fixtures}
        gameweek={props.gameweek}
      />
      <div className="w-9/12 text-xs flex flex-col h-full items-end">
        <div className="h-1/12">
          <button className="text-xs w-4 h-4 rounded-sm">
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
  fixtures: any[];
  gameweek: number;
}) {
  const formattedFixtures = [];
  for (let idx = gameweek; idx < gameweek + 5; idx++) {
    const fixture = fixtures.filter((fixture: any) => fixture.event == idx);
    if (fixture.length === 0) {
      formattedFixtures.push({
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
    <div className="w-3/12 grid grid-rows-5 text-[10px] tracking-tighter bg-green-200">
      {formattedFixtures.map((fixture) => {
        if (fixture.length === 2) {
          return (
            <div
              className="grid grid-rows-2 text-[8px] tracking-tighter text-center border-[1px] rounded-sm border-stone-700"
              key={fixture.id}
            >
              {fixture.map((fix: any) => {
                return (
                  <div key={fix.id} className="row-span-1">
                    {fix.name}
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
