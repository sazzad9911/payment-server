import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  nid: z.string().min(5, "NID is required"),
  email: z.string().email("Invalid email").optional().nullable(),
  occupation: z.string().min(1, "Occupation is required"),
  income: z.number().min(0, "Income must be >= 0").default(0),
  division: z.string().min(1, "Division is required"),
  address: z.string().min(1, "Address is required"),
  referralCode: z.string().optional().nullable(),
  otpId: z.string().uuid(),
});
export type RegisterType = z.infer<typeof RegisterSchema>;

const otpSchema = z.object({
  phone: z.string().length(11, "Invalid phone"),
});
export const verifyOtpSchema = z.object({
  phone: z.string().length(11, "Invalid phone"),
  otp: z.string().length(6),
});
export type verifyOtpType = z.infer<typeof verifyOtpSchema>;
export type otpType = z.infer<typeof otpSchema>;

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

const loginSchema = z.object({
  phone: z.string().length(11, "Invalid phone number"),
  password: z.string().min(4, "Password must be at least 4 characters long"),
});
const visibilitySchema = z.object({
  visibility: z.enum(["PUBLIC", "PRIVATE", "MEMBERS_ONLY"]),
});
const forgetPasswordSchema = z.object({
  otpId: z.string().uuid(),
  password: z.string().min(6, "Pin must be at least 6 characters"),
});
const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
const updateTokenSchema = z.object({
  token: z.string(),
});
export const authValidation = {
  RegisterSchema,
  changePasswordSchema,
  loginSchema,
  visibilitySchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  otpSchema,
  updateTokenSchema,
};
