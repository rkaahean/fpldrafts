import { DataTable } from "../ui/data-table";
import { columns } from "./columns";
import { data } from "./data";

export default function Selector() {
  return (
    <div className="h-full">
      <div className="text-lg font-semibold">Players</div>
      <DataTable columns={columns} data={data} name="players" isFilterable />
    </div>
  );
}
