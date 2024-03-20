"use client";

import { FPLGameweekPicksData } from "@/app/api/data";
import ReactQueryProvider from "@/app/provider/ReactQuery";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { create } from "zustand";
import PitchRow, { filterData } from "./PitchRow";

interface State {
  data?: FPLGameweekPicksData;
  pickSubIn?: number;
  pickSubOut?: number;
  incrementPop: () => void;
  setPicks: (picks: FPLGameweekPicksData) => void;
  setPickIn: (position: number) => void;
}
export const picksStore = create<State>()((set) => ({
  incrementPop: () => console.log,
  setPicks: (picks: FPLGameweekPicksData) => {
    console.log("Updating state...");
    set({ data: picks });
  },
  setPickIn: (pickSubIn: number) => {
    set({ pickSubIn });
  },
}));

export default function Gameweek() {
  const [gameweek, setGameweek] = useState(28);

  const { data, isLoading: isLoadingGameweek } = useQuery({
    queryKey: ["hello", gameweek, gameweek < 29],
    queryFn: async () => {
      return await fetch("/gameweek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameweek }),
      }).then((res) => res.json());
    },
    enabled: gameweek < 29,
  });

  // set picks as state
  const updatePicks = picksStore((state) => state.setPicks);
  if (isLoadingGameweek) {
    return <div>Loading Players...</div>;
  }
  updatePicks(data.data);

  return (
    <ReactQueryProvider>
      <div>
        <div className="flex flex-row justify-between">
          <button onClick={() => setGameweek(gameweek - 1)}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-lg font-bold">{`Gameweek ${gameweek}`}</div>
          <button onClick={() => setGameweek(gameweek + 1)}>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <div className="h-full">
          <PitchRow
            position="GK"
            data={filterData(picksStore.getState().data!, "GK")}
            gameweek={gameweek}
          />
          <PitchRow
            position="DEF"
            data={filterData(picksStore.getState().data!, "DEF")}
            gameweek={gameweek}
          />
          <PitchRow
            position="MID"
            data={filterData(picksStore.getState().data!, "MID")}
            gameweek={gameweek}
          />
          <PitchRow
            position="FWD"
            data={filterData(picksStore.getState().data!, "FWD")}
            gameweek={gameweek}
          />
          <PitchRow
            position="subs"
            data={filterData(picksStore.getState().data!, "subs")}
            gameweek={gameweek}
          />
        </div>
      </div>
    </ReactQueryProvider>
  );
}
