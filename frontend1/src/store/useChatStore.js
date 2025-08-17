import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Fetch all users you can chat with
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch conversation with a specific user
  getMessages: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send a message to the selected user
  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );
      // No need to manually push here (handled via socket)
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
      throw error;
    }
  },

  // Add a new message into state safely (from socket or local)
  addMessage: (newMessage) => {
    const { messages, selectedUser } = get();
    const { authUser } = useAuthStore.getState();

    // Only add if message belongs to the active conversation
    if (
      newMessage.senderId === selectedUser?._id ||
      newMessage.receiverId === selectedUser?._id ||
      newMessage.senderId === authUser?._id
    ) {
      const exists = messages.some((msg) => msg._id === newMessage._id);
      if (!exists) {
        set({ messages: [...messages, newMessage] });
      }
    }
  },

  // Subscribe to incoming socket messages
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Socket is null in subscribeToMessages");
      return;
    }

    // Remove previous listener to avoid duplicates
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      get().addMessage(newMessage);
    });
  },

  // Unsubscribe when component unmounts or user changes
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Socket is null in unsubscribeFromMessages");
      return;
    }
    socket.off("newMessage");
  },

  // Select a user and immediately fetch conversation
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser?._id) {
      get().getMessages(selectedUser._id);
    } else {
      set({ messages: [] });
    }
  },
}));
