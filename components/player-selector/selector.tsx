import { getAllPlayerData } from "@/app/api/data";
import { DataTable } from "../ui/data-table";
import { columns } from "./columns";

export default async function Selector() {
  const data = await getAllPlayerData();
  return (
    <div className="h-full">
      <div className="text-lg font-semibold">Players</div>
      <DataTable columns={columns} data={data} name="players" isFilterable />
    </div>
  );
}
