import {Server} from  "socket.io"
import http from "http"
import express from "express"

const app= express()
let io = null; // shared variable
const userSocketMap = {}; // Move to top-level scope

export function getReceiverSocketId(userId){
       return userSocketMap[userId]
    }

export const createSocketServer = (app) => {
    const server = http.createServer(app)
    
    io = new Server(server ,{
       cors: {
  origin: process.env.NODE_ENV === "production"
    ? "https://fullstack-app-sxv1.onrender.com"
    : "http://localhost:5173",
  credentials: true
}

    });
    
    io.on("connection", (socket)=>{
         console.log("A user Connected", socket.id)

         const userId = socket.handshake.query.userId
         if(userId) {
             userSocketMap[userId] = socket.id
             io.emit("getOnlineUsers", Object.keys(userSocketMap))
         }

        socket.on("disconnect", ()=>{
             console.log("A user Disconnected", socket.id)
             // Find and remove the user from userSocketMap
             const disconnectedUserId = Object.keys(userSocketMap).find(key => userSocketMap[key] === socket.id)
             if(disconnectedUserId) {
                 delete userSocketMap[disconnectedUserId]
                 io.emit("getOnlineUsers", Object.keys(userSocketMap))
             }
        })

        // Handle new message events
        socket.on("newMessage", (message) => {
            // Emit to all connected clients
            io.emit("newMessage", message)
        })
    })
    
    return { io, server }
}

export { app, io }

