import { useState } from "react";
import { Send, Sparkles, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEvents, AppEvent } from "@/hooks/useEvents";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Suggestion {
  start: string;
  end: string;
  reason: string;
}
interface Intent {
  title: string;
  duration_minutes: number;
  preferred_window: string;
  reasoning: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: Suggestion[];
  intent?: Intent;
}

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi 👋 I'm your scheduling assistant. Try: \"Schedule a 30-minute meeting with Alex tomorrow morning.\"",
  },
];

const quickPrompts = [
  "Schedule a 30-min sync with Alex tomorrow morning",
  "Find 1 hour for deep work this week",
  "Book a workout Friday afternoon",
];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const ChatAssistant = ({ embedded = false }: { embedded?: boolean }) => {
  const { events, createEvent } = useEvents();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [confirming, setConfirming] = useState<{
    title: string;
    suggestion: Suggestion;
  } | null>(null);
  const [creating, setCreating] = useState(false);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || thinking) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content },
    ]);
    setInput("");
    setThinking(true);

    try {
      const { data, error } = await supabase.functions.invoke("schedule-assistant", {
        body: {
          message: content,
          events: events.map((e) => ({ starts_at: e.starts_at, ends_at: e.ends_at })),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const intent = data.intent as Intent;
      const suggestions = (data.suggestions ?? []) as Suggestion[];

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            suggestions.length === 0
              ? `I understood "${intent.title}" but couldn't find open ${intent.duration_minutes}-min slots in your preferred window. Want me to look wider?`
              : `${intent.reasoning} Here are ${suggestions.length} options for "${intent.title}" (${intent.duration_minutes} min):`,
          suggestions,
          intent,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error("Assistant error", { description: msg });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            msg.includes("429")
              ? "I'm being rate-limited. Try again in a moment."
              : msg.includes("402")
              ? "AI credits exhausted. Please add credits in your workspace."
              : "I hit a snag processing that. Please try again.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirming) return;
    setCreating(true);
    try {
      const ev: Omit<AppEvent, "id" | "user_id" | "created_at" | "updated_at"> = {
        title: confirming.title,
        description: null,
        starts_at: confirming.suggestion.start,
        ends_at: confirming.suggestion.end,
        event_type: "meeting",
        location: null,
      };
      await createEvent(ev);
      toast.success("Event scheduled", {
        description: `${confirming.title} • ${fmt(confirming.suggestion.start)}`,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `✅ Booked "${confirming.title}" for ${fmt(confirming.suggestion.start)}. It's now in your calendar.`,
        },
      ]);
      setConfirming(null);
    } catch (err) {
      toast.error("Could not save event", {
        description: err instanceof Error ? err.message : "",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "rounded-3xl bg-card border border-border shadow-card flex flex-col overflow-hidden",
          embedded ? "h-[calc(100vh-12rem)]" : "h-[640px]",
        )}
      >
        <div className="flex items-center gap-3 p-5 border-b border-border bg-gradient-soft">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-sm">TimeSense Assistant</h3>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
              <p className="text-xs text-muted-foreground">Powered by Lovable AI</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex animate-fade-in",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm",
                )}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {fmt(s.start)}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">{s.reason}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            setConfirming({ title: msg.intent?.title ?? "Meeting", suggestion: s })
                          }
                          className="h-7 px-3 text-xs rounded-lg bg-gradient-primary hover:opacity-90 transition-smooth"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Book
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
                <span
                  className="h-2 w-2 rounded-full bg-primary animate-pulse-soft"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-primary animate-pulse-soft"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border space-y-3">
          <div className="flex gap-2 flex-wrap">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                disabled={thinking}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-primary-soft hover:text-primary transition-smooth border border-border disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to schedule something..."
              className="rounded-xl bg-secondary border-transparent focus-visible:ring-primary"
              disabled={thinking}
            />
            <Button
              type="submit"
              size="icon"
              disabled={thinking}
              className="rounded-xl bg-gradient-primary hover:opacity-90 transition-smooth shadow-card"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      <Dialog open={!!confirming} onOpenChange={(o) => !o && setConfirming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create event?</DialogTitle>
            <DialogDescription>
              {confirming &&
                `Schedule "${confirming.title}" on ${fmt(confirming.suggestion.start)} – ${new Date(
                  confirming.suggestion.end,
                ).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(null)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={creating} className="bg-gradient-primary">
              {creating ? "Saving..." : "Confirm & add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
