import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { ArrowLeft } from "lucide-react";

const ChatContainer = ({ setIsSidebarOpen }) => {
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

  // Fetch messages when user selected
  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
  }, [selectedUser, getMessages]);

  // Subscribe/unsubscribe socket
  useEffect(() => {
    if (selectedUser) {
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to latest
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Loading state
  if (isMessagesLoading)
    return (
      <div className="flex-1 flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  if (!selectedUser)
    return (
      <div className="flex-1 flex-col overflow-auto">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-base-content/70">Select a user to start chatting</p>
        </div>
      </div>
    );

  return (
    <div className="flex-1 flex-col overflow-auto">
      {/* Chat Header with Back Button on Mobile */}
      <div className="flex items-center gap-2 p-2 border-b border-base-300">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 rounded-full hover:bg-base-300"
        >
          <ArrowLeft size={20} />
        </button>
        <ChatHeader />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages?.map((message, idx) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={idx === messages.length - 1 ? messageEndRef : null}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  onError={(e) => (e.currentTarget.src = "/avatar.png")}
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                  loading="lazy"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
