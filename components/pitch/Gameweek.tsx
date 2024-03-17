"use client";

import ReactQueryProvider from "@/app/provider/ReactQuery";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PitchRow, { getPitchRowElements } from "./PitchRow";

// eslint-disable-next-line @next/next/no-async-client-component
export default function Gameweek() {
  const gameweek = 28;
  // const data = await getGameweekPicksData(gameweek);

  const { data, isLoading } = useQuery({
    queryKey: ["Hi"],
    queryFn: () => {
      return fetch("/gameweek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameweek }),
      }).then((res) => res.json());
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log("DB Gameweekd data", getPitchRowElements(data.data, "DEF"));

  return (
    <ReactQueryProvider>
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
          <PitchRow position="GK" data={getPitchRowElements(data.data, "GK")} />
          <PitchRow
            position="DEF"
            data={getPitchRowElements(data.data, "DEF")}
          />
          <PitchRow
            position="MID"
            data={getPitchRowElements(data.data, "MID")}
          />
          <PitchRow
            position="FWD"
            data={getPitchRowElements(data.data, "FWD")}
          />
          <PitchRow
            position="subs"
            data={getPitchRowElements(data.data, "subs")}
          />
        </div>
      </div>
    </ReactQueryProvider>
  );
}
