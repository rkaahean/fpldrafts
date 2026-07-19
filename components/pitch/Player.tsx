import { picksStore } from "@/app/store";
import { PlayerData, updateTransfer } from "@/app/store/utils";
import {
  cn,
  elementTypeToPosition,
  getFixtureIntensityClass,
} from "@/scripts/lib/utils";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ArrowDownToLine, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import PlayerDetailSheet from "./player-detail-sheet";

export default function Player(props: { data: PlayerData; gameweek: number }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const subIn = picksStore((store) => store.setSubstituteIn);
  const subOut = picksStore((store) => store.setSubstituteOut);
  const makeSubs = picksStore((store) => store.makeSubs);
  const resetSubs = picksStore((store) => store.resetSubs);

  const substitutedIn = picksStore((store) => store.substitutedIn);
  const substitutedOut = picksStore((store) => store.substitutedOut);

  const transfersOut = picksStore((store) => store.transfersOut);

  const setTransferOut = picksStore((store) => store.setTransferOut);
  const addToBank = picksStore((store) => store.addToBank);
  const removeFromBank = picksStore((store) => store.removeFromBank);

  const isSubstitute = props.data.position > 11;
  const isSelectedForTransfer =
    transfersOut[props.data.element_type].filter(
      (transfer) => transfer.player_id == props.data.player_id
    ).length > 0;
  const player = isSubstitute ? substitutedIn : substitutedOut;
  const isAvailabilityConcern =
    !!props.data.status && props.data.status !== "a";

  const nextFixture = props.data.fixtures.find(
    (fixture) => fixture.event == props.gameweek
  );

  return (
    <div className="flex flex-col h-full min-h-0 items-center justify-center">
      {isSubstitute && (
        <div className="flex-shrink-0 text-[8px] lg:text-xs 2xl:text-base text-background text-center tracking-tight font-bold">
          {elementTypeToPosition(props.data.element_type)}
        </div>
      )}

      <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center">
        <motion.div
          className="h-full min-h-0"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            className={cn(
              "relative flex h-auto max-h-[92%] w-28 min-w-28 max-w-[11rem] aspect-[0.78] flex-col rounded-lg border text-player-foreground shadow-sm sm:w-32 lg:w-36 2xl:w-44",
              player?.player_id == props.data.player_id
                ? "bg-muted"
                : "bg-player",
              isSelectedForTransfer ? "bg-destructive" : ""
            )}
          >
            <div className="absolute left-1 top-1 z-10 flex flex-row gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-sm p-0"
                aria-label="Substitute player"
                onClick={(event) => {
                  event.stopPropagation();
                  if (isSubstitute) {
                    subIn(props.data);
                  } else {
                    subOut(props.data);
                  }
                  makeSubs();
                }}
              >
                <ArrowDownToLine className="w-[10px] h-[10px] lg:w-3 lg:h-3 2xl:w-6 2xl:h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-sm p-0"
                aria-label="Remove player"
                onClick={(event) => {
                  event.stopPropagation();
                  updateTransfer(
                    transfersOut,
                    props.data,
                    addToBank,
                    removeFromBank
                  );
                  resetSubs();
                  setTransferOut(transfersOut);
                }}
              >
                <X className="w-[10px] h-[10px] lg:w-3 lg:h-3 2xl:w-6 2xl:h-6" />
              </Button>
            </div>

            {isAvailabilityConcern && (
              <span
                aria-label="Availability concern"
                title={props.data.news || "Availability concern"}
                className="absolute right-1 top-1 z-10 h-2 w-2 rounded-full bg-destructive-foreground ring-1 ring-destructive"
              />
            )}

            <CardContent
              role="button"
              aria-label="View player details"
              tabIndex={0}
              onClick={() => setDetailOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setDetailOpen(true);
                }
              }}
              className="flex h-full min-h-0 flex-1 cursor-pointer flex-col items-center justify-between gap-0 px-1 pb-1 pt-4"
            >
              <div className="flex min-h-0 w-full max-h-10 flex-1 items-center justify-center sm:max-h-12 lg:max-h-14">
                <Image
                  src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${props.data.team_code}-110.webp`}
                  alt="Player"
                  width={110}
                  height={110}
                  unoptimized
                  className="h-full max-h-full w-auto max-w-full object-contain"
                />
              </div>
              <div className="w-full flex-shrink-0 truncate text-ellipsis px-1 text-center text-[9px] font-semibold tracking-tighter lg:text-xs 2xl:text-base">
                {props.data.web_name}
              </div>
              <PlayerGlanceRow data={props.data} nextFixture={nextFixture} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <PlayerDetailSheet
        data={props.data}
        gameweek={props.gameweek}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}

function PlayerGlanceRow({
  data,
  nextFixture,
}: {
  data: PlayerData;
  nextFixture: PlayerData["fixtures"][number] | undefined;
}) {
  return (
    <div className="grid w-full grid-cols-3 gap-0.5 text-[8px] leading-tight lg:text-[10px] 2xl:text-sm">
      <div
        className="flex min-w-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-sm bg-muted/40 px-0.5 py-0.5"
        title="Price"
      >
        {`£${data.selling_price / 10}`}
      </div>
      <div
        className={clsx(
          "flex min-w-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-sm px-0.5 py-0.5",
          nextFixture
            ? getFixtureIntensityClass(nextFixture.strength!)
            : "bg-muted/40"
        )}
        title="Next fixture"
      >
        {nextFixture
          ? `${nextFixture.name.toUpperCase()} (${nextFixture.location})`
          : "-"}
      </div>
      <div
        className="flex min-w-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-sm bg-muted/40 px-0.5 py-0.5"
        title="Total points"
      >
        {data.total_points}
      </div>
    </div>
  );
}
