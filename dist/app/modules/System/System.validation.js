"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemValidation = void 0;
const zod_1 = require("zod");
const createContactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: zod_1.z.string().email("Invalid email address").optional(),
    phone: zod_1.z
        .string()
        .min(10, "Phone number is too short")
        .max(15, "Phone number is too long"),
    message: zod_1.z
        .string()
        .min(5, "Message is too short")
        .max(1000, "Message is too long"),
});
exports.SystemValidation = {
    createContactSchema,
};
