import { Request, Response } from "express";
import httpStatus from "http-status";
import { ChatService } from "./Chat.service";
import { io } from "../../../socket";

const startConversation = async (req: Request, res: Response) => {
  const result = await ChatService.startConversation({
    senderId: req.user.id,
  });

  res.status(httpStatus.OK).json({
    success: true,
    data: result,
  });
};

const getConversations = async (_req: Request, res: Response) => {
  const result = await ChatService.getConversations();
  res.status(200).json({ success: true, data: result });
};

const getMessages = async (req: Request, res: Response) => {
  const { conversationId } = req.params;

  const result = await ChatService.getMessages(conversationId, req.user.id);

  res.status(200).json({
    success: true,
    data: result,
  });
};

const sendMessage = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { text } = req.body;

  const result = await ChatService.sendMessages(
    conversationId,
    text,
    req.user.id,
  );
  io.emit("message", result);
  res.status(201).json({
    success: true,
    data: result,
  });
};

export const ChatController = {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
};
