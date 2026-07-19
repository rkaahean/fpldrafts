"use client";

import type { PlayerData } from "@/app/store/utils";
import { computeRollingXgTrend, type PlayerHistoryPoint } from "@/lib/fpl/player-history";
import { getFixtureIntensityClass } from "@/scripts/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import { isMobile } from "react-device-detect";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

type DetailTab = "stats" | "trend";
type RollingWindow = 3 | 5 | "season";

export default function PlayerDetailSheet({
  data,
  gameweek,
  open,
  onOpenChange,
}: {
  data: PlayerData;
  gameweek: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("stats");
  const isAvailabilityConcern = !!data.status && data.status !== "a";

  const { data: history, isLoading } = useQuery({
    queryKey: ["playerHistory", data.player_id],
    queryFn: () =>
      fetch(`/api/player?id=${data.player_id}`)
        .then((res) => res.json())
        .then(
          (body) => body.data.history as PlayerHistoryPoint[]
        ),
    enabled: open,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "flex h-[85vh] flex-col overflow-hidden rounded-t-xl"
            : "flex !w-full flex-col overflow-hidden sm:!max-w-md"
        }
      >
        <SheetHeader className="flex flex-shrink-0 flex-row items-center gap-3 space-y-0 text-left">
          <div className="h-14 w-14 flex-shrink-0">
            <Image
              src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${data.team_code}-110.webp`}
              alt="Player"
              width={56}
              height={56}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <SheetTitle>{data.web_name}</SheetTitle>
            <SheetDescription>{data.team_name}</SheetDescription>
          </div>
        </SheetHeader>

        {isAvailabilityConcern && data.news && (
          <div className="flex-shrink-0 rounded-md border bg-muted/30 px-3 py-2 text-sm">
            {data.news}
          </div>
        )}

        <div
          className="flex flex-shrink-0 rounded-md border p-0.5"
          aria-label="Player detail tabs"
        >
          {(
            [
              ["stats", "Stats"],
              ["trend", "Trend"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              size="xs"
              variant={tab === value ? "secondary" : "ghost"}
              aria-pressed={tab === value}
              className="flex-1"
              onClick={() => setTab(value)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {tab === "stats" ? (
            <PlayerStatsGrid data={data} />
          ) : (
            <div className="flex h-full flex-col gap-3">
              <PlayerRollingXgChart history={history} isLoading={isLoading} />
              <PlayerFixtureTicker
                fixtures={data.fixtures}
                gameweek={gameweek}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PlayerStatsGrid({ data }: { data: PlayerData }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm sm:grid-cols-4">
      <StatCell label="Price" value={`£${data.selling_price / 10}`} />
      <StatCell label="Total points" value={data.total_points} />
      <StatCell label="Points/game" value={data.points_per_game ?? "-"} />
      <StatCell label="Bonus" value={data.bonus ?? "-"} />
      <StatCell label="BPS" value={data.bps ?? "-"} />
      <StatCell
        label="Selected by"
        value={`${data.selected_by_percent ?? "-"}%`}
      />
      {data.element_type === 1 && <GoalkeeperCells data={data} />}
      {data.element_type === 2 && <DefenderCells data={data} />}
      {data.element_type === 3 && <MidfielderCells data={data} />}
      {data.element_type === 4 && <ForwardCells data={data} />}
    </div>
  );
}

function GoalkeeperCells({ data }: { data: PlayerData }) {
  return (
    <>
      <StatCell label="Saves" value={data.saves ?? "-"} />
      <StatCell
        label="Saves / 90"
        value={data.saves_per_90 ?? "-"}
      />
      <StatCell label="Clean sheets" value={data.clean_sheets ?? "-"} />
      <StatCell label="Goals conceded" value={data.goals_conceded ?? "-"} />
    </>
  );
}

function DefenderCells({ data }: { data: PlayerData }) {
  return (
    <>
      <StatCell
        label="xG conceded"
        value={data.expected_goals_conceded ?? "-"}
      />
      <StatCell
        label="xGI"
        value={data.expected_goal_involvements_per_90 ?? "-"}
      />
      <StatCell label="xA" value={data.expected_assists ?? "-"} />
      <StatCell label="xA / 90" value={data.expected_assists_per_90 ?? "-"} />
      <StatCell
        label="Defensive contribution"
        value={data.defensive_contribution ?? "-"}
      />
      <StatCell label="Clean sheets" value={data.clean_sheets ?? "-"} />
    </>
  );
}

function MidfielderCells({ data }: { data: PlayerData }) {
  return (
    <>
      <StatCell
        label="Defensive contribution"
        value={data.defensive_contribution ?? "-"}
      />
      <StatCell label="Clean sheets" value={data.clean_sheets ?? "-"} />
      <StatCell label="xG" value={data.expected_goals ?? "-"} />
      <StatCell label="xA" value={data.expected_assists ?? "-"} />
      <StatCell
        label="xGI"
        value={data.expected_goal_involvements_per_90 ?? "-"}
      />
      <StatCell label="xG / 90" value={data.expected_goals_per_90 ?? "-"} />
      <StatCell label="xA / 90" value={data.expected_assists_per_90 ?? "-"} />
    </>
  );
}

function ForwardCells({ data }: { data: PlayerData }) {
  return (
    <>
      <StatCell label="xG" value={data.expected_goals ?? "-"} />
      <StatCell label="xA" value={data.expected_assists ?? "-"} />
      <StatCell
        label="xGI"
        value={data.expected_goal_involvements_per_90 ?? "-"}
      />
      <StatCell label="xG / 90" value={data.expected_goals_per_90 ?? "-"} />
      <StatCell label="xA / 90" value={data.expected_assists_per_90 ?? "-"} />
    </>
  );
}

function StatCell({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 rounded-md border bg-muted/30 px-2 py-1.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function PlayerRollingXgChart({
  history,
  isLoading,
}: {
  history: PlayerHistoryPoint[] | undefined;
  isLoading: boolean;
}) {
  const [windowOption, setWindowOption] = useState<RollingWindow>(5);

  if (isLoading) {
    return (
      <section className="flex h-56 flex-shrink-0 items-center justify-center rounded-md border bg-background/40 p-3 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </section>
    );
  }

  if (!history || history.length === 0) {
    return (
      <section className="flex h-56 flex-shrink-0 flex-col rounded-md border bg-background/40 p-3 shadow-sm">
        <h2 className="text-sm font-medium">Rolling xG / xA / xGI</h2>
        <p className="m-auto text-center text-xs text-muted-foreground">
          No gameweek history yet.
        </p>
      </section>
    );
  }

  const windowSize =
    windowOption === "season" ? history.length : windowOption;
  const fullTrend = computeRollingXgTrend(history, windowSize);
  const trend =
    windowOption === "season"
      ? fullTrend
      : fullTrend.slice(-windowOption);
  const labels = trend.map((point) => `GW ${point.gameweek}`);
  const chartData = {
    labels,
    datasets: [
      {
        label: "xG (rolling)",
        data: trend.map((point) => point.xg),
        borderColor: "rgb(161 161 170)",
        backgroundColor: "rgb(161 161 170 / 0.14)",
        tension: 0.32,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
      {
        label: "xA (rolling)",
        data: trend.map((point) => point.xa),
        borderColor: "rgb(212 212 216)",
        backgroundColor: "rgb(212 212 216 / 0.14)",
        tension: 0.32,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
      {
        label: "xGI (rolling)",
        data: trend.map((point) => point.xgi),
        borderColor: "rgb(113 113 122)",
        backgroundColor: "rgb(113 113 122 / 0.14)",
        borderDash: [4, 3],
        tension: 0.32,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
    ],
  };
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { boxHeight: 6, boxWidth: 6, font: { size: 9 }, color: "rgb(161 161 170)" },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value === null ? "-" : value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "rgb(161 161 170)", maxRotation: 0, autoSkip: true, font: { size: 10 } },
      },
      y: {
        grid: { color: "rgb(63 63 70 / 0.55)" },
        ticks: { color: "rgb(161 161 170)", font: { size: 10 } },
      },
    },
  };

  return (
    <section className="flex h-56 flex-shrink-0 flex-col rounded-md border bg-background/40 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Rolling xG / xA / xGI</h2>
        <div
          className="flex rounded-md border p-0.5"
          aria-label="Rolling window"
        >
          {(
            [
              [3, "Last 3"],
              [5, "Last 5"],
              ["season", "Season"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={label}
              size="xs"
              variant={windowOption === value ? "secondary" : "ghost"}
              aria-pressed={windowOption === value}
              onClick={() => setWindowOption(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-2 min-h-0 flex-1">
        <Line data={chartData} options={options} />
      </div>
    </section>
  );
}

function PlayerFixtureTicker({
  fixtures,
  gameweek,
}: {
  fixtures: PlayerData["fixtures"];
  gameweek: number;
}) {
  const formattedFixtures = [];
  for (let idx = gameweek; idx < gameweek + 5; idx++) {
    const fixture = fixtures.filter((fixture) => fixture.event == idx);
    if (fixture.length === 0) {
      formattedFixtures.push({
        id: idx,
        event: idx,
        name: "-",
        strength: 0,
      });
    } else if (fixture.length == 1) {
      formattedFixtures.push(fixture[0]);
    } else {
      formattedFixtures.push(fixture);
    }
  }

  return (
    <div className="grid flex-shrink-0 grid-cols-5 gap-1 text-xs tracking-tighter">
      {formattedFixtures.map((fixture, idx) => {
        if (Array.isArray(fixture)) {
          return (
            <div
              className="grid grid-rows-2 rounded-md border bg-muted/30 py-1 text-center"
              key={idx}
            >
              {fixture.map((double_fixture) => (
                <div key={double_fixture.id} className="row-span-1">
                  {double_fixture.name}
                </div>
              ))}
            </div>
          );
        }
        return (
          <div
            key={fixture.id}
            className={clsx(
              "flex flex-col items-center justify-center rounded-md py-2",
              getFixtureIntensityClass(fixture.strength!)
            )}
          >
            {fixture.name}
          </div>
        );
      })}
    </div>
  );
}
