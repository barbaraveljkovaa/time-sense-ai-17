import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents, AppEvent } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const startHour = 8;
const endHour = 20;
const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

const typeStyles: Record<AppEvent["event_type"], string> = {
  meeting: "bg-primary text-primary-foreground",
  focus: "bg-focus-high-soft text-focus-high border border-focus-high/30",
  break: "bg-focus-mid-soft text-focus-mid border border-focus-mid/30",
  personal: "bg-accent-soft text-accent border border-accent/30",
};

interface NewEventDraft {
  starts_at: Date;
  ends_at: Date;
}

export const WeekCalendar = () => {
  const { events, createEvent, deleteEvent } = useEvents();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [draft, setDraft] = useState<NewEventDraft | null>(null);
  const [selected, setSelected] = useState<AppEvent | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<AppEvent["event_type"]>("meeting");
  const [busy, setBusy] = useState(false);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  const today = new Date();
  const todayIdx = days.findIndex(
    (d) =>
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate(),
  );

  const visibleEvents = useMemo(() => {
    const wkEnd = new Date(weekStart);
    wkEnd.setDate(weekStart.getDate() + 7);
    return events.filter((e) => {
      const s = new Date(e.starts_at);
      return s >= weekStart && s < wkEnd;
    });
  }, [events, weekStart]);

  const fmtRange = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  const handleSlotClick = (dayIdx: number, hour: number) => {
    const s = new Date(days[dayIdx]);
    s.setHours(hour, 0, 0, 0);
    const e = new Date(s);
    e.setHours(hour + 1, 0, 0, 0);
    setDraft({ starts_at: s, ends_at: e });
    setTitle("");
    setType("meeting");
  };

  const handleCreate = async () => {
    if (!draft || !title.trim()) return;
    setBusy(true);
    try {
      await createEvent({
        title: title.trim(),
        description: null,
        starts_at: draft.starts_at.toISOString(),
        ends_at: draft.ends_at.toISOString(),
        event_type: type,
        location: null,
      });
      toast.success("Event created");
      setDraft(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await deleteEvent(selected.id);
      toast.success("Event deleted");
      setSelected(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl bg-card border border-border shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">This week</p>
          <h3 className="font-bold text-lg">{fmtRange()}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() - 7);
              setWeekStart(d);
            }}
            className="h-9 w-9 rounded-xl bg-secondary hover:bg-primary-soft transition-smooth flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
          >
            Today
          </Button>
          <button
            onClick={() => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() + 7);
              setWeekStart(d);
            }}
            className="h-9 w-9 rounded-xl bg-secondary hover:bg-primary-soft transition-smooth flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 overflow-x-auto">
        <div />
        {days.map((d, i) => (
          <div key={i} className="text-center pb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {dayLabels[i]}
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-semibold w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-smooth",
                i === todayIdx
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "text-foreground",
              )}
            >
              {d.getDate()}
            </p>
          </div>
        ))}

        {hours.map((h) => (
          <div key={h} className="contents">
            <div className="text-[10px] text-muted-foreground py-3 pr-2 text-right">
              {h <= 12 ? `${h} ${h === 12 ? "PM" : "AM"}` : `${h - 12} PM`}
            </div>
            {days.map((_, dayIdx) => {
              const slotEvents = visibleEvents.filter((e) => {
                const s = new Date(e.starts_at);
                return (
                  s.getFullYear() === days[dayIdx].getFullYear() &&
                  s.getMonth() === days[dayIdx].getMonth() &&
                  s.getDate() === days[dayIdx].getDate() &&
                  s.getHours() === h
                );
              });
              return (
                <div
                  key={`${dayIdx}-${h}`}
                  onClick={() => handleSlotClick(dayIdx, h)}
                  className="relative h-14 border-t border-border/50 hover:bg-primary-soft/40 transition-smooth rounded-md cursor-pointer"
                >
                  {slotEvents.map((ev) => {
                    const s = new Date(ev.starts_at);
                    const e = new Date(ev.ends_at);
                    const minutes = (e.getTime() - s.getTime()) / 60000;
                    const heightPx = Math.max(20, (minutes / 60) * 56 - 4);
                    return (
                      <div
                        key={ev.id}
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setSelected(ev);
                        }}
                        className={cn(
                          "absolute inset-x-0.5 top-0.5 rounded-lg p-1.5 text-[10px] font-semibold leading-tight overflow-hidden cursor-pointer transition-spring hover:scale-[1.02] z-10",
                          typeStyles[ev.event_type],
                        )}
                        style={{ height: `${heightPx}px` }}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-primary" />
          <span className="text-muted-foreground">Meeting</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-focus-high-soft border border-focus-high/30" />
          <span className="text-muted-foreground">Focus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-focus-mid-soft border border-focus-mid/30" />
          <span className="text-muted-foreground">Break</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-accent-soft border border-accent/30" />
          <span className="text-muted-foreground">Personal</span>
        </div>
        <span className="text-muted-foreground ml-auto">Tip: click an empty slot to add an event</span>
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New event</DialogTitle>
            <DialogDescription>
              {draft &&
                `${draft.starts_at.toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })} – ${draft.ends_at.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="ev-title">Title</Label>
              <Input
                id="ev-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sync with team"
                autoFocus
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as AppEvent["event_type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="focus">Focus</SelectItem>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)} disabled={busy}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={busy || !title.trim()}
              className="bg-gradient-primary"
            >
              {busy ? "Saving..." : "Create event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {selected &&
                `${new Date(selected.starts_at).toLocaleString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })} – ${new Date(selected.ends_at).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}`}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Type: <span className="capitalize text-foreground font-medium">{selected?.event_type}</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)} disabled={busy}>
              Close
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={busy}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
