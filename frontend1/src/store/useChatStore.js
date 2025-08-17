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

  // Fetch users
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

  // Fetch messages for selected user
  getMessages: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/chat/${userId}`);
      set({ messages: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send a message and add to store immediately
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      const newMessage = res.data;

      // Add new message to store immediately
      set({ messages: [...messages, newMessage] });

      return newMessage;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
      throw error;
    }
  },

  // Add message safely (for socket)
  addMessage: (newMessage) => {
    const { messages, selectedUser } = get();
    const { authUser } = useAuthStore.getState();

    if (
      newMessage.senderId === selectedUser?._id ||
      newMessage.receiverId === selectedUser?._id ||
      newMessage.senderId === authUser?._id
    ) {
      const exists = messages.some(msg => msg._id === newMessage._id);
      if (!exists) set({ messages: [...messages, newMessage] });
    }
  },

  // Socket subscription
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      get().addMessage(newMessage);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },

  // Select a user
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser?._id) get().getMessages(selectedUser._id);
  },
}));
