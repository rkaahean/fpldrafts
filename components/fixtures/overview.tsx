import { FPLFixtures, getAllFixtures } from "@/app/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default async function Fixtures() {
  const data = await getAllFixtures();

  type TransformedFixture = {
    event: number;
    team_id: string;
    short_name: string;
    is_home: boolean;
  };

  type Team = {
    team_id: string;
    short_name: string;
    fixtures: TransformedFixture[];
  };

  function transformData(fixtures: FPLFixtures[]): Team[] {
    const teams: { [key: string]: Team } = {};

    fixtures.forEach((fixture) => {
      const homeTeamId = fixture.team_h_id;
      const awayTeamId = fixture.team_a_id;
      const event = fixture.event;
      const homeShortName = fixture.fpl_team_h.short_name;
      const awayShortName = fixture.fpl_team_a.short_name;

      // Add the fixture to the home team
      if (!teams[homeTeamId]) {
        teams[homeTeamId] = {
          team_id: homeTeamId,
          short_name: homeShortName,
          fixtures: [],
        };
      }
      teams[homeTeamId].fixtures.push({
        event,
        team_id: awayTeamId,
        short_name: awayShortName,
        is_home: true,
      });

      // Add the fixture to the away team
      if (!teams[awayTeamId]) {
        teams[awayTeamId] = {
          team_id: awayTeamId,
          short_name: awayShortName,
          fixtures: [],
        };
      }
      teams[awayTeamId].fixtures.push({
        event,
        team_id: homeTeamId,
        short_name: homeShortName,
        is_home: false,
      });
    });

    return Object.values(teams).sort((a, b) =>
      a.short_name > b.short_name ? 1 : -1
    );
  }

  const formattedData = transformData(data);
  return (
    <div>
      <div className="text-sm font-black">Fixtures</div>
      <Table>
        <TableHeader>
          <TableRow className="grid grid-cols-7 h-6">
            <TableHead className="col-span-2"></TableHead>
            <TableHead>GW34</TableHead>
            <TableHead>GW35</TableHead>
            <TableHead>GW36</TableHead>
            <TableHead>GW37</TableHead>
            <TableHead>GW38</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formattedData.map((data, row) => {
            return (
              <TableRow className="grid grid-cols-7" key={row}>
                <TableCell className="col-span-2">{data.short_name}</TableCell>
                {data.fixtures.slice(0, 5).map((fixture, row) => {
                  return (
                    <TableCell key={row}>
                      {fixture.is_home
                        ? fixture.short_name
                        : fixture.short_name.toLowerCase()}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
