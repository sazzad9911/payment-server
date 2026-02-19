import express from "express";
import { ChatController } from "./Chat.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/conversation", auth(), ChatController.startConversation);
router.get("/conversations", auth("ADMIN"), ChatController.getConversations);

router.get("/messages/:conversationId", auth(), ChatController.getMessages);

router.post("/messages/:conversationId", auth(), ChatController.sendMessage);

export const ChatRoutes = router;
