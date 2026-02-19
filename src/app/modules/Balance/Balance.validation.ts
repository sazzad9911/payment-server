import { z } from "zod";
export const CreditStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export const BankEnum = z.enum(["BKASH", "NAGAD", "ROCKET", "UPAY"]);
const createCreditSchema = z.object({
  bank_name: BankEnum,
  account_number: z
    .string()
    .min(10, "Account number is too short")
    .max(12, "Account number is too long"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  transaction_id: z.string().min(6).max(100).optional(),
  online_pay: z.boolean().optional(),
  password: z.string(),
});
const updateCreditStatusSchema = z.object({
  status: CreditStatusEnum,
});
const createAccountNumberSchema = z.object({
  bank_name: BankEnum,
  account_number: z
    .string()
    .min(10, "Account number is too short")
    .max(12, "Account number is too long"),
  account_type: z
    .enum(["SEND_MONEY", "CASH_OUT", "PAYMENT"])
    .default("SEND_MONEY"),
});
const onlinePayConfigSchema = z.object({
  bank_name: BankEnum,
  base_url: z.string().url("Base URL must be a valid URL"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  key: z.string().min(1, "Key is required"),
  secret: z.string().min(1, "Secret is required"),
  call_back_url: z.string().url("Callback URL must be a valid URL"),
});
const CreateDebitSchema = z.object({
  bank_name: BankEnum,
  account_number: z.string().min(10, "Account number is required").max(12),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
});
const UpdateDebitSchema = z.object({
  transaction_id: z.string(),
});
export const BalanceValidation = {
  updateCreditStatusSchema,
  createCreditSchema,
  createAccountNumberSchema,
  onlinePayConfigSchema,
  CreateDebitSchema,
  UpdateDebitSchema,
};
export type CreateCreditType = z.infer<typeof createCreditSchema>;
export type UpdateCreditType = z.infer<typeof updateCreditStatusSchema>;
export type CreateAccountNumberType = z.infer<typeof createAccountNumberSchema>;
export type CreditListQuery = {
  page?: number;
  limit?: number;
  transactionId?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  userId?: string;
};
export type OnlinePayConfigTypes = z.infer<typeof onlinePayConfigSchema>;
export type BankEnumType = z.infer<typeof BankEnum>;
export type CreateDebitType = z.infer<typeof CreateDebitSchema>;
export type UpdateDebitType = z.infer<typeof UpdateDebitSchema>;
