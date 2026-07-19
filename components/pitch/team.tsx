"use client";

import { RemoveAll } from "../drafts/remove";
import DraftChanges from "../drafts/table/changes";
import DraftSave from "../drafts/table/save";
import DraftUpdate from "../drafts/update";
import PlayerPane from "../transfers/player-pane";
import Gameweek from "./Gameweek";
import type { ReactNode } from "react";

export default function Team(props: {
  gameweek: number;
  seasonComplete?: boolean;
  playerSelector?: ReactNode;
}) {
  const toolbar = (
    <nav
      aria-label="Draft actions"
      className="flex flex-row justify-center gap-1 rounded-full border bg-card/80 p-1 text-foreground backdrop-blur [&_button]:text-foreground [&_svg]:block [&_svg]:shrink-0"
    >
      <RemoveAll />
      {/* <ResetAll /> */}
      {/* <ResetCurrentGameweek /> */}
      <DraftSave />
      {props.playerSelector && <PlayerPane>{props.playerSelector}</PlayerPane>}
      <DraftChanges />
      <DraftUpdate />
    </nav>
  );

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
      <Gameweek
        gameweek={props.gameweek}
        seasonComplete={props.seasonComplete}
        toolbar={toolbar}
      />
    </div>
  );
}
