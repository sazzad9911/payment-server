"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const UserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    nid: zod_1.z.string().min(5, "NID is required"),
    email: zod_1.z.string().email("Invalid email").optional().nullable(),
    occupation: zod_1.z.string().min(1, "Occupation is required"),
    income: zod_1.z.number().min(0, "Income must be >= 0").default(0),
    division: zod_1.z.string().min(1, "Division is required"),
    address: zod_1.z.string().min(1, "Address is required"),
    referralCode: zod_1.z.string().optional().nullable(),
});
const BalanceShema = zod_1.z.object({
    amount: zod_1.z.number().min(0),
});
const UpdateUserSchema = UserSchema.partial();
exports.UserValidation = {
    UserSchema,
    UpdateUserSchema,
    BalanceShema,
};
