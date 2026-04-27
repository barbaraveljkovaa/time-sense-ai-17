import { ReactNode } from "react";
import { NavLink, Outlet, Navigate } from "react-router-dom";
import {
  Calendar,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/chat", label: "Chat Assistant", icon: MessageSquare },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export const AppLayout = ({ children }: { children?: ReactNode }) => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background flex">
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
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-2xl bg-gradient-soft p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold">AI Tip</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ask the assistant: "Schedule a 30-min sync with Alex tomorrow morning."
            </p>
          </div>

          <div className="rounded-xl bg-card border border-border p-3 text-xs">
            <p className="font-semibold truncate">{user.email}</p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 justify-start text-muted-foreground"
              onClick={signOut}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-[1600px] mx-auto w-full">
        {/* Mobile nav */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap",
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>

        {children ?? <Outlet />}
      </main>
    </div>
  );
};
