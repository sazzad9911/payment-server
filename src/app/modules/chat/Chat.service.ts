import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { io } from "../../../socket";
import { CreateConversationType } from "./Chat.validation";

const startConversation = async (payload: CreateConversationType) => {
  const result = await prisma.conversations.upsert({
    where: { senderId: payload.senderId },
    create: {
      senderId: payload.senderId,
    },
    update: {
      senderId: payload.senderId,
    },
  });
  return result;
};
const getConversations = async () => {
  const result = await prisma.conversations.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sender: {
        select: {
          name: true,
          phone: true,
          email: true,
          address: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              read: false,
              sender: true,
            },
          },
        },
      },
    },
  });
  return result;
};
const getMessages = async (conversationId: string, userId: string) => {
  const messages = await prisma.messages.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: {
      conversation: {
        select: {
          senderId: true,
        },
      },
    },
  });
  const isSender = messages?.[0]?.conversation?.senderId === userId;

  await prisma.messages.updateMany({
    where: {
      conversationId,
      sender: !isSender,
      read: false,
    },
    data: { read: true },
  });

  return messages;
};

const sendMessages = async (
  conversationId: string,
  text: string,
  userId: string,
) => {
  if (!text) throw new ApiError(404, "Message is required!");
  const conversation = await prisma.conversations.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) throw new ApiError(404, "Conversation not found!");
  const result = await prisma.messages.create({
    data: {
      text,
      conversationId,
      sender: conversation.senderId == userId,
      read: false,
    },
  });
  io.emit("message", result);
  return result;
};

export const ChatService = {
  sendMessages,
  getMessages,
  getConversations,
  startConversation,
};
