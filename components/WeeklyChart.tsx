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
import { useEffect, useMemo, useRef } from "react";

import { usePreferences } from "@/contexts/preferences-context";
import { buildLastSevenDaysVolume } from "@/lib/chartVolume";
import { metersToDisplay } from "@/lib/units";
import type { StravaActivity } from "@/types/strava";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function WeeklyChart({ activities }: { activities: StravaActivity[] }) {
  const { unit, theme } = usePreferences();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"bar"> | null>(null);

  const { labels, values, unitLabel } = useMemo(() => {
    const { labels: lbs, distancesMeters } = buildLastSevenDaysVolume(activities);
    const values = distancesMeters.map((m) =>
      Number(metersToDisplay(m, unit).toFixed(2)),
    );
    return {
      labels: lbs,
      values,
      unitLabel: unit === "mi" ? "mi" : "km",
    };
  }, [activities, unit]);

  const isDark = theme === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    chartRef.current?.destroy();
    chartRef.current = null;

    const gridColor = isDark ? "#334155" : "#333";
    const tickColor = isDark ? "#94a3b8" : "#888";

    const chartOptions: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? "#1e293b" : "#333",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: isDark ? "#475569" : "#555",
          borderWidth: 1,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: tickColor },
        },
        x: {
          grid: { display: false },
          ticks: { color: tickColor },
        },
      },
    };

    chartRef.current = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: `Distance (${unitLabel})`,
            data: values,
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
  }, [activities, labels, values, unitLabel, isDark]);

  return (
    <div className="relative h-[220px] w-full text-[#333] dark:text-slate-200">
      <canvas ref={canvasRef} className="block max-h-full" />
    </div>
  );
}
