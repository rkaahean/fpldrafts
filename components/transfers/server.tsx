import { getPlayerDataBySeason } from "@/app/api";
import { unstable_cache } from "next/cache";
import ClientTable from "./client";

const getCachedPlayerExplorerData = unstable_cache(
  async (seasonId: string, gameweek: number, lastCompletedGameweek: number) =>
    getPlayerDataBySeason(
      seasonId,
      undefined,
      gameweek,
      lastCompletedGameweek
    ),
  ["player-explorer"],
  { revalidate: 60 }
);

export default async function Selector({
  gameweek,
  seasonComplete = false,
}: {
  gameweek?: number;
  seasonComplete?: boolean;
}) {
  const data = gameweek
    ? await getCachedPlayerExplorerData(
        process.env.FPL_SEASON_ID!,
        gameweek,
        seasonComplete ? gameweek : Math.max(0, gameweek - 1)
      )
    : await getPlayerDataBySeason(process.env.FPL_SEASON_ID!);

  return <ClientTable data={data} />;
}
