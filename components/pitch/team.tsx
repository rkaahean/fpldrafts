"use client";

import { isMobile } from "react-device-detect";
import { RemoveAll } from "../drafts/remove";
import DraftChanges from "../drafts/table/changes";
import DraftSave from "../drafts/table/save";
import DraftUpdate from "../drafts/update";
import Gameweek from "./Gameweek";

export default function Team() {
  return (
    <div className="w-full h-fit lg:min-h-full flex flex-row justify-start gap-1">
      {!isMobile && (
        <nav className="flex flex-col justify-center gap-4">
          <RemoveAll />
          {/* <ResetAll /> */}
          {/* <ResetCurrentGameweek /> */}
          <DraftSave />
          <DraftChanges />
          <DraftUpdate />
        </nav>
      )}
      <div className="flex flex-col flex-grow">
        <Gameweek />
      </div>
    </div>
  );
}
