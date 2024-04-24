"use client";

import ReactQueryProvider from "@/app/provider";
import { picksStore, swapPlayers } from "@/app/store";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import PitchRow, { filterData } from "./pitchrow";

export default function Gameweek() {
  const picksSelectors = picksStore((state) => ({
    setBase: state.setBase,
    setCurrentGameweek: state.setCurrentGameweek,
    dbbase: state.base!,
    drafts: state.drafts,
    currentGameweek: state.currentGameweek,
  }));

  const { setBase, setCurrentGameweek, dbbase, drafts, currentGameweek } =
    picksSelectors;

  const { data } = useQuery({
    queryKey: [currentGameweek, drafts.changes],
    queryFn: async () => {
      // first step is to hit the gameweek endpoint and try to fetch data
      const response = await fetch("/api/gameweek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameweek: currentGameweek }),
      });
      const data = await response.json();

      let base;
      if (data.data.length > 0) {
        // if the gameweek has valid data, that is the base
        setBase(data.data);
        base = data.data;
      } else {
        // else, if viewing a future gameweek, we need to use the base data
        base = dbbase;
      }
      // get all the draft changes relevant to that gameweek
      let gameweekDraft = drafts.changes.filter(
        (draft) => draft.gameweek <= currentGameweek
      );

      // if there's a base, apply relevant draft changes
      let draftData = base;
      if (base && base.length > 0) {
        for (let draftChange of gameweekDraft) {
          draftData = await swapPlayers(
            draftData,
            draftChange.in,
            draftChange.out
          );
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
