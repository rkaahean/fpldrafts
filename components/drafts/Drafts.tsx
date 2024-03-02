import { DataTable } from "../ui/data-table";
import { columns } from "./columns";
import { data } from "./data";

export default function Drafts() {
  return (
    <div className="px-2 flex flex-col h-full">
      <div className="text-lg font-semibold">Scenarios & Drafts</div>
      <DataTable
        columns={columns}
        data={data}
        name="drafts"
        isFilterable={false}
      />
    </div>
  );
}
