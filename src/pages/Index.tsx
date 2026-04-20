import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { StatCards } from "@/components/StatCards";
import { TodaySchedule } from "@/components/TodaySchedule";
import { ChatAssistant } from "@/components/ChatAssistant";
import { ProductivityChart } from "@/components/ProductivityChart";
import { WeekCalendar } from "@/components/WeekCalendar";
import { Reminders } from "@/components/Reminders";

const Index = () => {
  const [active, setActive] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar active={active} onSelect={setActive} />

      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-[1600px] mx-auto w-full">
        <TopBar />

        <h1 className="sr-only">TimeSense AI — Smart Scheduling Dashboard</h1>

        <div className="space-y-6 animate-slide-up">
          <StatCards />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <ProductivityChart />
              <WeekCalendar />
              <TodaySchedule />
            </div>

            <div className="space-y-6">
              <ChatAssistant />
              <Reminders />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
