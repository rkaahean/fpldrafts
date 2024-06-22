import { getAllPlayerData } from "@/app/api";
import ClientTable from "./client";

export default async function Selector() {
  const data = await getAllPlayerData();
  return (
    <div className="h-3">
      <div className="text-sm font-black">Players</div>
      <ClientTable data={data} />
    </div>
  );
}
