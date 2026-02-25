"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillValidation = void 0;
const zod_1 = require("zod");
const BillCategorySchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    icon: zod_1.z.string().min(1, "Icon is required"),
});
const BillerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Biller name is required"),
    categoryId: zod_1.z.string().uuid(),
    icon: zod_1.z.string().min(1, "Icon is required"),
});
const BillHistorySchema = zod_1.z.object({
    billerId: zod_1.z.string().uuid(),
    meter_no: zod_1.z.string().optional().nullable(),
    contact_no: zod_1.z.string().optional().nullable(),
    sms_account_no: zod_1.z.string().optional().nullable(),
    subscription_id: zod_1.z.string().optional().nullable(),
    amount: zod_1.z.number().positive("Amount must be greater than 0"),
});
exports.BillValidation = {
    BillCategorySchema,
    BillerSchema,
    BillHistorySchema,
};
