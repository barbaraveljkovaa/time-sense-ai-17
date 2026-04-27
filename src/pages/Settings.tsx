import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { LogOut, Mail, Database } from "lucide-react";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { events } = useEvents();

  return (
    <>
      <TopBar subtitle="Settings" />
      <div className="max-w-2xl space-y-6 animate-slide-up">
        <div className="rounded-3xl bg-card border border-border shadow-card p-6">
          <h3 className="font-bold text-lg mb-4">Profile</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Stored events</p>
                <p className="font-medium text-sm">{events.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border shadow-card p-6">
          <h3 className="font-bold text-lg mb-2">Preferences</h3>
          <p className="text-sm text-muted-foreground mb-4">
            The assistant currently avoids 12–1 PM (lunch) and prefers your stated time window.
            More personalization options coming soon.
          </p>
        </div>

        <div className="rounded-3xl bg-card border border-border shadow-card p-6">
          <h3 className="font-bold text-lg mb-2">Session</h3>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </>
  );
};

export default Settings;
