"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactValidation = void 0;
const zod_1 = require("zod");
const contactSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z
        .string()
        .min(7, "Phone number is too short")
        .max(20, "Phone number is too long"),
    message: zod_1.z
        .string()
        .min(5, "Message must be at least 5 characters")
        .max(2000, "Message is too long"),
});
const merchantSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(150, "Name is too long"),
    phone: zod_1.z
        .string()
        .regex(/^(?:\+8801|01)[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),
    email: zod_1.z.string().email("Invalid email address"),
    web_link: zod_1.z.string().url("Invalid website link"),
    trade_url: zod_1.z.string().url("Invalid trade license URL").optional().nullable(),
    tin_url: zod_1.z.string().url("Invalid TIN URL").optional().nullable(),
    nid_url: zod_1.z.string().url("Invalid NID URL").optional().nullable(),
    image_url: zod_1.z.string().url("Invalid image URL").optional().nullable(),
    note: zod_1.z.string().max(1000, "Note is too long").optional().nullable(),
});
exports.ContactValidation = {
    contactSchema,
    merchantSchema,
};
