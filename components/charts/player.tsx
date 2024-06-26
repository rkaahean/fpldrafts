"use client";

import { getPlayerData } from "@/app/api";
import { chartsStore } from "@/app/store/charts";
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function PlayerComparison() {
  const player1 = chartsStore((store) => store.player1);
  const player2 = chartsStore((store) => store.player2);

  const { data, isLoading } = useQuery({
    queryKey: [player1, player2],
    queryFn: async () => {
      const response1: {
        data: NonNullable<Awaited<ReturnType<typeof getPlayerData>>>;
      } = await fetch("/api/player", {
        method: "POST",
        body: JSON.stringify({
          id: player1,
        }),
      }).then((res) => res.json());

      const response2: {
        data: NonNullable<Awaited<ReturnType<typeof getPlayerData>>>;
      } = await fetch("/api/player", {
        method: "POST",
        body: JSON.stringify({
          id: player2,
        }),
      }).then((res) => res.json());
      return [response1.data, response2.data];
    },
  });

  const options = {
    scales: {
      r: {
        min: 0,
        max: 1,
        pointLabels: {
          display: true, // Show point labels
        },
        grid: {
          display: true, // Show grid lines
        },
        angleLines: {
          display: true, // Hide the lines connecting points
        },
      },
    },
    elements: {
      line: {
        borderWidth: 1, // Hide the border lines of the radar chart
      },
    },
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log(data);

  function formatData(
    data: NonNullable<Awaited<ReturnType<typeof getPlayerData>>>[]
  ) {
    return {
      // labels: ["xA", "xA / 90", "xG", "xG / 90", "xGI", "xGI / 90"],
      labels: ["xA / 90", "xG / 90", "xGI / 90"],

      datasets: [
        {
          label: data[0].web_name,
          data: [
            data[0].expected_assists_per_90,
            data[0].expected_goals_per_90,
            data[0].expected_goal_involvements_per_90,
          ],
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
        {
          label: data[1].web_name,
          data: [
            data[1].expected_assists_per_90,
            data[1].expected_goals_per_90,
            data[1].expected_goal_involvements_per_90,
          ],
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 1,
        },
      ],
    };
  }
  return (
    <div>
      <div className="flex gap-3 justify-center">
        <div className="font-black text-blue-500">{data![0].web_name}</div>
        <span className="font-thin">vs.</span>
        <div className="font-black text-red-500">{data![1].web_name}</div>
      </div>

      <Radar data={formatData(data!)} options={options} />
    </div>
  );
}
