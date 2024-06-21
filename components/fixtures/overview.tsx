import { getAllFixtures, getLatestGameweek } from "@/app/api";
import { Table } from "lucide-react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default async function Fixtures() {
  const data = await getAllFixtures();
  const max_gameweek = (await getLatestGameweek()!)._max.gameweek;

  const groupByHomeTeam = data.reduce<{
    [key: number]: { home: string; away: string; code: number }[];
  }>((acc, curr) => {
    const { event, team_h_id, team_a_id, ...rest } = curr;

    if (!acc[event]) {
      acc[event] = [];
    }
    acc[event].push({
      home: rest.fpl_team_h.short_name,
      away: rest.fpl_team_a.short_name,
      code: rest.code,
    });
    return acc;
  }, {});

  for (let i = max_gameweek!; i <= max_gameweek! + 4; i++) {}

  return (
    <div>
      <div className="text-sm font-black">Fixtures</div>
      {/* <tr className="w-full grid grid-cols-10">
        <th className="col-span-4">Gameweek</th>
        <th>33</th>
        <th>34</th>
        <th>35</th>
        <th>36</th>
        <th>37</th>
      </tr> */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">Gameweek</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">INV001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell className="text-right">$250.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {/* {groupByHomeTeam[max_gameweek!].map((fixture) => {
        return (
          <div key={fixture.code}>
            {fixture.home} - {fixture.away}
          </div>
        );
      })} */}
    </div>
  );
}
