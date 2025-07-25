import jwt, { decode } from "jsonwebtoken"
import User from "../models/user.model.js"

export const protectRoute =async (req,res,next)=>{
    try{
        const token =req.cookies.jwt
        if(!token){
            return res.status(401).json({message:"Unauthorized token"})
        }
        
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({message:"Server configuration error"});
        }
        
        const decoded =jwt.verify(token,process.env.JWT_SECRET)
        if(!decoded){
            return res.status(401).json({message:"unauthorized token"})
        }
        
        const user =await User.findById(decoded.userId).select("-password")
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        
        req.user=user
        next();
    }
    catch(error){
     return res.status(500).json({message:"Internal server error", error: error.message})
    }
}