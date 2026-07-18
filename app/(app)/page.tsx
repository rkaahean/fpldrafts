import { auth } from "@/auth/main";
import Team from "@/components/pitch/team";
import MiniSelector from "@/components/transfers/mini-selector";

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
    <div className="h-full min-h-0 w-full">
      <Team gameweek={newGameweek} playerSelector={<MiniSelector />} />
    </div>
  );
}
