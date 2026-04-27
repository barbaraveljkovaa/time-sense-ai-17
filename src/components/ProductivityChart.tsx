import { useMemo } from "react";
import { TrendingUp, Sparkles } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";

/**
 * Default circadian-style productivity curve (24 hourly values 0-100).
 * Used as a baseline and as a fallback when there's no real event history.
 */
const baselineCurve: number[] = [
  5, 5, 5, 5, 10, 20, 35, 55, 75, 90, 95, 85, // 0..11
  70, 60, 65, 75, 80, 70, 55, 40, 30, 20, 12, 8, // 12..23
];

const visibleHours = [6, 8, 10, 12, 14, 16, 18, 20];

const fmtHour = (h: number) => {
  const mod = ((h % 12) + 12) % 12 || 12;
  const ampm = h < 12 || h === 24 ? "AM" : "PM";
  return `${mod} ${ampm}`;
};

const bandFor = (level: number): "high" | "mid" | "low" =>
  level >= 70 ? "high" : level >= 40 ? "mid" : "low";

const colorMap: Record<string, string> = {
  high: "bg-focus-high",
  mid: "bg-focus-mid",
  low: "bg-focus-low",
};

export const ProductivityChart = () => {
  const { events } = useEvents();

  /**
   * Build a 24-hour productivity score by mixing the baseline curve with the
   * user's actual event history. Focus blocks add a strong boost, meetings a
   * mild one, breaks reduce. We average across the past 14 days for stability.
   */
  const { hourly, best, hasUserData } = useMemo(() => {
    const now = new Date();
    const horizonMs = 14 * 24 * 60 * 60 * 1000;
    const cutoff = now.getTime() - horizonMs;

    const buckets = Array.from({ length: 24 }, () => ({ score: 0, count: 0 }));
    let usedAny = false;

    for (const ev of events) {
      const s = new Date(ev.starts_at);
      if (s.getTime() < cutoff) continue;
      const hour = s.getHours();
      const weight =
        ev.event_type === "focus" ? 25 :
        ev.event_type === "meeting" ? 10 :
        ev.event_type === "personal" ? 5 :
        -10; // break
      buckets[hour].score += weight;
      buckets[hour].count += 1;
      usedAny = true;
    }

    const hourly = baselineCurve.map((base, h) => {
      const b = buckets[h];
      const adjusted = b.count > 0 ? base + b.score / b.count : base;
      const level = Math.max(5, Math.min(100, Math.round(adjusted)));
      return { h, level, focus: bandFor(level) };
    });

    // Find the best contiguous 90-minute window during waking hours (6 AM – 9 PM)
    let best = { startHour: 9, endHour: 11, avg: 0 };
    for (let h = 6; h <= 19; h++) {
      const avg = (hourly[h].level + hourly[h + 1].level) / 2;
      if (avg > best.avg) best = { startHour: h, endHour: h + 2, avg };
    }

    return { hourly, best, hasUserData: usedAny };
  }, [events]);

  const displayed = visibleHours.map((h) => hourly[h]);

  // Compute a friendly best-time string with a 30-min offset for nicer ranges
  const bestLabel = (() => {
    const startH = best.startHour;
    const endH = best.endHour;
    const startMin = startH < 10 ? 30 : 0; // start a bit after the hour
    const startStr = `${((startH + (startMin === 30 ? 0 : 0)) % 12 || 12)}:${startMin === 30 ? "30" : "00"} ${startH < 12 ? "AM" : "PM"}`;
    const endStr = `${(endH % 12 || 12)}:00 ${endH < 12 || endH === 24 ? "AM" : "PM"}`;
    return `${startStr} – ${endStr}`;
  })();

  const todayPeak = Math.max(...hourly.map((p) => p.level));
  const todayAvg = Math.round(hourly.reduce((s, p) => s + p.level, 0) / 24);
  const trendPct = Math.max(-25, Math.min(40, todayPeak - todayAvg - 30));

  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Productivity
          </p>
          <h3 className="font-bold text-lg">Your focus pattern</h3>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-focus-high-soft text-focus-high text-xs font-semibold">
          <TrendingUp className="h-3 w-3" />
          {trendPct >= 0 ? "+" : ""}
          {trendPct}%
        </div>
      </div>

      <div className="flex items-end gap-2 h-36 mb-3">
        {displayed.map((h) => (
          <div key={h.h} className="flex-1 flex flex-col items-center gap-2 group">
            <div
              className={`w-full ${colorMap[h.focus]} rounded-t-lg transition-spring group-hover:opacity-100 opacity-80`}
              style={{ height: `${h.level}%` }}
              title={`${fmtHour(h.h)} • ${h.level}% • ${h.focus}`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-end gap-2">
        {displayed.map((h) => (
          <p key={h.h} className="flex-1 text-[10px] text-muted-foreground text-center">
            {fmtHour(h.h)}
          </p>
        ))}
      </div>

      <div className="mt-5 p-3 rounded-2xl bg-gradient-soft border border-border/50">
        <p className="text-xs font-medium flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          🎯 Best time to work today:{" "}
          <span className="text-primary font-bold">{bestLabel}</span>
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {hasUserData
            ? "Based on your event history over the last 14 days."
            : "Based on a typical productivity model — schedule events to personalize."}
        </p>
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-focus-high" />
          <span className="text-muted-foreground">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-focus-mid" />
          <span className="text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-focus-low" />
          <span className="text-muted-foreground">Low</span>
        </div>
        <span className="ml-auto text-muted-foreground">
          Daily avg <span className="font-semibold text-foreground">{todayAvg}%</span>
        </span>
      </div>
    </div>
  );
};
