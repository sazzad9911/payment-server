"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageValidation = void 0;
const zod_1 = require("zod");
const packageSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Package name must be at least 2 characters")
        .max(100, "Package name is too long"),
    details: zod_1.z
        .string()
        .min(5, "Details must be at least 5 characters")
        .max(1000, "Details is too long"),
    product_limit: zod_1.z
        .number()
        .int("Product limit must be an integer")
        .positive("Product limit must be greater than 0"),
    recharge_commission: zod_1.z
        .number()
        .positive("recharge_commission must be greater than 0"),
    price: zod_1.z.number().positive("Price must be greater than 0"),
    cashout_charge: zod_1.z.number().positive("cashout_charge must be greater than 0"),
    isYearly: zod_1.z.boolean().default(false),
});
const settingsSchema = zod_1.z.object({
    free_product_limit: zod_1.z.number().min(0),
    recharge_commission: zod_1.z.number().min(0).default(0),
    cashout_charge: zod_1.z.number().min(0).default(14),
});
const updatePackageSchema = packageSchema.partial();
exports.PackageValidation = {
    packageSchema,
    updatePackageSchema,
    settingsSchema,
};
