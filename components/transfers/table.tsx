import { getAllPlayerData } from "@/app/api";
import { DataTable } from "../ui/data-table";
import { columns } from "./columns";

export default async function Selector() {
  const data = await getAllPlayerData();
  return (
    <div className="h-3">
      <div className="text-sm font-black">Players</div>
      <DataTable
        columns={columns}
        data={data}
        name="players"
        isFilterable
        isPaginated
      />
    </div>
  );
}
