"use client";

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { useEffect, useRef } from "react";

import type { StravaActivity } from "@/types/strava";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const chartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#333",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "#555",
      borderWidth: 1,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: "#333" },
      ticks: { color: "#888" },
    },
    x: {
      grid: { display: false },
      ticks: { color: "#888" },
    },
  },
};

export function WeeklyChart({ activities }: { activities: StravaActivity[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"bar"> | null>(null);

  useEffect(() => {
    const last7 = activities.slice(0, 7).reverse();
    const canvas = canvasRef.current;
    if (!canvas) return;

    chartRef.current?.destroy();
    chartRef.current = null;

    if (last7.length === 0) {
      return;
    }

    chartRef.current = new Chart(canvas, {
      type: "bar",
      data: {
        labels: last7.map((a) =>
          new Date(a.start_date).toLocaleDateString("en-US", { weekday: "short" }),
        ),
        datasets: [
          {
            label: "Distance (km)",
            data: last7.map((a) => Number((a.distance / 1000).toFixed(1))),
            backgroundColor: "#e94560",
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: chartOptions,
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [activities]);

  return (
    <div className="relative h-[220px] w-full text-[#333]">
      {/* Fixed height: maintainAspectRatio:false fills the box; flex-1/h-full caused unbounded growth in the dashboard column */}
      <canvas ref={canvasRef} className="block max-h-full" />
    </div>
  );
}
