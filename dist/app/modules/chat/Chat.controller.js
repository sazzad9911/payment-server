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
exports.ChatController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const Chat_service_1 = require("./Chat.service");
const socket_1 = require("../../../socket");
const startConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Chat_service_1.ChatService.startConversation({
        senderId: req.user.id,
    });
    res.status(http_status_1.default.OK).json({
        success: true,
        data: result,
    });
});
const getConversations = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Chat_service_1.ChatService.getConversations();
    res.status(200).json({ success: true, data: result });
});
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const result = yield Chat_service_1.ChatService.getMessages(conversationId, req.user.id);
    res.status(200).json({
        success: true,
        data: result,
    });
});
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const { text } = req.body;
    const result = yield Chat_service_1.ChatService.sendMessages(conversationId, text, req.user.id);
    socket_1.io.emit("message", result);
    res.status(201).json({
        success: true,
        data: result,
    });
});
exports.ChatController = {
    startConversation,
    getConversations,
    getMessages,
    sendMessage,
};
