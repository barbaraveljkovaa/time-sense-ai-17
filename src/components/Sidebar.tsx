import { Calendar, LayoutDashboard, MessageSquare, Sparkles, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  active: string;
  onSelect: (key: string) => void;
}

const items = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "calendar", label: "Calendar", icon: Calendar },
  { key: "chat", label: "Assistant", icon: MessageSquare },
  { key: "insights", label: "Insights", icon: Sparkles },
  { key: "reminders", label: "Reminders", icon: Bell },
];

export const Sidebar = ({ active, onSelect }: SidebarProps) => {
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-sidebar h-screen sticky top-0 px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight">TimeSense</h1>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase">AI Assistant</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth",
                isActive
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="rounded-2xl bg-gradient-soft p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold">AI Tip</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your peak focus is between 9–11 AM. I'll protect that time today.
          </p>
        </div>

        <button className="mt-4 flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary w-full transition-smooth">
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
};
