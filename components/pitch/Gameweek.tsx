"use client";

import ReactQueryProvider from "@/app/provider/ReactQuery";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import PitchRow, { getPitchRowElements } from "./PitchRow";

export default function Gameweek() {
  const [gameweek, setGameweek] = useState(28);

  const { data, isLoading } = useQuery({
    queryKey: [gameweek],
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

  return (
    <ReactQueryProvider>
      <div>
        <div className="flex flex-row justify-between">
          <button onClick={() => setGameweek(gameweek - 1)}>
            <ArrowLeft className="w-5 h-5" />
          </button>
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
