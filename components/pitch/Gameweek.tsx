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
import PitchBackground from "./PitchBackground";
import PitchRow from "./PitchRow";
import TransferActivityStrip from "./transfer-activity";
import TrendChart from "./trend-chart";
import TransferCommandPalette from "./transfer-command-palette";

import { useRef } from "react";
import type { ReactNode } from "react";
import { isMobile } from "react-device-detect";
import { Button } from "../ui/button";
export default function Gameweek(props: {
  gameweek: number;
  seasonComplete?: boolean;
  toolbar?: ReactNode;
}) {
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
    transferSlots: state.transferSlots,
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
    transferSlots,
  } = picksSelectors;

  const transfersOutByType = transferSlots.reduce<{
    [key: number]: (typeof transferSlots)[number]["out"][];
  }>((buckets, slot) => {
    const bucket = buckets[slot.out.element_type] ?? [];
    bucket.push(slot.out);
    buckets[slot.out.element_type] = bucket;
    return buckets;
  }, {});

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
        transfersOut: transfersOutByType,
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
      seasonComplete: props.seasonComplete,
      historical: gameweekData?.transferActivity ?? [],
      draftChanges: drafts.changes,
      activeChip: gameweekData?.activeChip ?? null,
    });
    const seasonSummary = gameweekData?.overall ?? data.overall;
    const totalPoints = seasonSummary.total_points ?? seasonSummary.points;
    const squadPlayers = ["GK", "DEF", "MID", "FWD"].flatMap((position) =>
      filterData(data.data, position)
    );

    return (
      <div className="relative flex h-full min-h-0 flex-col gap-3">
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
          <div className="flex w-full items-center justify-around gap-2 overflow-x-auto">
            {!isMobile && (
              <>
                <GameweekStat title="Total points" value={totalPoints} />
                <GameweekStat
                  title="Overall rank"
                  value={
                    seasonSummary.overall_rank
                      ? seasonSummary.overall_rank.toLocaleString()
                      : "—"
                  }
                />
                <GameweekStat
                  title="Squad value"
                  value={`£${(seasonSummary.value / 10).toFixed(1)}`}
                />
                <GameweekStat title="Gameweek" value={currentGameweek} />
              </>
            )}
            <GameweekStat title="Bank" value={`£${picks.overall.bank! / 10}`} />
            <GameweekStat
              title="Transfers"
              value={`${transfersMade} / ${transferCount}`}
            />
            <GameweekStat
              title="Hit"
              value={transferCost === 0 ? "0" : `${transferCost}`}
            />
            {budget && !budget.valid && (
              <GameweekStat title="Budget" value="Over" />
            )}
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

        <div className="flex min-h-0 flex-1 flex-col gap-3 xl:grid xl:grid-cols-[minmax(13rem,0.8fr)_minmax(0,3.5fr)_minmax(14rem,1fr)] xl:gap-4">
          <aside className="order-2 min-h-0 xl:order-none">
            <TrendChart kind="value" history={gameweekData?.history ?? []} />
          </aside>
          <div className="order-1 relative min-h-0 flex-1 overflow-hidden rounded-md border bg-background/20 p-2 xl:order-none">
            <PitchBackground />
            {props.toolbar && (
              <div className="absolute right-2 top-2 z-10">
                <div className="flex items-center gap-1">
                  {props.toolbar}
                  <TransferCommandPalette players={squadPlayers} />
                </div>
              </div>
            )}
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
          <aside className="order-3 flex min-h-0 flex-col gap-3 xl:order-none">
            <TrendChart kind="rank" history={gameweekData?.history ?? []} />
            <div className="min-h-[12rem] flex-1 xl:min-h-0">
              <TransferActivityStrip {...transferActivity} />
            </div>
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
    <div className="flex min-w-12 flex-col text-[10px] lg:min-w-16 lg:text-xs 2xl:min-w-24 2xl:text-sm">
      <div className="font-light text-muted-foreground truncate">{title}</div>
      <div className="font-semibold text-xs lg:text-sm 2xl:text-xl">
        {value}
      </div>
    </div>
  );
}
