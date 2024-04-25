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
    setPicks: state.setPicks,
    dbbase: state.base!,
    drafts: state.drafts,
    currentGameweek: state.currentGameweek,
  }));

  const {
    setBase,
    setPicks,
    setCurrentGameweek,
    dbbase,
    drafts,
    currentGameweek,
  } = picksSelectors;

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
        setPicks(draftData);
        return draftData;
      } else if (data.data.length > 0) {
        setPicks(data.data);
        return data.data;
      }
    },
  });

  if (data) {
    return (
      <ReactQueryProvider>
        <div className="flex flex-col gap-1">
          <div className="flex flex-row justify-between">
            <button
              onClick={() => setCurrentGameweek(currentGameweek - 1)}
              title="Previous Gameweek"
            >
              <ArrowLeftIcon />
            </button>
            <div className="flex flex-row justify-around w-full">
              <GameweekStat title="Gameweek" value={currentGameweek} />
              <GameweekStat title="Transfers" value={"0 / 1"} />
              <GameweekStat title="ITB" value="0.4" />
              <GameweekStat title="Rank" value="882,240" />
            </div>
            <button
              onClick={() => setCurrentGameweek(currentGameweek + 1)}
              title="Next Gameweek"
            >
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

function GameweekStat({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="flex flex-col">
      <div className="text-xs font-light">{title}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
