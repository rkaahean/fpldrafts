"use client";

import { FPLFixtures } from "@/app/api";
import { picksStore } from "@/app/store";
import {
  fixtureGameweeks,
  fixtureRunSummaries,
  type TeamFixtureRun,
} from "@/lib/fpl/fixtures";
import { cn, getFixtureIntensityClass } from "@/scripts/lib/utils";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

type TransformedFixture = {
  event: number;
  team_id: string;
  short_name: string;
  is_home: boolean;
  difficulty: number;
};

type Team = Omit<TeamFixtureRun, "fixtures"> & {
  short_name: string;
  fixtures: TransformedFixture[];
};

function transformData(fixtures: FPLFixtures[]): Team[] {
  const teams: Record<string, Team> = {};

  fixtures.forEach((fixture) => {
    const homeTeamId = fixture.team_h_id;
    const awayTeamId = fixture.team_a_id;

    if (!teams[homeTeamId]) {
      teams[homeTeamId] = {
        team_id: homeTeamId,
        short_name: fixture.fpl_team_h.short_name,
        full_name: fixture.fpl_team_h.name,
        fixtures: [],
      };
    }
    teams[homeTeamId].fixtures.push({
      event: fixture.event,
      team_id: awayTeamId,
      short_name: fixture.fpl_team_a.short_name,
      is_home: true,
      difficulty: fixture.team_h_difficulty,
    });

    if (!teams[awayTeamId]) {
      teams[awayTeamId] = {
        team_id: awayTeamId,
        short_name: fixture.fpl_team_a.short_name,
        full_name: fixture.fpl_team_a.name,
        fixtures: [],
      };
    }
    teams[awayTeamId].fixtures.push({
      event: fixture.event,
      team_id: homeTeamId,
      short_name: fixture.fpl_team_h.short_name,
      is_home: false,
      difficulty: fixture.team_a_difficulty,
    });
  });

  return Object.values(teams).sort((left, right) =>
    left.short_name.localeCompare(right.short_name)
  );
}

function FixtureCell({ fixtures }: { fixtures: TransformedFixture[] }) {
  if (fixtures.length === 0) {
    return (
      <div className="flex min-h-11 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
        —
      </div>
    );
  }

  return (
    <div className="flex min-h-11 flex-col gap-1">
      {fixtures.map((fixture) => (
        <div
          key={`${fixture.event}-${fixture.team_id}`}
          className={cn(
            getFixtureIntensityClass(fixture.difficulty),
            "flex flex-1 items-center justify-between rounded-md px-2 text-xs font-semibold shadow-sm"
          )}
        >
          <span>{fixture.is_home ? `vs ${fixture.short_name}` : `@ ${fixture.short_name}`}</span>
          <span className="rounded-full border border-current/50 px-1.5 py-0.5 text-[10px] leading-none">
            {fixture.difficulty}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function FixturesClient(props: { fixtures: FPLFixtures[] }) {
  const gameweek = picksStore((state) => state.currentGameweek);
  const setCurrentGameweek = picksStore((state) => state.setCurrentGameweek);
  const gameweeks = fixtureGameweeks(gameweek);

  if (!props.fixtures) {
    return <Skeleton className="h-full w-full rounded-lg" />;
  }

  const teams = transformData(props.fixtures);
  const summaries = fixtureRunSummaries(teams, gameweeks);
  const gridTemplateColumns = `minmax(11rem, 1.35fr) repeat(${gameweeks.length}, minmax(8rem, 1fr))`;

  return (
    <Card className="h-full min-h-0 overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-4 border-b px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            Fixture planner
          </CardTitle>
          <CardDescription className="mt-1">
            Gameweeks {gameweeks[0]}–{gameweeks.at(-1)} · home and away form
          </CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Previous gameweek"
            title="Previous gameweek"
            disabled={gameweek <= 1}
            onClick={() => setCurrentGameweek(gameweek - 1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Next gameweek"
            title="Next gameweek"
            disabled={gameweek >= 38}
            onClick={() => setCurrentGameweek(gameweek + 1)}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex h-full min-h-0 flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-col justify-between gap-3 rounded-md border bg-background/40 p-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Difficulty</span>
            {[1, 2, 3, 4, 5].map((difficulty) => (
              <span
                key={difficulty}
                className={cn(
                  getFixtureIntensityClass(difficulty),
                  "rounded-md px-2 py-1 font-semibold"
                )}
              >
                {difficulty}
              </span>
            ))}
            <span>1 easiest · 5 hardest</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {summaries.easiest && (
              <Badge variant="outline" className="gap-1.5 border-success/40 bg-success/10">
                Best run <strong>{summaries.easiest.full_name}</strong>
                <span className="text-muted-foreground">{summaries.easiest.averageDifficulty.toFixed(1)}</span>
              </Badge>
            )}
            {summaries.hardest && (
              <Badge variant="outline" className="gap-1.5 border-destructive/40 bg-destructive/10">
                Toughest <strong>{summaries.hardest.full_name}</strong>
                <span className="text-muted-foreground">{summaries.hardest.averageDifficulty.toFixed(1)}</span>
              </Badge>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto rounded-md border bg-background/30">
          <div className="min-w-[42rem] p-2">
            <div className="grid gap-2 pb-2" style={{ gridTemplateColumns }}>
              <div className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Team
              </div>
              {gameweeks.map((fixtureGameweek) => (
                <div
                  key={fixtureGameweek}
                  className="rounded-md bg-muted px-2 py-1.5 text-center text-xs font-semibold"
                >
                  GW {fixtureGameweek}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              {teams.map((team) => (
                <div
                  key={team.team_id}
                  className="grid items-stretch gap-2"
                  style={{ gridTemplateColumns }}
                >
                  <div className="flex min-w-0 items-center rounded-md px-2 text-sm font-medium">
                    <span className="truncate">{team.full_name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{team.short_name}</span>
                  </div>
                  {gameweeks.map((fixtureGameweek) => (
                    <FixtureCell
                      key={fixtureGameweek}
                      fixtures={team.fixtures.filter(
                        (fixture) => fixture.event === fixtureGameweek
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
