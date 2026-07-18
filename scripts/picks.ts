import prisma from "./lib/db";
import { syncGameweeks } from "./utils";
import {
  computeLatestCompletedGameweek,
  computeGameweeksToSync,
} from "@/lib/fpl/sync-plan";
import { runWithConcurrencyLimit } from "./lib/concurrency";

const TEAM_CONCURRENCY = 8;

export async function syncAllTeams() {
  const teams = await prisma.fPLTeam.findMany({
    where: { fpl_season_id: process.env.FPL_SEASON_ID! },
  });

  const fixtures = await prisma.fPLFixtures.findMany({
    where: { season_id: process.env.FPL_SEASON_ID! },
    select: { event: true, finished: true },
  });
  const latestCompleted = computeLatestCompletedGameweek(fixtures);

  const results = await runWithConcurrencyLimit(
    teams,
    TEAM_CONCURRENCY,
    async (team) => {
      const latestSynced = await prisma.fPLGameweekPicks.aggregate({
        _max: { gameweek: true },
        where: { fpl_team_id: team.id },
      });
      const gameweeks = computeGameweeksToSync(
        latestSynced._max.gameweek,
        latestCompleted
      );
      if (gameweeks.length === 0) {
        return;
      }
      await syncGameweeks(team.id, team.team_id, gameweeks);
    }
  );

  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length > 0) {
    console.error(
      `${failures.length}/${teams.length} teams failed to sync`,
      failures
    );
  }
}

if (require.main === module) {
  syncAllTeams()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
