"use client";

import { isMobile } from "react-device-detect";
import { RemoveAll } from "../drafts/remove";
import DraftChanges from "../drafts/table/changes";
import DraftSave from "../drafts/table/save";
import DraftUpdate from "../drafts/update";
import Gameweek from "./Gameweek";

export default function Team(props: { gameweek: number }) {
  return (
    <div className="w-full h-fit lg:min-h-full flex flex-col lg:flex-row justify-start items-center gap-2">
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
        <nav className="flex flex-col justify-center gap-4 2xl:gap-12 bg-secondary rounded-md">
          <RemoveAll />
          {/* <ResetAll /> */}
          {/* <ResetCurrentGameweek /> */}
          <DraftSave />
          <DraftChanges />
          <DraftUpdate />
        </nav>
      )}
      <div className="flex flex-col flex-grow">
        <Gameweek gameweek={props.gameweek} />
      </div>
    </div>
  );
}
