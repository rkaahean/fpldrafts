"use client";

import { isMobile } from "react-device-detect";
import { RemoveAll } from "../drafts/remove";
import DraftChanges from "../drafts/table/changes";
import DraftSave from "../drafts/table/save";
import DraftUpdate from "../drafts/update";
import Gameweek from "./Gameweek";

export default function Team(props: { gameweek: number }) {
  return (
    <div className="w-full min-w-0 flex flex-col lg:flex-row lg:h-full lg:min-h-0 justify-start items-center lg:items-stretch gap-2">
      {isMobile ? (
        <nav className="flex flex-row justify-center gap-4">
          <RemoveAll />
          {/* <ResetAll /> */}
          {/* <ResetCurrentGameweek /> */}
          <DraftSave />
          {/* <DraftChanges /> */}
          <DraftUpdate />
        </nav>
      ) : (
        <nav className="flex flex-col justify-center items-center gap-2 2xl:gap-3 bg-card border rounded-md p-1.5 w-fit">
          <RemoveAll />
          {/* <ResetAll /> */}
          {/* <ResetCurrentGameweek /> */}
          <DraftSave />
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
