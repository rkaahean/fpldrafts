"use client";

import ReactQueryProvider from "@/app/provider/ReactQuery";
import { picksStore, swapPlayers } from "@/app/store/picks";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PitchRow, { filterData } from "./PitchRow";

export default function Gameweek() {
  const [gameweek, setGameweek] = useState(28);
  const updatePicks = picksStore((state) => state.setPicks);
  const setBase = picksStore((state) => state.setBase);

  const drafts = picksStore((state) => state.drafts);

  let picksData = picksStore((state) => state.data!);

  const { data, isFetching } = useQuery({
    queryKey: ["hello", gameweek],
    queryFn: async () => {
      const response = await fetch("/gameweek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameweek }),
      });
      const data = await response.json();
      if (data.data.length > 0) {
        // if the gameweek has valid data, that is the base
        console.log("Setting base...");
        setBase(data.data);
      }
      // dealing with drafts into a future gameweek
      // we need to apply the drafts to the base
      let gameweekDraft = drafts.changes.filter(
        (draft) => draft.gameweek <= gameweek
      );

      let base = drafts.base;
      if (base.length > 0) {
        for (let draftChange of gameweekDraft) {
          console.log("Changing", draftChange);
          base = swapPlayers(base, draftChange.in, draftChange.out);
          console.log("New picks data", base);
        }
        updatePicks(base);
      } else if (data.data.length > 0) {
        console.log("Updating directly...", data);
        updatePicks(data.data);
      } else {
        console.log("No data", data);
        const base = picksStore((state) => state.base);
        updatePicks(base!);
      }
      return data;
    },
  });

  if (isFetching) {
    return <div>Loading Players...</div>;
  }

  // console.log("Final pitch data", picksData);
  if (picksData) {
    return (
      <ReactQueryProvider>
        <div>
          <div className="flex flex-row justify-between">
            <button onClick={() => setGameweek(gameweek - 1)}>
              <ArrowLeftIcon />
            </button>
            <div className="text-lg font-bold">{`Gameweek ${gameweek}`}</div>
            <button onClick={() => setGameweek(gameweek + 1)}>
              <ArrowRightIcon />
            </button>
          </div>
          <div className="h-full">
            {["GK", "DEF", "MID", "FWD", "subs"].map((position: string) => (
              <PitchRow
                key={position}
                position={position}
                data={filterData(picksData, position)}
                gameweek={gameweek}
              />
            ))}
          </div>
        </div>
      </ReactQueryProvider>
    );
  }
}
