import { picksStore } from "@/app/store";
import { PlayerData, updateTransfer } from "@/app/store/utils";
import { cn, elementTypeToPosition } from "@/lib/utils";
import { Cross2Icon, DoubleArrowDownIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import { isMobile } from "react-device-detect";
import { getFixtureColorFromDifficulty } from "../fixtures/table";

export default function Player(props: { data: PlayerData; gameweek: number }) {
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

  return (
    <div>
      {isSubstitute && (
        <div className="text-[10px] lg:text-xs 2xl:text-base text-background text-center tracking-tight font-bold">
          {elementTypeToPosition(props.data.element_type)}
        </div>
      )}

      <motion.div
        className={cn(
          "flex flex-row w-[68px] h-[72px] sm:w-20 h:20 lg:w-32 lg:h-32 2xl:w-48 2xl:h-48 border rounded-lg text-player-foreground",
          player?.player_id == props.data.player_id ? "bg-muted" : "bg-player",
          isSelectedForTransfer ? "bg-destructive" : ""
        )}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <PlayerFixtureTicker
          fixtures={props.data.fixtures}
          gameweek={props.gameweek}
        />

        <div className="w-9/12 text-xs flex flex-col h-full items-end p-0.5 lg:p-1">
          <div className="h-1/12 flex flex-row gap-0 2xl:gap-3">
            <button
              className="text-xs w-4 h-4 rounded-sm"
              onClick={() => {
                if (isSubstitute) {
                  subIn(props.data);
                } else {
                  subOut(props.data);
                }
                makeSubs();
              }}
            >
              <div className="flex flex-row justify-center">
                <DoubleArrowDownIcon className="w-[10px] h-[10px] lg:w-3 lg:h-3 2xl:w-6 2xl:h-6" />
              </div>
            </button>
            <button
              className="text-xs w-4 h-4 rounded-sm"
              onClick={() => {
                // if not already selected, push into state
                updateTransfer(
                  transfersOut,
                  props.data,
                  addToBank,
                  removeFromBank
                );
                // because transferrring in, reset subs
                resetSubs();
                setTransferOut(transfersOut);
              }}
            >
              <div className="flex flex-row justify-center">
                <Cross2Icon className="w-[10px] h-[10px] lg:w-3 lg:h-3 2xl:w-6 2xl:h-6" />
              </div>
            </button>
          </div>
          <div className="flex flex-col h-full w-full justify-between items-center">
            <div className="w-8 h-8 lg:h-14 lg:w-14 2xl:h-24 2xl:w-24">
              <Image
                src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${props.data.team_code}-110.webp`}
                alt="Player"
                width={80}
                height={80}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-[9px] lg:text-xs 2xl:text-lg h-fit font-semibold tracking-tighter truncate text-ellipsis max-w-full px-1">
              {`${props.data.web_name}`}
            </div>
            <div className="text-[10px]">{`${props.data.fixtures[0].name.toUpperCase()}`}</div>
            {!isMobile && <PlayerStatsTicker data={props.data} />}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PlayerFixtureTicker({
  fixtures,
  gameweek,
}: {
  fixtures: PlayerData["fixtures"];
  gameweek: number;
}) {
  const formattedFixtures = [];
  for (let idx = gameweek + 1; idx < gameweek + 5; idx++) {
    const fixture = fixtures.filter((fixture) => fixture.event == idx);
    if (fixture.length === 0) {
      formattedFixtures.push({
        id: idx,
        event: idx,
        name: "-",
        strength: 0,
      });
    } else if (fixture.length == 1) {
      formattedFixtures.push(fixture[0]);
    } else {
      formattedFixtures.push(fixture);
    }
  }

  return (
    <div className="w-3/12 grid grid-rows-4 text-[8px] lg:text-xs 2xl:text-base tracking-tighter">
      {formattedFixtures.map((fixture, idx) => {
        if (Array.isArray(fixture)) {
          return (
            <div
              className="grid grid-rows-2 text-xs tracking-tighter text-center border-[1px] rounded-sm border-stone-700 pb-1"
              key={idx}
            >
              {fixture.map((double_fixture) => {
                return (
                  <div key={double_fixture.id} className="row-span-1">
                    {double_fixture.name}
                  </div>
                );
              })}
            </div>
          );
        } else {
          return (
            <div
              key={fixture.id}
              className={clsx(
                "flex flex-col w-full items-center justify-center",
                getFixtureColorFromDifficulty(fixture.strength!),
                {
                  "rounded-tl-md": idx == 0,
                  "rounded-bl-md": idx == 3,
                }
              )}
            >
              {fixture.name}
            </div>
          );
        }
      })}
    </div>
  );
}

function PlayerStatsTicker({ data }: { data: PlayerData }) {
  return (
    <div className="h-fit lg:h-1/6 grid grid-cols-3 text-[6px] lg:text-[11px] 2xl:text-sm w-full">
      <div className="flex flex-col text-center justify-center">
        <div>{`£${data.selling_price / 10}`}</div>
      </div>
      <div className="flex flex-col text-center justify-center">
        <div>{`${data.total_points}`}</div>
      </div>
      <div className="flex flex-col text-center justify-center">
        <div>{`${data.expected_goal_involvements_per_90}`}</div>
      </div>
    </div>
  );
}
