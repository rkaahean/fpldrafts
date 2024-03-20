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
  substitutedIn?: number;
  substitutedOut?: number;
  incrementPop: () => void;
  setPicks: (picks: FPLGameweekPicksData) => void;
  setSubstituteIn: (id: number) => void;
  setSubstituteOut: (id: number) => void;
  makeSubs: () => void;
}
export const picksStore = create<State>()((set, get) => ({
  incrementPop: () => console.log,
  setPicks: (picks: FPLGameweekPicksData) => {
    console.log("Updating state...");
    set({ data: picks });
  },
  setSubstituteIn: (player_id: number) => {
    /**
     * selects player to be substituted IN, from subs
     */
    set({ substitutedIn: player_id });
  },
  setSubstituteOut: (player_id: number) => {
    /**
     * selects player to be substituted OUT, from starting 11
     */
    set({ substitutedOut: player_id });
  },
  makeSubs: () => {
    const { data, substitutedIn, substitutedOut } = get();

    // if both subs are set
    if (!!substitutedIn && !!substitutedOut) {
      console.log("Making subs...");
      const inPlayerIndex = data!.findIndex(
        (player) => player.fpl_player.player_id === substitutedIn
      );
      const outPlayerIndex = data!.findIndex(
        (player) => player.fpl_player.player_id === substitutedOut
      );
      console.log(inPlayerIndex, outPlayerIndex);
      if (inPlayerIndex !== -1 && outPlayerIndex !== -1) {
        const inPlayer = data![inPlayerIndex];
        const outPlayer = data![outPlayerIndex];

        // Swap the position attribute
        const tempPosition = inPlayer.position;
        inPlayer.position = outPlayer.position;
        outPlayer.position = tempPosition;

        // Update the state with the modified data array
        set({
          data: [
            ...data!.slice(0, inPlayerIndex),
            inPlayer,
            ...data!.slice(inPlayerIndex + 1, outPlayerIndex),
            outPlayer,
            ...data!.slice(outPlayerIndex + 1),
          ],
        });
      }
    }
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
  let picksData = picksStore((state) => state.data!);

  const updatePicks = picksStore((state) => state.setPicks);
  if (isLoadingGameweek) {
    return <div>Loading Players...</div>;
  }
  updatePicks(data.data);

  if (picksData) {
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
              data={filterData(picksData, "GK")}
              gameweek={gameweek}
            />
            <PitchRow
              position="DEF"
              data={filterData(picksData, "DEF")}
              gameweek={gameweek}
            />
            <PitchRow
              position="MID"
              data={filterData(picksData, "MID")}
              gameweek={gameweek}
            />
            <PitchRow
              position="FWD"
              data={filterData(picksData, "FWD")}
              gameweek={gameweek}
            />
            <PitchRow
              position="subs"
              data={filterData(picksData, "subs")}
              gameweek={gameweek}
            />
          </div>
        </div>
      </ReactQueryProvider>
    );
  }
}
