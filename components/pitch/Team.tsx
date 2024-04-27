"use client";

import { picksStore } from "@/app/store";
import DraftChanges from "../drafts/changes";
import DraftSave from "../drafts/save";
import Gameweek from "./Gameweek";

export default function Team() {
  const drafts = picksStore((state) => state.drafts);
  return (
    <div className="w-full min-h-full max-h-screen flex flex-col justify-start gap-5">
      <div className="flex flex-row gap-2 h-8 items-center">
        <DraftSave />
        <DraftChanges />
        <div className="mt-4">
          {drafts.id && (
            <div className="flex flex-col justify-end">
              <div className="text-xs italic font-light">{drafts.name}</div>
              <div className="text-sm font-medium">{drafts.description}</div>
            </div>
          )}
        </div>
      </div>
      <Gameweek />
    </div>
  );
}
