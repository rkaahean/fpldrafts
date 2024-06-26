"use client";

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

export const data = {
  labels: ["Thing 1", "Thing 2", "Thing 3", "Thing 4", "Thing 5", "Thing 6"],
  datasets: [
    {
      label: "# of Votes",
      data: [2, 9, 3, 5, 2, 3],
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 1,
    },
    {
      label: "# of Votes",
      data: [9, 1, 9, 5, 2, 3],
      backgroundColor: "rgba(10, 99, 132, 0.2)",
      borderColor: "rgba(10, 99, 132, 1)",
      borderWidth: 1,
    },
  ],
};

export default function PlayerComparison() {
  const options = {
    scales: {
      r: {
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
  return (
    <div>
      <div className="flex gap-3 justify-center">
        <div className="font-black text-blue-500">Watkins</div>
        <span className="font-thin">vs.</span>
        <div className="font-black text-red-500">Haaland</div>
      </div>

      <Radar data={data} options={options} />
    </div>
  );
}
