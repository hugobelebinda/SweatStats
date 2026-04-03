import type { StravaActivity } from "@/types/strava";
import type { UnitSystem } from "@/lib/units";
import { formatDistance, formatMovingClock } from "@/lib/units";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function typeEmoji(type: string) {
  if (type === "Run") return "🏃";
  if (type === "Ride") return "🚴";
  return "🏋️";
}

export function ActivityCard({
  activity,
  unit,
  onSelect,
}: {
  activity: StravaActivity;
  unit: UnitSystem;
  onSelect?: () => void;
}) {
  const content = (
    <>
      <div className="mr-[15px] rounded-[14px] bg-[#fff0f3] p-3 text-xl text-pink dark:bg-pink/20">
        {typeEmoji(activity.type)}
      </div>
      <div>
        <h3 className="mb-1 text-[15px] font-bold text-[#1a1a2e] dark:text-slate-100">
          {activity.name}
        </h3>
        <p className="m-0 text-[13px] font-medium text-[#533483] dark:text-slate-300">
          <span>{formatDistance(activity.distance, unit, 2)}</span>
          <span className="mx-1">•</span>
          <span>{formatMovingClock(activity.moving_time)}</span>
        </p>
        <small className="mt-1 block text-[11px] text-[#9ca3af]">
          {formatDate(activity.start_date)}
        </small>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="mb-3 flex w-full cursor-pointer items-center rounded-[18px] border border-[#f0f0f0] bg-white p-[15px] text-left text-[#1a1a2e] transition-transform hover:-translate-y-0.5 hover:border-pink dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="mb-3 flex items-center rounded-[18px] border border-[#f0f0f0] bg-white p-[15px] text-[#1a1a2e] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
      {content}
    </div>
  );
}
