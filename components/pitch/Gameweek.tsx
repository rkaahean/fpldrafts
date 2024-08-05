"use client";

import { FPLGameweekPicksData } from "@/app/api";
import ReactQueryProvider from "@/app/provider";
import { picksStore, swapPlayers } from "@/app/store";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchGameweekData } from "@/app/api/utils";
import { filterData } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import PitchRow from "./PitchRow";

import { useEffect } from "react";
import Pitch from "../../public/pitch.svg";
import { Button } from "../ui/button";
export default function Gameweek(props: { gameweek: number }) {
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

  // set the current gameweek
  useEffect(() => {
    setCurrentGameweek(props.gameweek);
  }, [props.gameweek, setCurrentGameweek]);

  const { data: session } = useSession();

  const { data: gameweekData } = useQuery({
    queryKey: ["gameweekData", currentGameweek, session?.accessToken],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await fetchGameweekData(
        currentGameweek,
        session?.accessToken!
      );
      return response.json();
    },

    enabled: !!session?.accessToken,
    staleTime: 60 * 60 * 1000 * 24,
  });

  const { data } = useQuery({
    queryKey: [currentGameweek, drafts.changes],
    placeholderData: keepPreviousData,
    enabled: !!gameweekData,
    // staleTime: 60 * 60 * 1000 * 24,
    queryFn: async () => {
      const data: FPLGameweekPicksData = gameweekData;

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
      if (base.data && base.data.length > 0) {
        // some players are still selected in to transfer
        const remainingTransferOutSum = Object.values(transfers).reduce(
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

        for (let draftChange of gameweekDraft) {
          // swap players in the team
          draftData = await swapPlayers(draftData, draftChange);
          console.log(
            "Swapping",
            draftChange.in.price,
            draftChange.out.price,
            "Bank",
            draftData.overall.bank,
            remainingTransferOutSum
          );
        }

        setPicks({
          data: draftData.data,
          overall: {
            ...draftData.overall,
            bank: draftData.overall.bank! + remainingTransferOutSum,
          },
        });

        draftData.overall.bank =
          draftData.overall.bank + remainingTransferOutSum;
        return draftData;
      } else if (data.data.length > 0) {
        setPicks(data);
        return data;
      }
    },
  });

  if (data && data.data && session) {
    return (
      <ReactQueryProvider>
        <div className="flex flex-col gap-2 lg:gap-1 h-full relative">
          <div className="flex flex-row justify-between">
            <Button
              onClick={() => setCurrentGameweek(currentGameweek - 1)}
              title="Previous Gameweek"
            >
              <ArrowLeftIcon className="w-4 h-4 lg:w-6 lg:h-6" />
            </Button>
            <div className="flex flex-row justify-around w-full">
              <GameweekStat title="Gameweek" value={currentGameweek} />
              <GameweekStat
                title="Transfers"
                value={`${
                  drafts.changes.filter(
                    (transfer) => transfer.gameweek == currentGameweek
                  ).length
                } / 5`}
              />
              <GameweekStat title="ITB" value={`${picks.overall.bank! / 10}`} />
              <GameweekStat title="Rank" value={data.overall.overall_rank} />
            </div>
            <Button
              onClick={() => setCurrentGameweek(currentGameweek + 1)}
              title="Next Gameweek"
            >
              <ArrowRightIcon className="w-4 h-4 lg:w-6 lg:h-6" />
            </Button>
          </div>

          <div>
            <div className="absolute h-[95%] w-full -z-10">
              <Image src={Pitch} alt="" layout="fill" objectFit="cover" />
            </div>
          </div>

          <div className="w-full z-0">
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
  } else {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <Loader2 className="mr-2 h-12 w-12 animate-spin" />
      </div>
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
    <div className="text-[10px] lg:text-xs flex flex-col w-10">
      <div className="font-light">{title}</div>
      <div className="font-black">{value}</div>
    </div>
  );
}
