import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";

export const TopBar = () => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex items-center justify-between gap-4 mb-8">
      <div>
        <p className="text-sm text-muted-foreground">{today}</p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Good morning, Sam <span className="inline-block">👋</span>
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events, people..."
            className="pl-9 w-64 rounded-xl bg-card border-border"
          />
        </div>
        <button className="relative h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-secondary transition-smooth">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse-soft" />
        </button>
        <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold shadow-card">
          S
        </div>
      </div>
    </header>
  );
};
