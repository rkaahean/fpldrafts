"use client";

import { picksStore } from "@/app/store/picks";
import DraftChanges from "../drafts/DraftChanges";
import DraftSave from "../drafts/DraftSave";
import Gameweek from "./Gameweek";

export default function Team() {
  const drafts = picksStore((state) => state.drafts);
  return (
    <div className="w-full min-h-full flex flex-col justify-start gap-5">
      <div className="flex flex-row gap-2 h-4 items-center">
        <DraftSave />
        {/* <Timeline /> */}
        <DraftChanges />
        <div>
          {drafts.id && <div className="text-xs">Viewing - {drafts.name}</div>}
        </div>
      </div>
      <Gameweek />
    </div>
  );
}
