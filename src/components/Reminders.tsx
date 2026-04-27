import { useMemo } from "react";
import { Bell, Clock } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";

const fmtRelative = (date: Date, now: Date) => {
  const diffMin = Math.round((date.getTime() - now.getTime()) / 60000);
  if (diffMin < 60) return `in ${diffMin} min`;
  const hrs = Math.round(diffMin / 60);
  if (hrs < 24) return `in ${hrs}h`;
  const days = Math.round(hrs / 24);
  return `in ${days}d`;
};

export const Reminders = () => {
  const { events } = useEvents();

  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.starts_at) > now)
      .slice(0, 4);
  }, [events]);

  const now = new Date();

  return (
    <div className="rounded-3xl bg-card border border-border shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Smart Reminders</p>
          <h3 className="font-bold text-lg">Coming up</h3>
        </div>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </div>

      {upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Nothing on the horizon. Ask the assistant to schedule something.
        </p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((e) => {
            const s = new Date(e.starts_at);
            const diffMin = (s.getTime() - now.getTime()) / 60000;
            const urgent = diffMin < 60;
            return (
              <div
                key={e.id}
                className="flex items-start gap-3 p-3 rounded-2xl hover:bg-secondary/50 transition-smooth"
              >
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    urgent ? "bg-focus-mid-soft text-focus-mid" : "bg-primary-soft text-primary"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{e.title}</p>
                  <p className="text-xs text-foreground/70">{fmtRelative(s, now)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {s.toLocaleString("en-US", {
                      weekday: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
