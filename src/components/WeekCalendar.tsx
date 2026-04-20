import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = [15, 16, 17, 18, 19, 20, 21];
const hours = ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM"];

interface Event {
  day: number;
  hour: number;
  duration: number;
  title: string;
  type: "meeting" | "focus" | "suggested";
}

const events: Event[] = [
  { day: 0, hour: 1, duration: 1, title: "Standup", type: "meeting" },
  { day: 0, hour: 2, duration: 2, title: "Deep Work", type: "focus" },
  { day: 1, hour: 0, duration: 1, title: "1:1 Alex", type: "meeting" },
  { day: 1, hour: 3, duration: 1, title: "Design review", type: "meeting" },
  { day: 2, hour: 1, duration: 2, title: "Suggested: Study", type: "suggested" },
  { day: 3, hour: 0, duration: 1, title: "Coffee chat", type: "meeting" },
  { day: 3, hour: 2, duration: 2, title: "Focus block", type: "focus" },
  { day: 4, hour: 1, duration: 1, title: "Sprint demo", type: "meeting" },
  { day: 4, hour: 4, duration: 1, title: "Suggested: Workout", type: "suggested" },
];

const typeStyles = {
  meeting: "bg-primary text-primary-foreground",
  focus: "bg-focus-high-soft text-focus-high border border-focus-high/30",
  suggested: "bg-accent-soft text-accent border-2 border-dashed border-accent",
};

export const WeekCalendar = () => {
  const today = 2; // Wed highlighted

  return (
    <div className="rounded-3xl bg-card border border-border shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">This week</p>
          <h3 className="font-bold text-lg">April 15 — April 21</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 rounded-xl bg-secondary hover:bg-primary-soft transition-smooth flex items-center justify-center">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="h-9 w-9 rounded-xl bg-secondary hover:bg-primary-soft transition-smooth flex items-center justify-center">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-2">
        <div />
        {days.map((d, i) => (
          <div key={d} className="text-center pb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{d}</p>
            <p
              className={cn(
                "mt-1 text-sm font-semibold w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-smooth",
                i === today ? "bg-primary text-primary-foreground shadow-card" : "text-foreground"
              )}
            >
              {dates[i]}
            </p>
          </div>
        ))}

        {hours.map((h, hourIdx) => (
          <>
            <div key={`h-${h}`} className="text-[10px] text-muted-foreground py-3 pr-2 text-right">
              {h}
            </div>
            {days.map((_, dayIdx) => {
              const event = events.find((e) => e.day === dayIdx && e.hour === hourIdx);
              return (
                <div
                  key={`${dayIdx}-${hourIdx}`}
                  className="relative h-14 border-t border-border/50 hover:bg-secondary/30 transition-smooth rounded-md"
                >
                  {event && (
                    <div
                      className={cn(
                        "absolute inset-x-0.5 top-0.5 rounded-lg p-1.5 text-[10px] font-semibold leading-tight overflow-hidden cursor-pointer transition-spring hover:scale-[1.02]",
                        typeStyles[event.type]
                      )}
                      style={{ height: `calc(${event.duration * 56}px - 4px)` }}
                    >
                      {event.title}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-primary" />
          <span className="text-muted-foreground">Meeting</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-focus-high-soft border border-focus-high/30" />
          <span className="text-muted-foreground">Focus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-accent-soft border-2 border-dashed border-accent" />
          <span className="text-muted-foreground">Suggested</span>
        </div>
      </div>
    </div>
  );
};
