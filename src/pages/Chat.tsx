import { TopBar } from "@/components/TopBar";
import { ChatAssistant } from "@/components/ChatAssistant";
import { Reminders } from "@/components/Reminders";

const Chat = () => {
  return (
    <>
      <TopBar subtitle="Chat Assistant" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
        <div className="lg:col-span-2">
          <ChatAssistant embedded />
        </div>
        <div>
          <Reminders />
        </div>
      </div>
    </>
  );
};

export default Chat;
