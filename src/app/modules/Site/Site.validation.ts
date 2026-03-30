import { z } from "zod";

const createSiteZodSchema = z.object({
  name: z
    .string()
    .min(2, "Site name must be at least 2 characters")
    .max(100, "Site name too long"),
  call_back_url: z.string().url("Invalid callback URL"),
  logo_url: z.string().url("Invalid logo URL"),
  password: z.string().min(8),
});

const createWithdrawSchema = z.object({
  type: z.enum(["SEND_MONEY", "CASH_OUT", "PAYMENT"]),
  bank: z.enum(["BKASH", "NAGAD", "ROCKET", "UPAY"]),
  amount: z.number(),
  accNo: z.string(),
  call_back_url: z.string().url(),
  password: z.string().min(6),
  name: z.string().min(2),
});
export type CreateWithdrawType = z.infer<typeof createWithdrawSchema>;
export const SiteValidation = {
  createSiteZodSchema,
  createWithdrawSchema,
};
