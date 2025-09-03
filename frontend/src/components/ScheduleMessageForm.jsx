import { useState } from "react";
import { useChatStore } from "../store/useChatStore";

const ScheduleMessageForm = () => {
  const { scheduleMessage } = useChatStore();
  const [content, setContent] = useState("");
  const [dateTime, setDateTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || !dateTime) {
      alert("Please enter message & pick a time");
      return;
    }

    await scheduleMessage(content, dateTime);

    setContent("");
    setDateTime("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 border rounded-lg bg-white shadow">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type message..."
        className="border p-2 rounded w-full resize-none"
      />

      <input
        type="datetime-local"
        value={dateTime}
        onChange={(e) => setDateTime(e.target.value)}
        className="border p-2 rounded"
      />

      <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Schedule Message
      </button>
    </form>
  );
};

export default ScheduleMessageForm;
