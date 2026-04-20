import { ScheduleCard, ScheduleItem } from "./ScheduleCard";

const items: ScheduleItem[] = [
  {
    id: "1",
    time: "9:30",
    duration: "1h",
    title: "Deep work · Product spec",
    type: "focus",
    reminder: "Peak focus window",
  },
  {
    id: "2",
    time: "11:00",
    duration: "30m",
    title: "Sync with Alex",
    type: "meeting",
    location: "Google Meet",
    reminder: "Starts in 45 min",
  },
  {
    id: "3",
    time: "12:30",
    duration: "1h",
    title: "Lunch & walk",
    type: "break",
  },
  {
    id: "4",
    time: "2:00",
    duration: "1h",
    title: "Design review",
    type: "meeting",
    location: "Studio · Floor 3",
    reminder: "Leave in 10 min",
  },
  {
    id: "5",
    time: "4:00",
    duration: "45m",
    title: "Workout",
    type: "personal",
  },
];

export const TodaySchedule = () => {
  return (
    <div className="rounded-3xl bg-card border border-border shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Today's plan</p>
          <h3 className="font-bold text-lg">5 events scheduled</h3>
        </div>
        <button className="text-xs font-semibold text-primary hover:underline">View all</button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <ScheduleCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
