"use client";

import { picksStore } from "@/app/store";
import { ResetAll, ResetCurrentGameweek } from "../drafts/reset";
import DraftChanges from "../drafts/table/changes";
import DraftSave from "../drafts/table/save";
import DraftUpdate from "../drafts/update";
import Gameweek from "./Gameweek";

export default function Team(props: { teamId: string }) {
  const drafts = picksStore((state) => state.drafts);
  const gameweek = picksStore((state) => state.currentGameweek);
  const picks = picksStore((state) => state.picks);

  const setDrafts = picksStore((state) => state.setDrafts);
  const resetTransfers = picksStore((state) => state.resetTransfers);

  return (
    <div className="w-full min-h-full max-h-screen flex flex-row justify-start gap-1">
      <nav className="flex flex-col justify-center gap-4">
        <ResetAll />
        <ResetCurrentGameweek />
        <DraftSave teamId={props.teamId} />
        <DraftChanges />
        <DraftUpdate teamId={props.teamId} />
      </nav>
      <div className="flex flex-col flex-grow">
        <Gameweek teamId={props.teamId} />
      </div>
    </div>
  );
}
