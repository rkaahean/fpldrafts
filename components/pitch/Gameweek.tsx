"use client";

import { FPLGameweekPicksData } from "@/app/api";
import { picksStore } from "@/app/store";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchGameweekData } from "@/app/api/utils";
import { resolveGameweekPicks } from "@/lib/fpl/gameweek";
import { checkBudget } from "@/lib/fpl/squad";
import {
  computeFreeTransfers,
  computeTransferCost,
  countTransfersInGameweek,
} from "@/lib/fpl/transfers";
import { filterData } from "@/scripts/lib/utils";
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
    setCommittedBank: state.setCommittedBank,
    dbbase: state.base!,
    drafts: state.drafts,
    currentGameweek: state.currentGameweek,
    picks: state.picks!,
    committedBank: state.committedBank,
    transfers: state.transfersOut,
  }));

  const {
    setBase,
    setPicks,
    setCommittedBank,
    setCurrentGameweek,
    dbbase,
    drafts,
    currentGameweek,
    picks,
    committedBank,
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
      const parsed: FPLGameweekPicksData = JSON.parse(gameweekData);

      const resolved = await resolveGameweekPicks({
        parsed,
        dbbase,
        draftChanges: drafts.changes,
        currentGameweek,
        transfersOut: transfers,
      });

      if (!resolved) {
        return undefined;
      }

      if (resolved.setBase && resolved.base) {
        setBase(resolved.base);
      }
      setCommittedBank(resolved.committedBank);
      setPicks(resolved.picks);

      return resolved.picks;
    },
  });

  if (data && data.data && data.overall && session) {
    const transferCount = computeFreeTransfers({
      currentGameweek,
      draftChanges: drafts.changes,
      serverTransferCount: data.transfers?.length ?? 0,
    });

    const transfersMade = countTransfersInGameweek(
      drafts.changes,
      currentGameweek
    );

    const transferCost = computeTransferCost(transfersMade, transferCount);

    const budget =
      committedBank !== undefined ? checkBudget(committedBank) : undefined;

    return (
      <div className="flex flex-col gap-2 lg:gap-1 h-full relative">
        <div className="flex flex-row justify-between gap-2">
          <Button
            onClick={() =>
              setCurrentGameweek(Math.max(1, currentGameweek - 1))
            }
            disabled={currentGameweek <= 1}
            variant="secondary"
            title="Previous Gameweek"
          >
            <ArrowLeft className="w-4 h-4 lg:w-6 lg:h-6" />
          </Button>
          <div className="flex flex-row justify-around w-full items-center">
            <GameweekStat title="Points" value={data.overall.points} />
            <GameweekStat title="Gameweek" value={currentGameweek} />
            <GameweekStat
              title="Transfers"
              value={`${transfersMade} / ${transferCount}`}
            />
            <GameweekStat
              title="Hit"
              value={transferCost === 0 ? "0" : `${transferCost}`}
            />
            <GameweekStat title="ITB" value={`${picks.overall.bank! / 10}`} />
            {budget && !budget.valid && (
              <GameweekStat title="Budget" value="Over" />
            )}
            <GameweekStat
              title="Rank"
              value={data.overall.overall_rank!.toLocaleString()}
            />
          </div>
          <Button
            onClick={() =>
              setCurrentGameweek(Math.min(38, currentGameweek + 1))
            }
            disabled={currentGameweek >= 38}
            title="Next Gameweek"
            variant="secondary"
          >
            <ArrowRight className="w-4 h-4 lg:w-6 lg:h-6" />
          </Button>
        </div>

        <div>
          <div className="absolute h-[60vh] lg:h-[92vh] w-full -z-10">
            <Image src={Pitch} alt="" layout="fill" objectFit="cover" />
          </div>
        </div>

        <div className="w-full z-0 flex flex-col">
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
    <div className="text-[8px] lg:text-xs 2xl:text-sm flex flex-col w-10 lg:w-14 2xl:w-48">
      <div className="font-light text-muted-foreground truncate">{title}</div>
      <div className="font-semibold text-xs lg:text-sm 2xl:text-xl">
        {value}
      </div>
    </div>
  );
}
