"use client";

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
import { Line } from "react-chartjs-2";
import { useState } from "react";
import {
  selectTrendHistory,
  type GameweekTrendPoint,
  type TrendRange,
} from "@/lib/fpl/gameweek-trends";
import { Button } from "../ui/button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

type TrendChartProps = {
  kind: "value" | "rank";
  history: GameweekTrendPoint[];
};

export default function TrendChart({ kind, history }: TrendChartProps) {
  const [range, setRange] = useState<TrendRange>("recent");
  const selectedHistory = selectTrendHistory(history, range);
  const title = kind === "value" ? "Team value" : "Rank trend";

  if (!selectedHistory.length) {
    return (
      <section
        aria-label={title}
        className="flex min-h-44 flex-col rounded-md border bg-background/40 p-3 shadow-sm"
      >
        <TrendHeader title={title} range={range} onRangeChange={setRange} />
        <p className="m-auto text-center text-xs text-muted-foreground">
          Trend data will appear after your first completed gameweek.
        </p>
      </section>
    );
  }

  const labels = selectedHistory.map((point) => `GW ${point.gameweek}`);
  const valueTrend = kind === "value";
  const values = valueTrend
    ? selectedHistory.map((point) => point.value / 10)
    : selectedHistory.map((point) => point.overall_rank);
  const data = {
    labels,
    datasets: [
      {
        label: valueTrend ? "Squad value" : "Overall rank",
        data: values,
        borderColor: valueTrend ? "rgb(16 185 129)" : "rgb(96 165 250)",
        backgroundColor: valueTrend ? "rgb(16 185 129 / 0.14)" : "rgb(96 165 250 / 0.14)",
        fill: true,
        tension: 0.32,
        pointRadius: 2.5,
        pointHoverRadius: 4,
        spanGaps: true,
      },
    ],
  };
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (value === null) return "Rank unavailable";
            return valueTrend
              ? `Squad value: £${value.toFixed(1)}`
              : `Overall rank: ${value.toLocaleString()}`;
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
        reverse: !valueTrend,
        grid: { color: "rgb(63 63 70 / 0.55)" },
        ticks: {
          color: "rgb(161 161 170)",
          font: { size: 10 },
          callback: (value) =>
            valueTrend
              ? `£${Number(value).toFixed(1)}`
              : Number(value).toLocaleString(undefined, { notation: "compact" }),
        },
      },
    },
  };

  return (
    <section
      aria-label={title}
      className="flex min-h-44 flex-col rounded-md border bg-background/40 p-3 shadow-sm"
    >
      <TrendHeader title={title} range={range} onRangeChange={setRange} />
      <div className="mt-2 min-h-0 flex-1" aria-label={`${title} chart`}>
        <Line data={data} options={options} />
      </div>
    </section>
  );
}

function TrendHeader({
  title,
  range,
  onRangeChange,
}: {
  title: string;
  range: TrendRange;
  onRangeChange: (range: TrendRange) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-sm font-medium">{title}</h2>
      <div className="flex rounded-md border p-0.5" aria-label={`${title} range`}>
        {([
          ["recent", "Last 8"],
          ["season", "Season"],
        ] as const).map(([value, label]) => (
          <Button
            key={value}
            size="xs"
            variant={range === value ? "secondary" : "ghost"}
            aria-pressed={range === value}
            onClick={() => onRangeChange(value)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
