import prisma from "./lib/db";
import { runWithConcurrencyLimit } from "./lib/concurrency";
import { flattenPlayerGameweekStats } from "../lib/fpl/sync-plan";

export const FETCH_CONCURRENCY = 10;
const WRITE_CONCURRENCY = 15;

export async function syncElementsData() {
  const players = await prisma.fPLPlayer.findMany({
    orderBy: {
      total_points: "desc",
    },
    where: {
      season_id: process.env.FPL_SEASON_ID!,
    },
  });

  const fetchResults = await runWithConcurrencyLimit(
    players,
    FETCH_CONCURRENCY,
    async (player) => {
      const data = await fetch(
        `https://fantasy.premierleague.com/api/element-summary/${player.player_id}/`
      ).then((res) => res.json());
      return { id: player.id, ...data };
    }
  );

  const playersData = fetchResults
    .filter((result) => result.status === "fulfilled")
    .map((result) => (result as { value: any }).value);

  const rows = flattenPlayerGameweekStats(playersData);

  await runWithConcurrencyLimit(rows, WRITE_CONCURRENCY, (row) =>
    prisma.fPLGameweekPlayerStats.upsert({
      where: {
        fpl_player_id_fixture_id: {
          fpl_player_id: row.fpl_player_id,
          fixture_id: row.fixture_id,
        },
      },
      create: row,
      update: row,
    })
  );
}

if (require.main === module) {
  syncElementsData()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
