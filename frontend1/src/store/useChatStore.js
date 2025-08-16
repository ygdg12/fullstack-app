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

  // Fetch users safely
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

  // Fetch messages safely
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

  // Send a message via API
  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      // Message will be added via socket
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
      throw error;
    }
  },

  // Add message safely
  addMessage: (newMessage) => {
    const { messages, selectedUser } = get();
    const { authUser } = useAuthStore.getState();

    if (
      newMessage.senderId === selectedUser?._id ||
      newMessage.receiverId === selectedUser?._id ||
      newMessage.senderId === authUser?._id
    ) {
      const messageExists = messages.some(msg => msg._id === newMessage._id);
      if (!messageExists) {
        set({ messages: [...messages, newMessage] });
      }
    }
  },

  // Subscribe to socket messages
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Socket is null in subscribeToMessages");
      return;
    }

    // Remove previous listeners
    socket.off("newMessage");

    // Add new message listener
    socket.on("newMessage", (newMessage) => {
      get().addMessage(newMessage);
    });
  },

  // Unsubscribe from socket messages
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Socket is null in unsubscribeFromMessages");
      return;
    }
    socket.off("newMessage");
  },

  // Set selected user and fetch messages
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser?._id) {
      get().getMessages(selectedUser._id);
    }
  },
}));
