"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RechargeSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const rechargeSchema = zod_1.default.object({
    amount: zod_1.default.number().optional(),
    network_type: zod_1.default.enum([
        "GRAMEENPHONE",
        "ROBI",
        "AIRTEL",
        "BANGLALINK",
        "TELETALK",
        "SKITTO",
    ]),
    sim_type: zod_1.default.enum(["PRE_PAID", "POST_PAID"]),
    offerId: zod_1.default.string().uuid().optional(),
    phone: zod_1.default.string().length(11, "Invalid phone number"),
});
const rechargeOfferSchema = zod_1.default.object({
    network_type: zod_1.default.enum([
        "GRAMEENPHONE",
        "ROBI",
        "AIRTEL",
        "BANGLALINK",
        "TELETALK",
        "SKITTO",
    ]),
    sim_type: zod_1.default.enum(["PRE_PAID", "POST_PAID"]),
    type: zod_1.default.enum(["INTERNET", "MINUTE", "BUNDLE", "CALL_RATE"]),
    cash_back: zod_1.default.number().optional().default(0),
    offerId: zod_1.default.string().uuid().optional(),
    name: zod_1.default.string().max(100),
    validity: zod_1.default.string().max(50),
    price: zod_1.default.number(),
    auto: zod_1.default.boolean().optional().default(true),
    ussd: zod_1.default.string().optional(),
});
exports.RechargeSchema = {
    rechargeSchema,
    rechargeOfferSchema,
};
