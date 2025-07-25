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
      set({ users: res.data });
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
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;
    
    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      // Don't add to messages here as it will be added via socket
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
      throw error;
    }
  },

  addMessage: (newMessage) => {
    const { messages, selectedUser } = get();
    const { authUser } = useAuthStore.getState();
    
    // Only add message if it's from the selected user or to the selected user
    if (newMessage.senderId === selectedUser?._id || 
        newMessage.receiverId === selectedUser?._id ||
        newMessage.senderId === authUser?._id) {
      
      // Check if message already exists
      const messageExists = messages.some(msg => msg._id === newMessage._id);
      if (!messageExists) {
        set({ messages: [...messages, newMessage] });
      }
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Socket is null in subscribeToMessages");
      return;
    }

    // Remove any existing listeners to prevent duplicates
    socket.off("newMessage");
    
    // Add new message listener
    socket.on("newMessage", (newMessage) => {
      get().addMessage(newMessage);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Socket is null in unsubscribeFromMessages");
      return;
    }
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      get().getMessages(selectedUser._id);
    }
  },
}));
