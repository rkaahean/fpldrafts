import { auth } from "@/auth/main";
import Fixtures from "@/components/fixtures/server";
import GameweekSeed from "@/components/fixtures/gameweek-seed";
import type { Metadata } from "next";
import { getNextGameweekForSession } from "../../api";

export const metadata: Metadata = {
  title: "Fixtures",
  description: "Upcoming fixture difficulty for every team.",
};

export default async function FixturesPage() {
  const session = await auth();
  if (!session?.accessToken || !session.hasTeam) {
    return null;
  }
  const newGameweek = await getNextGameweekForSession(session);

  return (
    <GameweekSeed gameweek={newGameweek}>
      <Fixtures />
    </GameweekSeed>
  );
}
