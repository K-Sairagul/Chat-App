import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ScheduleMessageForm from "./ScheduleMessageForm";


const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const [showScheduler, setShowScheduler] = useState(false);

  // Load & subscribe messages
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* Chat + Todo Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 border-r">
          {messages.map((message, index) => {
            const isOwn = message.senderId === authUser._id;
            const isLast = index === messages.length - 1;

            return (
              <div
                key={message._id}
                className={`chat ${isOwn ? "chat-end" : "chat-start"}`}
                ref={isLast ? messageEndRef : null} // ✅ only last message has ref
              >
                {/* Avatar */}
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        isOwn
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser?.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>

                {/* Message bubble */}
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble flex flex-col">
                  {/* Show attachment */}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}

                  {/* Show text */}
                  {message.text && <p>{message.text}</p>}

                  {/* Scheduled message indicator */}
                  {message.scheduledFor && (
                    <p className="text-xs text-yellow-300 mt-1 flex items-center gap-1">
                      ⏰ Scheduled for{" "}
                      {new Date(message.scheduledFor).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {/* Dummy div for scroll */}
          <div ref={messageEndRef} />
        </div>

        {/* ✅ To-Do List Sidebar */}
        
      </div>

      {/* Controls */}
      <div className="border-t p-3">
        <button
          onClick={() => setShowScheduler((prev) => !prev)}
          className="text-sm text-blue-500 mb-2 hover:underline"
        >
          {showScheduler ? "✉️ Send Now" : "⏰ Schedule Message"}
        </button>

        {showScheduler ? <ScheduleMessageForm /> : <MessageInput />}
      </div>
    </div>
  );
};

export default ChatContainer;
