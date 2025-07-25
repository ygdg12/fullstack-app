import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUserForSidebar = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getMessages =async  (req,res)=>{
    try{
        const {id:userToChatId} = req.params
        const myId =req.user._id

        const messages =await Message.find({
            $or:[
                {senderId:myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ]
        }).sort({ createdAt: 1 })
        res.status(200).json(messages)
    }catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export const sendMessages =async (req,res)=>{
    try{
        const {text,image}=req.body
        const {id:receiverId}=req.params
        const senderId= req.user._id

        let imageUrl;
        if(image){
            const uploadResopnse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResopnse.secure_url
        }
      const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image:imageUrl
      })
       await newMessage.save()
       const receiverSocketId = getReceiverSocketId(receiverId)
       if(receiverSocketId){
           io.to(receiverSocketId).emit("newMessage",newMessage)
       }
       
       // Emit the new message to all connected clients
       if (io) {
           io.emit("newMessage", newMessage);
       }
       
       res.status(201).json(newMessage)
    } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
