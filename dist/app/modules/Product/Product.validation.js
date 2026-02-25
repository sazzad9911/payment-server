"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductValidation = void 0;
const zod_1 = __importDefault(require("zod"));
/**
 * Product Zod Schema
 */
const unit_1 = require("../../data/unit");
// extract codes
const unitCodes = unit_1.units.map((u) => u.code);
const ProductSchema = zod_1.default.object({
    name: zod_1.default.string().min(1, "Product name is required"),
    unit: zod_1.default.enum(unitCodes),
    stock: zod_1.default.coerce.number().int().min(0).default(1),
    isStock: zod_1.default.coerce.boolean().default(true),
    price: zod_1.default.coerce.number().positive("Price must be greater than 0"),
    images: zod_1.default.array(zod_1.default.string()).default([]),
    note: zod_1.default.string().optional(),
    tax: zod_1.default.coerce.number().min(0).default(0),
    userId: zod_1.default.string().uuid(),
});
const CustomerSchema = zod_1.default.object({
    name: zod_1.default.string().min(1, "Customer name is required"),
    email: zod_1.default.string().email("Invalid email address").optional().or(zod_1.default.literal("")), // allow empty string from form-data
    phone: zod_1.default
        .string()
        .min(6, "Phone number is too short")
        .max(20, "Phone number is too long"),
    address: zod_1.default.string().min(1, "Address is required"),
});
const SaleItemSchema = zod_1.default.object({
    productId: zod_1.default.string().uuid(),
    quantity: zod_1.default.number().int().min(1, "Quantity must be at least 1"),
});
const SalesSchema = zod_1.default.object({
    customerId: zod_1.default.string().uuid({
        message: "Invalid customer ID",
    }),
    //subtotal: z.coerce.number().min(0, "Subtotal must be >= 0"),
    discount: zod_1.default.number().min(0).default(0),
    //tax: z.coerce.number().min(0).default(0),
    //total: z.coerce.number().min(0, "Total must be >= 0"),
    paid: zod_1.default.coerce.number(),
    due: zod_1.default.coerce.number(),
    subtotal: zod_1.default.coerce
        .number()
        .min(0, "Subtotal amount must be >= 0")
        .optional()
        .default(0),
    tax: zod_1.default.coerce
        .number()
        .min(0, "Tax amount must be >= 0")
        .optional()
        .default(0),
    products: zod_1.default.array(SaleItemSchema),
});
const SaleUpdateSchema = zod_1.default.object({
    paid: zod_1.default.coerce.number().min(0, "Paid amount must be >= 0"),
    due: zod_1.default.coerce.number().min(0, "Due amount must be >= 0"),
});
exports.ProductValidation = {
    ProductSchema,
    CustomerSchema,
    SalesSchema,
    SaleItemSchema,
    SaleUpdateSchema,
};
