import { auth } from "@/auth/main";
import GameweekSeed from "@/components/fixtures/gameweek-seed";
import Selector from "@/components/transfers/server";
import type { Metadata } from "next";
import { getGameweekStatusForSession } from "../../api";

export const metadata: Metadata = {
  title: "Players",
  description: "Browse and transfer players.",
};

export default async function PlayersPage() {
  const session = await auth();
  if (!session?.accessToken || !session.hasTeam) {
    return null;
  }

  const { nextGameweek: gameweek, seasonComplete } =
    await getGameweekStatusForSession(session);
  return (
    <div className="h-full min-h-0">
      <GameweekSeed gameweek={gameweek}>
        <Selector gameweek={gameweek} seasonComplete={seasonComplete} />
      </GameweekSeed>
    </div>
  );
}
