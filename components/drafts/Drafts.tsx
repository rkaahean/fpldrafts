import { getAllDrafts } from "@/app/api/data";
import { DataTable } from "../ui/data-table";
import { columns } from "./columns";

export default async function Drafts() {
  const data = await getAllDrafts();
  return (
    <div className="flex flex-col h-full">
      <div className="text-md font-semibold">Drafts</div>
      <DataTable
        columns={columns}
        data={data}
        name="drafts"
        isFilterable={false}
      />
    </div>
  );
}
