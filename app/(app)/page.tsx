import { auth } from "@/auth/main";
import Team from "@/components/pitch/team";
import MiniSelector from "@/components/transfers/mini-selector";
import PlayerPane from "@/components/transfers/player-pane";

import type { Metadata } from "next";
import { getNextGameweekForSession } from "../api";

export const metadata: Metadata = {
  title: "Home",
  description: "An overview of your FPL team.",
};

export default async function Home() {
  const session = await auth();
  if (!session?.accessToken || !session.hasTeam) {
    return null;
  }
  const newGameweek = await getNextGameweekForSession(session);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:h-full lg:items-start">
      <div className="flex-grow lg:h-full">
        <Team gameweek={newGameweek} />
      </div>
      <PlayerPane>
        <MiniSelector />
      </PlayerPane>
    </div>
  );
}
