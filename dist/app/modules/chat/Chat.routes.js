"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoutes = void 0;
const express_1 = __importDefault(require("express"));
const Chat_controller_1 = require("./Chat.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.get("/conversation", (0, auth_1.default)(), Chat_controller_1.ChatController.startConversation);
router.get("/conversations", (0, auth_1.default)("ADMIN"), Chat_controller_1.ChatController.getConversations);
router.get("/messages/:conversationId", (0, auth_1.default)(), Chat_controller_1.ChatController.getMessages);
router.post("/messages/:conversationId", (0, auth_1.default)(), Chat_controller_1.ChatController.sendMessage);
exports.ChatRoutes = router;
