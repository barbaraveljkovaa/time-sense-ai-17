import { TopBar } from "@/components/TopBar";
import { StatCards } from "@/components/StatCards";
import { TodaySchedule } from "@/components/TodaySchedule";
import { ChatAssistant } from "@/components/ChatAssistant";
import { ProductivityChart } from "@/components/ProductivityChart";
import { Reminders } from "@/components/Reminders";

const Dashboard = () => {
  return (
    <>
      <TopBar />
      <h1 className="sr-only">TimeSense AI — Smart Scheduling Dashboard</h1>
      <div className="space-y-6 animate-slide-up">
        <StatCards />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <ProductivityChart />
            <TodaySchedule />
          </div>
          <div className="space-y-6">
            <ChatAssistant />
            <Reminders />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
