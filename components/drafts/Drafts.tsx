import { Payment, columns } from "./columns";
import { DataTable } from "./data-table";

export default function Drafts() {
  const data: Payment[] = [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
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
