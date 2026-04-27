import { useAuth } from "@/hooks/useAuth";

export const TopBar = ({ subtitle }: { subtitle?: string }) => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const name = user?.email?.split("@")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className="flex items-center justify-between gap-4 mb-8">
      <div>
        <p className="text-sm text-muted-foreground">{today}</p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          {subtitle ?? `${greeting}, ${name} 👋`}
        </h2>
      </div>
      <div className="hidden md:flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold shadow-card">
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
