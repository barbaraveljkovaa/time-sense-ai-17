import { TopBar } from "@/components/TopBar";
import { WeekCalendar } from "@/components/WeekCalendar";
import { TodaySchedule } from "@/components/TodaySchedule";

const CalendarPage = () => {
  return (
    <>
      <TopBar subtitle="Calendar" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-slide-up">
        <div className="xl:col-span-2">
          <WeekCalendar />
        </div>
        <div>
          <TodaySchedule />
        </div>
      </div>
    </>
  );
};

export default CalendarPage;
