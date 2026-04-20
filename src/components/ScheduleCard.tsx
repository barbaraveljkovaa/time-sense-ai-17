import { Clock, MapPin, Video, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScheduleItem {
  id: string;
  time: string;
  duration: string;
  title: string;
  type: "meeting" | "focus" | "break" | "personal";
  location?: string;
  participants?: string[];
  reminder?: string;
}

const typeStyles = {
  meeting: "border-l-primary bg-primary-soft",
  focus: "border-l-focus-high bg-focus-high-soft",
  break: "border-l-accent bg-accent-soft",
  personal: "border-l-focus-mid bg-focus-mid-soft",
};

const typeIcon = {
  meeting: Video,
  focus: Clock,
  break: Clock,
  personal: Users,
};

export const ScheduleCard = ({ item }: { item: ScheduleItem }) => {
  const Icon = typeIcon[item.type];
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-2xl border-l-4 transition-spring hover:shadow-card hover:-translate-y-0.5",
        typeStyles[item.type]
      )}
    >
      <div className="flex-shrink-0 text-center min-w-[60px]">
        <p className="text-sm font-bold text-foreground">{item.time}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.duration}</p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-3.5 w-3.5 text-foreground/70" />
          <h4 className="font-semibold text-sm truncate">{item.title}</h4>
        </div>
        {item.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {item.location}
          </div>
        )}
        {item.reminder && (
          <p className="text-xs text-primary font-medium mt-1.5">⚡ {item.reminder}</p>
        )}
      </div>
    </div>
  );
};
