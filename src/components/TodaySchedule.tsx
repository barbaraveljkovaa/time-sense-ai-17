import { useMemo } from "react";
import { useEvents, AppEvent } from "@/hooks/useEvents";
import { Calendar as CalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const typeStyles: Record<AppEvent["event_type"], string> = {
  meeting: "bg-primary-soft text-primary border-primary/20",
  focus: "bg-focus-high-soft text-focus-high border-focus-high/20",
  break: "bg-focus-mid-soft text-focus-mid border-focus-mid/20",
  personal: "bg-accent-soft text-accent border-accent/20",
};

export const TodaySchedule = () => {
  const { events } = useEvents();

  const today = useMemo(() => {
    const t = new Date();
    return events
      .filter((e) => {
        const s = new Date(e.starts_at);
        return (
          s.getFullYear() === t.getFullYear() &&
          s.getMonth() === t.getMonth() &&
          s.getDate() === t.getDate()
        );
      })
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  }, [events]);

  return (
    <div className="rounded-3xl bg-card border border-border shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Today's plan</p>
          <h3 className="font-bold text-lg">
            {today.length} event{today.length === 1 ? "" : "s"} scheduled
          </h3>
        </div>
      </div>

      {today.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">
          <CalIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
          Nothing scheduled today. Ask the assistant to plan something.
        </div>
      ) : (
        <div className="space-y-3">
          {today.map((e) => {
            const s = new Date(e.starts_at);
            const end = new Date(e.ends_at);
            const mins = Math.round((end.getTime() - s.getTime()) / 60000);
            return (
              <div
                key={e.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border bg-card hover:shadow-soft transition-smooth",
                  typeStyles[e.event_type],
                )}
              >
                <div className="text-right min-w-[60px]">
                  <p className="font-bold text-sm text-foreground">
                    {s.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {mins < 60 ? `${mins}m` : `${Math.round(mins / 60)}h`}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{e.event_type}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
