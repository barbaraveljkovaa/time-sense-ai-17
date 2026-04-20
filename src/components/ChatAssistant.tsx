import { useState } from "react";
import { Send, Sparkles, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: { time: string; reason: string }[];
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hi Sam 👋 I'm your scheduling assistant. Try asking me to find time for a meeting, study session, or workout.",
  },
];

const quickPrompts = [
  "Schedule a meeting with Alex next week",
  "Find time for studying tomorrow",
  "Block 1h for deep work today",
];

export const ChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    // Simulated AI response
    setTimeout(() => {
      const reply: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Great — I found a few open slots that match your focus patterns. Here are my top suggestions:`,
        suggestions: [
          { time: "Tomorrow · 9:30 AM", reason: "Peak focus, calendar clear" },
          { time: "Tomorrow · 2:00 PM", reason: "Right after lunch break" },
          { time: "Thursday · 10:00 AM", reason: "High focus window" },
          { time: "Friday · 11:00 AM", reason: "Light meeting load" },
        ],
      };
      setMessages((prev) => [...prev, reply]);
      setThinking(false);
    }, 900);
  };

  const handleConfirm = (time: string) => {
    toast.success("Event scheduled", {
      description: `${time} added to your calendar.`,
    });
  };

  return (
    <div className="rounded-3xl bg-card border border-border shadow-card flex flex-col h-[640px] overflow-hidden">
      <div className="flex items-center gap-3 p-5 border-b border-border bg-gradient-soft">
        <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-bold text-sm">TimeSense Assistant</h3>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
            <p className="text-xs text-muted-foreground">Online · ready to help</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex animate-fade-in",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary text-foreground rounded-bl-sm"
              )}
            >
              <p className="leading-relaxed">{msg.content}</p>

              {msg.suggestions && (
                <div className="mt-3 space-y-2">
                  {msg.suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{s.time}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{s.reason}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(s.time)}
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
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
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
              className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-primary-soft hover:text-primary transition-smooth border border-border"
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
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-xl bg-gradient-primary hover:opacity-90 transition-smooth shadow-card"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
