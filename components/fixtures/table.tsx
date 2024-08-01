"use client";

import { FPLFixtures, getAllFixtures } from "@/app/api";
import { picksStore } from "@/app/store";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import Heading from "../text/heading";
import { Skeleton } from "../ui/skeleton";
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
    difficulty: number;
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
      const homeFixtureDifficulty = fixture.team_h_difficulty;

      const awayShortName = fixture.fpl_team_a.short_name;
      const awayFullName = fixture.fpl_team_a.name;
      const awayFixtureDifficulty = fixture.team_a_difficulty;

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
        difficulty: homeFixtureDifficulty,
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
        difficulty: awayFixtureDifficulty,
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
  if (!data) {
    return (
      <div className="flex flex-col w-full h-full">
        <Heading text={"Fixtures"} />
        <Skeleton className="w-full h-full rounded-md flex flex-col items-center justify-center">
          <Loader2 className="mr-2 h-12 w-12 animate-spin" />
        </Skeleton>
      </div>
    );
  }

  const formattedData = transformData(data?.data!);

  return (
    <div className="h-full flex flex-col">
      <Heading text={"Fixtures"} />
      <div className="rounded-sm bg-bgsecondary flex-grow">
        <Table>
          <TableHeader>
            <TableRow className="grid grid-cols-7 h-6">
              <TableHead className="col-span-2"></TableHead>
              {Array.from({ length: maxGameweek + 1 }, (_, i) => i).map(
                (number) => {
                  return (
                    <TableHead key={number}>{`GW${
                      gameweek + number
                    }`}</TableHead>
                  );
                }
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedData.map((data, row) => {
              return (
                <TableRow className="grid grid-cols-7 h-6 text-xs" key={row}>
                  <td className="col-span-2 w-full flex h-full items-center px-1">
                    <div>{data.full_name}</div>
                  </td>
                  {gameweeks.map((gw) => {
                    const allFixtures = data.fixtures.filter(
                      (gameweekFixture) => gameweekFixture.event == gw
                    );
                    if (allFixtures.length == 0) {
                      return <TableCell key={0}>-</TableCell>;
                    } else if (allFixtures.length == 1) {
                      return (
                        <TableCell
                          key={allFixtures[0].event}
                          className={clsx(
                            getFixtureColorFromDifficulty(
                              allFixtures[0].difficulty
                            )
                          )}
                        >
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
    </div>
  );
}

function getFixtureColorFromDifficulty(strength: number): string {
  switch (strength) {
    case 1:
      return "bg-green-300";
    case 2:
      return "bg-green-500 text-black";
    case 3:
      return "bg-neutral-400 text-black";
    case 4:
      return "bg-rose-500";
    case 5:
      return "bg-rose-950";
    default:
      return "";
  }
}
