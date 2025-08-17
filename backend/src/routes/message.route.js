import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUserForSidebar, getMessages, sendMessages } from "../controllers/message.controller.js";

const router = express.Router();

// Fetch all users for sidebar (excluding self)
router.get("/users", protectRoute, getUserForSidebar);

// Fetch chat messages with a specific user
router.get("/chat/:id", protectRoute, getMessages);

// Send a new message (text + optional image)
router.post("/send/:id", protectRoute, sendMessages);

export default router;
