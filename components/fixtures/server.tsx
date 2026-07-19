import { getAllFixtures } from "@/app/api";
import type { FPLFixtures } from "@/app/api";
import { unstable_cache } from "next/cache";
import FixturesClient from "./table";

export const getCachedFixtures = unstable_cache(
  async (seasonId: string) => getAllFixtures(1, 38, seasonId),
  ["fixtures"],
  { revalidate: 300 }
);

export default async function Fixtures({ fixtures }: { fixtures?: FPLFixtures[] }) {
  const data = fixtures ?? await getCachedFixtures(process.env.FPL_SEASON_ID!);

  return <FixturesClient fixtures={data} />;
}
