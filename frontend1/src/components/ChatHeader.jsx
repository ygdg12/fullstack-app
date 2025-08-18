import React from "react";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null; // nothing if no chat selected

  return (
    <div className="fixed top-0 left-0 right-0 bg-base-100 z-50 border-b border-base-300 p-2.5">
      <div className="flex items-center gap-3">
        {/* Single back button */}
        <button
          onClick={() => setSelectedUser(null)}
          className="p-2 rounded-full hover:bg-base-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="avatar">
          <div className="w-10 h-10 rounded-full relative">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
            />
          </div>
        </div>

        {/* User info */}
        <div>
          <h3 className="font-medium">{selectedUser.fullName}</h3>
          <p className="text-sm text-base-content/70">
            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
