import { useMemo } from "react";
import { Calendar, Clock, Target, Zap } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";

export const StatCards = () => {
  const { events } = useEvents();

  const stats = useMemo(() => {
    const t = new Date();
    const startToday = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const endToday = new Date(startToday);
    endToday.setDate(endToday.getDate() + 1);

    const todays = events.filter((e) => {
      const s = new Date(e.starts_at);
      return s >= startToday && s < endToday;
    });

    const meetings = todays.filter((e) => e.event_type === "meeting").length;

    const focusMs = todays
      .filter((e) => e.event_type === "focus")
      .reduce((sum, e) => sum + (new Date(e.ends_at).getTime() - new Date(e.starts_at).getTime()), 0);
    const focusHours = (focusMs / 3_600_000).toFixed(1);

    const bookedMs = todays.reduce(
      (sum, e) => sum + (new Date(e.ends_at).getTime() - new Date(e.starts_at).getTime()),
      0,
    );
    // workday 9 hours
    const freeMs = Math.max(0, 9 * 3_600_000 - bookedMs);
    const freeH = Math.floor(freeMs / 3_600_000);
    const freeM = Math.floor((freeMs % 3_600_000) / 60_000);

    const upcomingWeek = events.filter((e) => {
      const s = new Date(e.starts_at);
      return s >= t && s.getTime() < t.getTime() + 7 * 24 * 3_600_000;
    }).length;

    return [
      { label: "Meetings today", value: meetings.toString(), icon: Calendar, accent: "primary" },
      { label: "Focus hours today", value: focusHours, icon: Zap, accent: "high" },
      { label: "Free time today", value: `${freeH}h ${freeM}m`, icon: Clock, accent: "accent" },
      { label: "Events this week", value: upcomingWeek.toString(), icon: Target, accent: "mid" },
    ];
  }, [events]);

  const accentMap: Record<string, string> = {
    primary: "bg-primary-soft text-primary",
    high: "bg-focus-high-soft text-focus-high",
    mid: "bg-focus-mid-soft text-focus-mid",
    accent: "bg-accent-soft text-accent",
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="rounded-2xl bg-card border border-border p-4 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-spring"
          >
            <div className={`h-9 w-9 rounded-xl ${accentMap[s.accent]} flex items-center justify-center mb-3`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        );
      })}
    </div>
  );
};
