"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const socket_1 = require("../../../socket");
const startConversation = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.conversations.upsert({
        where: { senderId: payload.senderId },
        create: {
            senderId: payload.senderId,
        },
        update: {
            senderId: payload.senderId,
        },
    });
    return result;
});
const getConversations = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.conversations.findMany({
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
});
const getMessages = (conversationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const messages = yield prisma_1.default.messages.findMany({
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
    const isSender = ((_b = (_a = messages === null || messages === void 0 ? void 0 : messages[0]) === null || _a === void 0 ? void 0 : _a.conversation) === null || _b === void 0 ? void 0 : _b.senderId) === userId;
    yield prisma_1.default.messages.updateMany({
        where: {
            conversationId,
            sender: !isSender,
            read: false,
        },
        data: { read: true },
    });
    return messages;
});
const sendMessages = (conversationId, text, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!text)
        throw new ApiErrors_1.default(404, "Message is required!");
    const conversation = yield prisma_1.default.conversations.findUnique({
        where: { id: conversationId },
    });
    if (!conversation)
        throw new ApiErrors_1.default(404, "Conversation not found!");
    const result = yield prisma_1.default.messages.create({
        data: {
            text,
            conversationId,
            sender: conversation.senderId == userId,
            read: false,
        },
    });
    socket_1.io.emit("message", result);
    return result;
});
exports.ChatService = {
    sendMessages,
    getMessages,
    getConversations,
    startConversation,
};
