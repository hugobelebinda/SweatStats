import type { StravaActivity } from "@/types/strava";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

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

export function ActivityCard({ activity }: { activity: StravaActivity }) {
  return (
    <div className="mb-3 flex items-center rounded-[18px] border border-[#f0f0f0] bg-white p-[15px] text-[#1a1a2e] transition-transform hover:-translate-y-0.5 hover:border-pink">
      <div className="mr-[15px] rounded-[14px] bg-[#fff0f3] p-3 text-xl text-pink">
        {typeEmoji(activity.type)}
      </div>
      <div>
        <h3 className="mb-1 text-[15px] font-bold text-[#1a1a2e]">{activity.name}</h3>
        <p className="m-0 text-[13px] font-medium text-[#533483]">
          <span>{(activity.distance / 1000).toFixed(2)} km</span>
          <span className="mx-1">•</span>
          <span>{formatTime(activity.moving_time)}</span>
        </p>
        <small className="mt-1 block text-[11px] text-[#9ca3af]">
          {formatDate(activity.start_date)}
        </small>
      </div>
    </div>
  );
}
