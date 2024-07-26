"use client";

import { FPLGameweekPicksData } from "@/app/api";
import ReactQueryProvider from "@/app/provider";
import { picksStore, swapPlayers } from "@/app/store";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import PitchRow, { filterData } from "./PitchRow";

export default function Gameweek(props: { teamId: string }) {
  const picksSelectors = picksStore((state) => ({
    setBase: state.setBase,
    setCurrentGameweek: state.setCurrentGameweek,
    setPicks: state.setPicks,
    dbbase: state.base!,
    drafts: state.drafts,
    currentGameweek: state.currentGameweek,
    picks: state.picks!,
    transfers: state.transfersOut,
  }));

  const {
    setBase,
    setPicks,
    setCurrentGameweek,
    dbbase,
    drafts,
    currentGameweek,
    picks,
    transfers,
  } = picksSelectors;

  const { data } = useQuery({
    queryKey: [currentGameweek, drafts.changes],
    staleTime: 60 * 60 * 1000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      console.log("Going to fetch gameweek data...");
      // first step is to hit the gameweek endpoint and try to fetch data
      const response = await fetch("/api/gameweek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
        body: JSON.stringify({
          gameweek: currentGameweek,
          team_id: props.teamId,
        }),
      });
      const data: FPLGameweekPicksData = await response.json();

      console.log("Done fetching data...");

      let base: FPLGameweekPicksData;
      if (data.data.length > 0) {
        // if the gameweek has valid data, that is the base
        setBase(data);
        base = data;
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
      // console.log("Picks", data.data);
      // console.log("Drafts", draftData);
      if (base.data && base.data.length > 0) {
        // some players are still selected in to transfer
        const remainingTransferInSum = Object.values(transfers).reduce(
          (total, array) => {
            return (
              total +
              array.reduce((arrayTotal, item) => {
                return arrayTotal + (item.selling_price || 0);
              }, 0)
            );
          },
          0
        );

        draftData.overall.bank =
          draftData.overall.bank + remainingTransferInSum;
        for (let draftChange of gameweekDraft) {
          // swap players in the team
          draftData = await swapPlayers(draftData, draftChange);
        }

        // if loading a draft from DB
        if (drafts.id) {
          setPicks({
            data: draftData.data,
            overall: {
              ...draftData.overall,
              bank: drafts.bank!,
            },
          });
        } else {
          setPicks(draftData);
        }
        return draftData;
      } else if (data.data.length > 0) {
        setPicks(data);
        return data;
      }
    },
  });

  // console.log("Data", data);

  if (!data) {
    return "Loading...";
  }

  if (data && data.data) {
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
              <GameweekStat
                title="Transfers"
                value={`${
                  drafts.changes.filter(
                    (transfer) => transfer.gameweek == currentGameweek
                  ).length
                } / 1`}
              />
              <GameweekStat title="ITB" value={`${picks.overall.bank! / 10}`} />
              <GameweekStat title="Rank" value={data.overall.overall_rank} />
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
                data={filterData(data.data, position)}
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
    <div className="text-xs flex flex-col w-10">
      <div className="font-light">{title}</div>
      <div className="font-black">{value}</div>
    </div>
  );
}
