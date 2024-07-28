"use client";

import { RemoveAll } from "../drafts/remove";
import DraftChanges from "../drafts/table/changes";
import DraftSave from "../drafts/table/save";
import DraftUpdate from "../drafts/update";
import Gameweek from "./Gameweek";

export default function Team(props: { teamId: string }) {
  return (
    <div className="w-full min-h-full max-h-screen flex flex-row justify-start gap-1">
      <nav className="flex flex-col justify-center gap-4">
        <RemoveAll />
        {/* <ResetAll /> */}
        {/* <ResetCurrentGameweek /> */}
        <DraftSave teamId={props.teamId} />
        <DraftChanges />
        <DraftUpdate teamId={props.teamId} />
      </nav>
      <div className="flex flex-col flex-grow">
        <Gameweek />
      </div>
    </div>
  );
}
