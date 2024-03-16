"use client";

import { getPlayerData } from "@/app/api/data";
import { DoubleArrowDownIcon } from "@radix-ui/react-icons";
import Image from "next/image";

// eslint-disable-next-line @next/next/no-async-client-component
export default async function Player({ id }: { id: number }) {
  const [data] = await getPlayerData([id]);

  console.log("Loading player data", data);
  return (
    <div className="flex flex-row w-30 h-36 2xl:w-48 2xl:h-48 border rounded-md hover:bg-yellow-100 p-2">
      <PlayerFixtureTicker />
      <div className="w-9/12 text-xs flex flex-col h-full items-end">
        <div className="h-1/12">
          <button className="text-xs w-4 h-4 rounded-sm">
            <div className="flex flex-row justify-center">
              <DoubleArrowDownIcon className="w-3 h-3" />
            </div>
          </button>
        </div>
        <div className="flex flex-col h-full w-full">
          <PlayerDescription data={data} />
          <PlayerStatsTicker />
        </div>
      </div>
    </div>
  );
}

function PlayerFixtureTicker() {
  return (
    <div className="w-3/12 grid grid-rows-5 text-[9px] tracking-tighter">
      <div className="flex flex-col bg-red-200 text-center justify-center">
        MUN
      </div>
      <div className="flex flex-col bg-green-200 text-center justify-center">
        whu
      </div>
      <div className="flex flex-col bg-green-200 text-center justify-center">
        TOT
      </div>
      <div className="flex flex-col bg-red-200 text-center justify-center">
        che
      </div>
      <div className="flex flex-col bg-green-200 text-center justify-center">
        MCI
      </div>
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

function PlayerDescription({ data }: { data: any }) {
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
