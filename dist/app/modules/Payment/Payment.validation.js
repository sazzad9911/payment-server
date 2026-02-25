"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidation = void 0;
const zod_1 = require("zod");
const createPaymentSchema = zod_1.z.object({
    call_back_url: zod_1.z.string().url(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(2),
    amount: zod_1.z.number().positive().min(10).int(),
    type: zod_1.z.enum(["SEND_MONEY", "CASH_OUT", "PAYMENT"]),
    bank: zod_1.z.enum(["BKASH", "NAGAD", "ROCKET", "UPAY"]),
});
exports.PaymentValidation = {
    createPaymentSchema,
};
