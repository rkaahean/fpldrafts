import { picksStore } from "@/app/store";
import { PlayerData, updateTransfer } from "@/app/store/utils";
import { cn } from "@/lib/utils";
import { Cross2Icon, DoubleArrowDownIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import Image from "next/image";
import { isMobile } from "react-device-detect";

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
    <motion.div
      className={cn(
        "flex flex-row w-16 h-16 lg:w-32 lg:h-32 2xl:w-36 2xl:h-36 border rounded-md p-0.5 lg:p-2 text-player-foreground",
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

      <div className="w-9/12 text-xs flex flex-col h-full items-end">
        <div className="h-1/12">
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
              <DoubleArrowDownIcon className="w-2 h-2 lg:w-3 lg:h-3" />
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
              <Cross2Icon className="w-2 h-2 lg:w-3 lg:h-3" />
            </div>
          </button>
        </div>
        <div className="flex flex-col h-full w-full">
          <PlayerDescription data={props.data} />
          {!isMobile && <PlayerStatsTicker data={props.data} />}
        </div>
      </div>
    </motion.div>
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
  for (let idx = gameweek; idx < gameweek + 4; idx++) {
    const fixture = fixtures.filter((fixture) => fixture.event == idx);
    if (fixture.length === 0) {
      formattedFixtures.push({
        id: idx,
        event: idx,
        name: "-",
      });
    } else if (fixture.length == 1) {
      formattedFixtures.push(fixture[0]);
    } else {
      formattedFixtures.push(fixture);
    }
  }

  return (
    <div className="w-3/12 grid grid-rows-4 text-[8px] lg:text-xs tracking-tighter">
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
              className="flex flex-col text-center justify-center"
            >
              <div>{fixture.name}</div>
            </div>
          );
        }
      })}
    </div>
  );
}

function PlayerStatsTicker({ data }: { data: PlayerData }) {
  return (
    <div className="h-fit lg:h-1/6 grid grid-cols-3 text-[6px] lg:text-[11px] w-full">
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

function PlayerDescription({
  data,
}: {
  data: {
    team_code: number;
    web_name: string;
  };
}) {
  return (
    <div className="flex flex-col lg:h-5/6 items-center justify-around">
      <div className="w-[30px] h-[30px] lg:h-16 lg:w-16">
        <Image
          src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${data.team_code}-110.webp`}
          alt="Player"
          width={40}
          height={40}
          priority
          className="w-full h-full object-contain"
        />
      </div>
      <div className="text-[8px] lg:text-xs h-fit font-semibold tracking-tighter truncate text-ellipsis max-w-full px-1">
        {data.web_name}
      </div>
    </div>
  );
}
