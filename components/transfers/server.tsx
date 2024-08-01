import { getPlayerDataBySeason } from "@/app/api";
import ClientTable from "./client";

export default async function Selector() {
  const data = await getPlayerDataBySeason(process.env.FPL_SEASON_ID!);

  return <ClientTable data={data} />;
}
