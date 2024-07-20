"use client";

import { FPLFixtures, getAllFixtures } from "@/app/api";
import { picksStore } from "@/app/store";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function Fixtures() {
  const gameweek = picksStore((state) => state.currentGameweek);
  const { data, isLoading } = useQuery({
    queryKey: [gameweek],
    queryFn: async () => {
      const response: {
        data: NonNullable<Awaited<ReturnType<typeof getAllFixtures>>>;
      } = await fetch("/api/fixtures", {
        method: "POST",
        body: JSON.stringify({
          gameweek,
          count: 5,
        }),
      }).then((res) => res.json());

      return response;
    },
  });

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
    full_name: string;
  };

  function transformData(fixtures: FPLFixtures[]): Team[] {
    const teams: { [key: string]: Team } = {};

    fixtures.forEach((fixture) => {
      const homeTeamId = fixture.team_h_id;
      const awayTeamId = fixture.team_a_id;
      const event = fixture.event;
      const homeShortName = fixture.fpl_team_h.short_name;
      const homeFullName = fixture.fpl_team_h.name;

      const awayShortName = fixture.fpl_team_a.short_name;
      const awayFullName = fixture.fpl_team_a.name;

      // Add the fixture to the home team
      if (!teams[homeTeamId]) {
        teams[homeTeamId] = {
          team_id: homeTeamId,
          short_name: homeShortName,
          fixtures: [],
          full_name: homeFullName,
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
          full_name: awayFullName,
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

  const maxGameweek = gameweek + 5 <= 38 ? 4 : 38 - gameweek;
  const gameweeks: number[] = [];
  for (let i = gameweek; i <= gameweek + maxGameweek; i++) {
    gameweeks.push(i);
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const formattedData = transformData(data?.data!);

  return (
    <div>
      <div className="text-sm font-black">Fixtures</div>
      <Table>
        <TableHeader>
          <TableRow className="grid grid-cols-7 h-6 text-xs">
            <TableHead className="col-span-2"></TableHead>
            {Array.from({ length: maxGameweek + 1 }, (_, i) => i).map(
              (number) => {
                return (
                  <TableHead key={number}>{`GW${gameweek + number}`}</TableHead>
                );
              }
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {formattedData.map((data, row) => {
            return (
              <TableRow className="grid grid-cols-7 h-6 text-xs" key={row}>
                <td className="col-span-2 w-full flex h-full items-center">
                  <div>{data.full_name}</div>
                </td>
                {gameweeks.map((gw, index) => {
                  const allFixtures = data.fixtures.filter(
                    (gameweekFixture) => gameweekFixture.event == gw
                  );
                  if (allFixtures.length == 0) {
                    return <TableCell key={0}>-</TableCell>;
                  } else if (allFixtures.length == 1) {
                    return (
                      <TableCell key={allFixtures[0].event}>
                        {allFixtures[0].is_home
                          ? allFixtures[0].short_name
                          : allFixtures[0].short_name.toLowerCase()}
                      </TableCell>
                    );
                  } else {
                    return (
                      <TableCell
                        key={gw}
                        className="grid grid-cols-2 gap-2 items-center justify-center text-center"
                      >
                        {allFixtures.map((fixture, index) => {
                          return (
                            <div
                              key={gw + index}
                              className="col-span-1 text-[10px]"
                            >
                              {fixture.is_home
                                ? fixture.short_name
                                : fixture.short_name.toLowerCase()}
                            </div>
                          );
                        })}
                      </TableCell>
                    );
                  }
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
