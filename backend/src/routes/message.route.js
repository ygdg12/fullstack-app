import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUserForSidebar, getMessages, sendMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUserForSidebar);
router.get("/chat/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessages);

export default router;
