import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import {io} from "socket.io-client"

const   BASE_URL = import.meta.env.MODE == "development"?"http://localhost:5001":"/"
export const useAuthStore =create((set,get)=>({
    authUser:null,
    isCheckingAuth:true,
     isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    onlineUsers:[],
    socket:null,

    checkAuth :async ()=>{
        try{
         const res = await axiosInstance.get("/auth/check")
         set({authUser:res.data})
         // Connect socket after successful auth check
         if (res.data) {
             get().connectSocket();
         }
        }
        catch(error){
            set({authUser:null})
        }
        finally{
            set({isCheckingAuth:false});
        }
    },

    signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
    login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async ()=>{
    try{
     await axiosInstance.post("/auth/logout");
     set({authUser:null})
     toast.success("Logged out successfully")
     get().disconnectSocket()
    }
    catch(error){
      toast.error(error.response.data.message)
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket:()=>{
    const {authUser} =get()
    if(!authUser || get().socket?.connected)  return;

    console.log("Connecting socket for user:", authUser._id);

    const socket =io(BASE_URL, {
      query:{
        userId : authUser._id,
      },
      transports: ['websocket', 'polling']
    })
    
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });
    
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("getOnlineUsers", (userIds)=>{
      console.log("Received online users:", userIds);
      set({onlineUsers:userIds})
    })

    socket.on("newMessage", (message) => {
      console.log("Received new message:", message);
    });
    
    set({socket:socket})
  },
  disconnectSocket:()=>{
    const {socket} = get();
    if(socket) {
      console.log("Disconnecting socket");
      socket.disconnect();
      set({socket: null, onlineUsers: []});
    }
  }
}))