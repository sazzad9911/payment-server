"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceValidation = exports.BankEnum = exports.CreditStatusEnum = void 0;
const zod_1 = require("zod");
exports.CreditStatusEnum = zod_1.z.enum(["PENDING", "APPROVED", "REJECTED"]);
exports.BankEnum = zod_1.z.enum(["BKASH", "NAGAD", "ROCKET", "UPAY"]);
const createCreditSchema = zod_1.z.object({
    bank_name: exports.BankEnum,
    account_number: zod_1.z
        .string()
        .min(10, "Account number is too short")
        .max(12, "Account number is too long"),
    amount: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
    transaction_id: zod_1.z.string().min(6).max(100).optional(),
    online_pay: zod_1.z.boolean().optional(),
    password: zod_1.z.string(),
});
const updateCreditStatusSchema = zod_1.z.object({
    status: exports.CreditStatusEnum,
});
const createAccountNumberSchema = zod_1.z.object({
    bank_name: exports.BankEnum,
    account_number: zod_1.z
        .string()
        .min(10, "Account number is too short")
        .max(12, "Account number is too long"),
    account_type: zod_1.z
        .enum(["SEND_MONEY", "CASH_OUT", "PAYMENT"])
        .default("SEND_MONEY"),
});
const onlinePayConfigSchema = zod_1.z.object({
    bank_name: exports.BankEnum,
    base_url: zod_1.z.string().url("Base URL must be a valid URL"),
    username: zod_1.z.string().min(1, "Username is required"),
    password: zod_1.z.string().min(1, "Password is required"),
    key: zod_1.z.string().min(1, "Key is required"),
    secret: zod_1.z.string().min(1, "Secret is required"),
    call_back_url: zod_1.z.string().url("Callback URL must be a valid URL"),
});
const CreateDebitSchema = zod_1.z.object({
    bank_name: exports.BankEnum,
    account_number: zod_1.z.string().min(10, "Account number is required").max(12),
    amount: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
});
const UpdateDebitSchema = zod_1.z.object({
    transaction_id: zod_1.z.string(),
});
exports.BalanceValidation = {
    updateCreditStatusSchema,
    createCreditSchema,
    createAccountNumberSchema,
    onlinePayConfigSchema,
    CreateDebitSchema,
    UpdateDebitSchema,
};
