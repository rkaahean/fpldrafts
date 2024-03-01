import { Draft, columns } from "./columns";
import { DataTable } from "./data-table";

export default function Drafts() {
  const data: Draft[] = [
    {
      id: "728ed52f",
      name: "Draft 1",
      createdAt: new Date("2022-03-01").toDateString(),
      basedOn: "GW 27",
    },
    {
      id: "728ed52f",
      name: "Draft 2",
      createdAt: new Date("2022-03-01").toDateString(),
      basedOn: "GW 28",
    },
    {
      id: "728ed52f",
      name: "Draft 3",
      createdAt: new Date("2022-03-01").toDateString(),
      basedOn: "GW 29",
    },
    {
      id: "728ed52f",
      name: "Draft 4",
      createdAt: new Date("2022-03-01").toDateString(),
      basedOn: "GW 30",
    },
  ];

  return (
    <div className="h-full">
      <div className="p-2 flex flex-col gap-2">
        <div className="text-lg font-semibold">Drafts</div>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
