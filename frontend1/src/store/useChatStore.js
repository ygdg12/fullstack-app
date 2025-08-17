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

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data || [] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/chat/${userId}`);
      set({ messages: res.data || [] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      return res.data; // handled by socket
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
      throw error;
    }
  },

  addMessage: (newMessage) => {
    const { messages, selectedUser } = get();
    const { authUser } = useAuthStore.getState();

    if (
      newMessage.senderId === selectedUser?._id ||
      newMessage.receiverId === selectedUser?._id ||
      newMessage.senderId === authUser?._id
    ) {
      const exists = messages.some((msg) => msg._id === newMessage._id);
      if (!exists) set({ messages: [...messages, newMessage] });
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.on("newMessage", (message) => get().addMessage(message));
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser?._id) get().getMessages(selectedUser._id);
  },
}));
