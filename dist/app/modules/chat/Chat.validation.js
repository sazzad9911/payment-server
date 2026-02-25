"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatValidation = void 0;
const zod_1 = require("zod");
const CreateConversationSchema = zod_1.z.object({
    senderId: zod_1.z
        .string({
        required_error: "Sender ID is required",
    })
        .uuid("Invalid sender ID"),
});
exports.ChatValidation = {
    CreateConversationSchema,
};
