"use client";

import Image from "next/image";

import { useActivities } from "@/contexts/activities-context";
import { workoutToHighlight } from "@/lib/workoutHighlight";

export default function BodyModelPanel() {
  const { activities } = useActivities();
  const lastType = activities[0]?.type;
  const zone = workoutToHighlight(lastType);

  const label =
    zone === "upper"
      ? "Upper body focus"
      : zone === "lower"
        ? "Legs & hips focus"
        : zone === "full"
          ? "Full body day"
          : "Standby";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      role="img"
      aria-label={`Muscle visual. Latest workout: ${lastType ?? "none yet"}.`}
    >
      <Image
        src="/dashboard-anatomy.png"
        alt=""
        fill
        sizes="350px"
        priority
        className="object-cover object-[50%_10%]"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f8f9fc] via-[#f8f9fc]/80 to-transparent dark:from-slate-900 dark:via-slate-900/80" />
      <p className="pointer-events-none absolute left-1/2 top-3 w-[88%] -translate-x-1/2 text-center text-[10px] font-medium uppercase tracking-wider text-[#9ca3af]/90 dark:text-slate-500">
        Muscle map · {label}
        {activities[0]?.type ? ` · ${activities[0].type}` : ""}
      </p>
    </div>
  );
}
