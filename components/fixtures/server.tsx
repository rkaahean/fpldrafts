import { getAllFixtures } from "@/app/api";
import FixturesClient from "./table";

export default async function Fixtures() {
  const data = await getAllFixtures(1, 38, process.env.FPL_SEASON_ID!);

  return <FixturesClient fixtures={data} />;
}
