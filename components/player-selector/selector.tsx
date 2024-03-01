import { DataTable } from "../ui/data-table";
import { PlayerData, columns } from "./columns";

export default function Selector() {
  const data: PlayerData[] = [
    {
      id: "728ed52f",
      name: "Player 1",
      team: "Team 1",
      points: 100,
      xGI_90: 0.5,
      xA_90: 0.3,
      price: 100,
    },
    {
      id: "728ed52f",
      name: "Player 2",
      team: "Team 2",
      points: 90,
      xGI_90: 0.4,
      xA_90: 0.2,
      price: 90,
    },
    {
      id: "728ed52f",
      name: "Player 3",
      team: "Team 3",
      points: 80,
      xGI_90: 0.3,
      xA_90: 0.1,
      price: 80,
    },
    {
      id: "728ed52f",
      name: "Player 4",
      team: "Team 4",
      points: 70,
      xGI_90: 0.2,
      xA_90: 0.05,
      price: 70,
    },
  ];
  return (
    <div className="h-full">
      <div className="text-lg font-semibold">Players</div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
