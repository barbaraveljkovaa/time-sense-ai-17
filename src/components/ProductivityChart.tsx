import { TrendingUp } from "lucide-react";

const hours = [
  { h: "6 AM", level: 20, focus: "low" },
  { h: "8 AM", level: 55, focus: "mid" },
  { h: "10 AM", level: 95, focus: "high" },
  { h: "12 PM", level: 70, focus: "mid" },
  { h: "2 PM", level: 40, focus: "low" },
  { h: "4 PM", level: 80, focus: "high" },
  { h: "6 PM", level: 50, focus: "mid" },
  { h: "8 PM", level: 25, focus: "low" },
];

const colorMap: Record<string, string> = {
  high: "bg-focus-high",
  mid: "bg-focus-mid",
  low: "bg-focus-low",
};

export const ProductivityChart = () => {
  return (
    <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Productivity</p>
          <h3 className="font-bold text-lg">Your focus pattern</h3>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-focus-high-soft text-focus-high text-xs font-semibold">
          <TrendingUp className="h-3 w-3" />
          +12%
        </div>
      </div>

      <div className="flex items-end gap-2 h-36 mb-3">
        {hours.map((h) => (
          <div key={h.h} className="flex-1 flex flex-col items-center gap-2 group">
            <div
              className={`w-full ${colorMap[h.focus]} rounded-t-lg transition-spring group-hover:opacity-100 opacity-80`}
              style={{ height: `${h.level}%` }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-end gap-2">
        {hours.map((h) => (
          <p key={h.h} className="flex-1 text-[10px] text-muted-foreground text-center">
            {h.h}
          </p>
        ))}
      </div>

      <div className="mt-5 p-3 rounded-2xl bg-gradient-soft border border-border/50">
        <p className="text-xs font-medium">
          🎯 Best time to work today: <span className="text-primary font-bold">9:30 AM – 11:00 AM</span>
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
      </div>
    </div>
  );
};
