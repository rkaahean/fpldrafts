"use client";

import { isMobile } from "react-device-detect";
import { RemoveAll } from "../drafts/remove";
import DraftChanges from "../drafts/table/changes";
import DraftSave from "../drafts/table/save";
import DraftUpdate from "../drafts/update";
import PlayerPane from "../transfers/player-pane";
import Gameweek from "./Gameweek";
import type { ReactNode } from "react";

export default function Team(props: { gameweek: number; playerSelector?: ReactNode }) {
  return (
    <div className="w-full min-w-0 flex flex-col lg:flex-row lg:h-full lg:min-h-0 justify-start items-center lg:items-stretch gap-2">
      {isMobile ? (
        <nav className="flex flex-row justify-center gap-4">
          <RemoveAll />
          {/* <ResetAll /> */}
          {/* <ResetCurrentGameweek /> */}
          <DraftSave />
          {props.playerSelector && <PlayerPane>{props.playerSelector}</PlayerPane>}
          {/* <DraftChanges /> */}
          <DraftUpdate />
        </nav>
      ) : (
        <nav
          aria-label="Draft actions"
          className="relative z-10 shrink-0 flex flex-col justify-center items-center gap-2 2xl:gap-3 bg-card border rounded-md p-1.5 w-fit text-foreground [&_button]:text-foreground [&_svg]:block [&_svg]:shrink-0"
        >
          <RemoveAll />
          {/* <ResetAll /> */}
          {/* <ResetCurrentGameweek /> */}
          <DraftSave />
          {props.playerSelector && <PlayerPane>{props.playerSelector}</PlayerPane>}
          <DraftChanges />
          <DraftUpdate />
        </nav>
      )}
      <div className="flex flex-col flex-grow min-w-0 w-full lg:min-h-0">
        <Gameweek gameweek={props.gameweek} />
      </div>
    </div>
  );
}
