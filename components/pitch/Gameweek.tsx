"use client";

import { FPLGameweekPicksData } from "@/app/api";
import { picksStore } from "@/app/store";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchGameweekData } from "@/app/api/utils";
import { resolveGameweekPicks } from "@/lib/fpl/gameweek";
import { checkBudget } from "@/lib/fpl/squad";
import { selectTransferActivity } from "@/lib/fpl/transfer-activity";
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
import TransferActivityStrip from "./transfer-activity";

import { useRef } from "react";
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

  const seededGameweekRef = useRef<number | null>(null);
  let effectiveGameweek = currentGameweek;
  if (seededGameweekRef.current !== props.gameweek) {
    seededGameweekRef.current = props.gameweek;
    effectiveGameweek = props.gameweek;
    if (currentGameweek !== props.gameweek) {
      setCurrentGameweek(props.gameweek);
    }
  }

  const { data: session } = useSession();

  const { data: gameweekData } = useQuery({
    queryKey: ["gameweekData", effectiveGameweek, session?.accessToken],
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      const startedAt = performance.now();
      if (process.env.NODE_ENV === "development") {
        console.debug(
          `[gameweek client:${effectiveGameweek}] network fetch started`
        );
      }
      try {
        const response = await fetchGameweekData(
          effectiveGameweek,
          session?.accessToken!,
          signal
        );
        return response.json();
      } catch (error) {
        if (
          process.env.NODE_ENV === "development" &&
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          console.debug(
            `[gameweek client:${effectiveGameweek}] network fetch aborted`
          );
        }
        throw error;
      } finally {
        if (process.env.NODE_ENV === "development") {
          console.debug(
            `[gameweek client:${effectiveGameweek}] network fetch finished in ${(performance.now() - startedAt).toFixed(1)}ms`
          );
        }
      }
    },

    enabled: !!session?.accessToken,
    staleTime: 60 * 60 * 1000 * 24,
  });

  const { data } = useQuery({
    queryKey: [effectiveGameweek, drafts.changes],
    placeholderData: keepPreviousData,
    enabled: !!gameweekData,
    // staleTime: 60 * 60 * 1000 * 24,
    queryFn: async () => {
      const parsed: FPLGameweekPicksData = gameweekData;

      const resolved = await resolveGameweekPicks({
        parsed,
        dbbase,
        draftChanges: drafts.changes,
        currentGameweek: effectiveGameweek,
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
      serverTransferCount: data.transferCount ?? 0,
    });

    const transfersMade = countTransfersInGameweek(
      drafts.changes,
      currentGameweek
    );

    const transferCost = computeTransferCost(transfersMade, transferCount);

    const budget =
      committedBank !== undefined ? checkBudget(committedBank) : undefined;
    const transferActivity = selectTransferActivity({
      currentGameweek,
      nextGameweek: props.gameweek,
      historical: gameweekData?.transferActivity ?? [],
      draftChanges: drafts.changes,
    });

    return (
      <div className="relative flex h-full flex-col gap-3 lg:min-h-0">
        <div className="flex flex-row justify-between gap-3 rounded-md border bg-background/30 p-2 flex-shrink-0">
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
          <div className="flex w-full items-center justify-around gap-2">
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

        <div className="flex min-h-[400px] flex-1 flex-col gap-3 lg:min-h-0 lg:flex-row lg:gap-4">
          <div className="relative min-h-[400px] flex-1 rounded-md border bg-background/20 p-2 lg:min-h-0">
            <Image
              src={Pitch}
              alt=""
              fill
              className="pointer-events-none -z-10 select-none object-contain"
            />
            <div className="relative z-0 grid h-full w-full grid-rows-[1fr_1fr_1fr_1fr_1.15fr]">
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
          <aside className="order-first w-full shrink-0 lg:order-none lg:min-h-0 lg:w-60 xl:w-72">
            <TransferActivityStrip {...transferActivity} />
          </aside>
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
