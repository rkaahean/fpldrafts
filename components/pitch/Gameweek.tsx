"use client";

import ReactQueryProvider from "@/app/provider";
import { picksStore, swapPlayers } from "@/app/store/picks";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import PitchRow, { filterData } from "./PitchRow";

export default function Gameweek() {
  const updatePicks = picksStore((state) => state.setPicks);
  const setBase = picksStore((state) => state.setBase);
  const setCurrentGameweek = picksStore((state) => state.setCurrentGameweek);

  const dbbase = picksStore((state) => state.base!);

  const drafts = picksStore((state) => state.drafts);
  const picksData = picksStore((state) => state.data!);
  const currentGameweek = picksStore((state) => state.currentGameweek);

  const { data } = useQuery({
    // gameweek: whenever the gameweek state is changed
    // picksData: whenever a substitution is made
    // drafts: whenever a draft is loaded
    queryKey: [currentGameweek, picksData, drafts],
    queryFn: async () => {
      const response = await fetch("/api/gameweek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameweek: currentGameweek }),
      });
      const data = await response.json();
      console.log("Data", data.data);
      let base;
      if (data.data.length > 0) {
        // if the gameweek has valid data, that is the base
        // console.log("Setting base...");
        updatePicks(data.data);
        setBase(data.data);
        base = data.data;
      } else {
        // else, if viewing a future gameweek, we need to use the base data
        console.log("No DB data...");
        base = dbbase;
        console.log("Base data", base);
      }
      // dealing with drafts into a future gameweek
      // we need to apply the drafts to the base
      let gameweekDraft = drafts.changes.filter(
        (draft) => draft.gameweek <= currentGameweek
      );

      // if there's a base, apply changes
      let draftData = base;
      if (base && base.length > 0) {
        for (let draftChange of gameweekDraft) {
          draftData = swapPlayers(draftData, draftChange.in, draftChange.out);
        }
        return draftData;
      } else if (data.data.length > 0) {
        return data.data;
      }
    },
  });

  if (data) {
    return (
      <ReactQueryProvider>
        <div>
          <div className="flex flex-row justify-between">
            <button onClick={() => setCurrentGameweek(currentGameweek - 1)}>
              <ArrowLeftIcon />
            </button>
            <div className="text-lg font-bold">{`Gameweek ${currentGameweek}`}</div>
            <button onClick={() => setCurrentGameweek(currentGameweek + 1)}>
              <ArrowRightIcon />
            </button>
          </div>
          <div className="h-full">
            {["GK", "DEF", "MID", "FWD", "subs"].map((position: string) => (
              <PitchRow
                key={position}
                position={position}
                data={filterData(data, position)}
                gameweek={currentGameweek}
              />
            ))}
          </div>
        </div>
      </ReactQueryProvider>
    );
  }
}
