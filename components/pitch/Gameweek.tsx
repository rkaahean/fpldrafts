import { getGameweekPicksData } from "@/app/api/data";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PitchRow, { getPitchRowElements } from "./PitchRow";

// eslint-disable-next-line @next/next/no-async-client-component
export default async function Gameweek() {
  const gameweek = 28;
  const data = await getGameweekPicksData(gameweek);

  console.log("DB Gameweekd data", data);

  return (
    <div>
      <div className="flex flex-row justify-between">
        <div>
          <ArrowLeft className="w-5 h-5" />
        </div>
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
