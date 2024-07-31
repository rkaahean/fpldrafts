import { getPlayerDataBySeason } from "@/app/api";
import ClientTable from "./client";

export default async function Selector() {
  const data = await getPlayerDataBySeason(
    "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865"
  );

  return <ClientTable data={data} />;
}
