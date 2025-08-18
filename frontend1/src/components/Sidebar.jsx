import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const {
    getUsers,
    users: rawUsers,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();
  const { onlineUsers: rawOnlineUsers } = useAuthStore();
  const users = rawUsers || [];
  const onlineUsers = rawOnlineUsers || [];
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // Filter users based on "online only" checkbox
  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside
      className={`
        h-full border-r border-base-300 flex flex-col transition-all duration-300
        bg-base-200 absolute lg:static z-20
        ${isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"}
        lg:w-72 lg:translate-x-0
      `}
    >
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5 flex items-center gap-2">
        <Users className="size-6" />
        <span className="font-medium hidden lg:block">Contact</span>
      </div>

      {/* Online toggle (only on desktop) */}
      <div className="overflow-y-auto w-full py-3">
        <div className="mt-3 hidden lg:flex items-center gap-2 px-3">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({(onlineUsers?.length || 0) - 1} online)
          </span>
        </div>
      </div>

      {/* Users list */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              if (window.innerWidth < 1024) {
                setIsSidebarOpen(false); // ✅ auto-hide on mobile
              }
            }}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info (desktop only) */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers && filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            No online users
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
