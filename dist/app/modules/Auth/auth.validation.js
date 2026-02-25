"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = exports.verifyOtpSchema = void 0;
const zod_1 = require("zod");
const RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    otpId: zod_1.z.string().uuid(),
});
const otpSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
});
exports.verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    otp: zod_1.z.string().length(6),
});
const changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(6),
    newPassword: zod_1.z.string().min(6),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    password: zod_1.z.string().min(4, "Password must be at least 4 characters long"),
});
const visibilitySchema = zod_1.z.object({
    visibility: zod_1.z.enum(["PUBLIC", "PRIVATE", "MEMBERS_ONLY"]),
});
const forgetPasswordSchema = zod_1.z.object({
    otpId: zod_1.z.string().uuid(),
    password: zod_1.z.string().min(6, "Pin must be at least 6 characters"),
});
const resetPasswordSchema = zod_1.z.object({
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
});
const updateTokenSchema = zod_1.z.object({
    token: zod_1.z.string(),
});
exports.authValidation = {
    RegisterSchema,
    changePasswordSchema,
    loginSchema,
    visibilitySchema,
    forgetPasswordSchema,
    resetPasswordSchema,
    otpSchema,
    updateTokenSchema,
};
