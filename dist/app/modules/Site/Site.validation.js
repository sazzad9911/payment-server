"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteValidation = void 0;
const zod_1 = require("zod");
const createSiteZodSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Site name must be at least 2 characters")
        .max(100, "Site name too long"),
    call_back_url: zod_1.z.string().url("Invalid callback URL"),
    logo_url: zod_1.z.string().url("Invalid logo URL"),
    password: zod_1.z.string().min(8),
});
const createWithdrawSchema = zod_1.z.object({
    type: zod_1.z.enum(["SEND_MONEY", "CASH_OUT", "PAYMENT"]),
    bank: zod_1.z.enum(["BKASH", "NAGAD", "ROCKET", "UPAY"]),
    amount: zod_1.z.number(),
    accNo: zod_1.z.string(),
    call_back_url: zod_1.z.string().url(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(2),
});
exports.SiteValidation = {
    createSiteZodSchema,
    createWithdrawSchema,
};
