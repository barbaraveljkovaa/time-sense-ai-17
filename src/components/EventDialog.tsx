import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEvents, AppEvent } from "@/hooks/useEvents";

export interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing event being edited, or null when creating a new one */
  event?: AppEvent | null;
  /** Optional initial datetime when creating (Date) */
  initialStart?: Date;
  initialEnd?: Date;
}

const types: AppEvent["event_type"][] = ["meeting", "focus", "break", "personal"];

/** Format Date to value usable by <input type="datetime-local"> in user's local TZ. */
function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(v: string): Date {
  // datetime-local has no TZ; treat as local
  return new Date(v);
}

export const EventDialog = ({
  open,
  onOpenChange,
  event,
  initialStart,
  initialEnd,
}: EventDialogProps) => {
  const { createEvent, updateEvent, deleteEvent, findOverlaps } = useEvents();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<AppEvent["event_type"]>("meeting");
  const [starts, setStarts] = useState("");
  const [ends, setEnds] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [overlapWarn, setOverlapWarn] = useState<AppEvent[]>([]);

  // Hydrate fields when dialog opens
  useEffect(() => {
    if (!open) return;
    if (event) {
      setTitle(event.title);
      setType(event.event_type);
      setStarts(toLocalInput(new Date(event.starts_at)));
      setEnds(toLocalInput(new Date(event.ends_at)));
      setDescription(event.description ?? "");
    } else {
      const s = initialStart ?? new Date(Math.ceil(Date.now() / (30 * 60_000)) * 30 * 60_000);
      const e = initialEnd ?? new Date(s.getTime() + 60 * 60_000);
      setTitle("");
      setType("meeting");
      setStarts(toLocalInput(s));
      setEnds(toLocalInput(e));
      setDescription("");
    }
    setOverlapWarn([]);
  }, [open, event, initialStart, initialEnd]);

  // Live overlap detection
  useEffect(() => {
    if (!open || !starts || !ends) return;
    try {
      const s = fromLocalInput(starts).toISOString();
      const e = fromLocalInput(ends).toISOString();
      if (new Date(e) <= new Date(s)) {
        setOverlapWarn([]);
        return;
      }
      setOverlapWarn(findOverlaps(s, e, event?.id));
    } catch {
      setOverlapWarn([]);
    }
  }, [starts, ends, open, event?.id, findOverlaps]);

  const isEdit = !!event;

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    const sDate = fromLocalInput(starts);
    const eDate = fromLocalInput(ends);
    if (eDate <= sDate) {
      toast.error("End time must be after start time");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        starts_at: sDate.toISOString(),
        ends_at: eDate.toISOString(),
        event_type: type,
        location: null,
      };
      if (isEdit && event) {
        await updateEvent(event.id, payload);
        toast.success("Event updated");
      } else {
        await createEvent(payload);
        toast.success("Event created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    setBusy(true);
    try {
      await deleteEvent(event.id);
      toast.success("Event deleted");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit event" : "New event"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details and save your changes."
              : "Set a custom title, type, and duration."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="ed-title">Title</Label>
            <Input
              id="ed-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study session, Gym, Sync with Alex"
              autoFocus
              maxLength={120}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ed-start">Starts</Label>
              <Input
                id="ed-start"
                type="datetime-local"
                value={starts}
                onChange={(e) => setStarts(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ed-end">Ends</Label>
              <Input
                id="ed-end"
                type="datetime-local"
                value={ends}
                onChange={(e) => setEnds(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as AppEvent["event_type"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ed-desc">Notes (optional)</Label>
            <Textarea
              id="ed-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Anything to remember..."
              rows={3}
              maxLength={500}
            />
          </div>

          {overlapWarn.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-focus-mid-soft text-focus-mid border border-focus-mid/30 text-xs">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">
                  Overlaps with {overlapWarn.length} existing event
                  {overlapWarn.length === 1 ? "" : "s"}
                </p>
                <ul className="mt-1 space-y-0.5 text-foreground/80">
                  {overlapWarn.slice(0, 3).map((ev) => (
                    <li key={ev.id} className="truncate">
                      • {ev.title} (
                      {new Date(ev.starts_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      )
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {isEdit && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={busy}
              className="mr-auto"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={busy} className="bg-gradient-primary">
            {busy ? "Saving..." : isEdit ? "Save changes" : "Create event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
