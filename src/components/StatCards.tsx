import { Calendar, Clock, Target, Zap } from "lucide-react";

const stats = [
  { label: "Meetings today", value: "4", icon: Calendar, accent: "primary" },
  { label: "Focus hours", value: "5.2", icon: Zap, accent: "high" },
  { label: "Free time", value: "2h 15m", icon: Clock, accent: "accent" },
  { label: "Goals on track", value: "87%", icon: Target, accent: "mid" },
];

const accentMap: Record<string, string> = {
  primary: "bg-primary-soft text-primary",
  high: "bg-focus-high-soft text-focus-high",
  mid: "bg-focus-mid-soft text-focus-mid",
  accent: "bg-accent-soft text-accent",
};

export const StatCards = () => {
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
