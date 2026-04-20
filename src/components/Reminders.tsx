import { Bell, Clock, MapPin, Coffee } from "lucide-react";

const reminders = [
  {
    icon: Clock,
    title: "Meeting with Alex",
    message: "in 45 minutes",
    hint: "Prep notes ready in Notion",
    color: "primary",
  },
  {
    icon: MapPin,
    title: "Leave for design studio",
    message: "in 10 minutes",
    hint: "15 min drive · light traffic",
    color: "warning",
  },
  {
    icon: Coffee,
    title: "Coffee with Maya",
    message: "tomorrow · 4:00 PM",
    hint: "Blue Bottle, downtown",
    color: "accent",
  },
];

const colorMap: Record<string, string> = {
  primary: "bg-primary-soft text-primary",
  warning: "bg-focus-mid-soft text-focus-mid",
  accent: "bg-accent-soft text-accent",
};

export const Reminders = () => {
  return (
    <div className="rounded-3xl bg-card border border-border shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Smart Reminders</p>
          <h3 className="font-bold text-lg">Coming up</h3>
        </div>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        {reminders.map((r, i) => {
          const Icon = r.icon;
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-2xl hover:bg-secondary/50 transition-smooth cursor-pointer"
            >
              <div className={`h-10 w-10 rounded-xl ${colorMap[r.color]} flex items-center justify-center flex-shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{r.title}</p>
                <p className="text-xs text-foreground/70">{r.message}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">⚡ {r.hint}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
