import { z } from "zod";

const createPaymentSchema = z.object({
  call_back_url: z.string().url(),
  password: z.string().min(6),
  name: z.string().min(2),
  amount: z.number().positive().min(10).int(),
  type: z.enum(["SEND_MONEY", "CASH_OUT", "PAYMENT"]),
  bank: z.enum(["BKASH", "NAGAD", "ROCKET", "UPAY"]),
});
export type CreatePaymentType = z.infer<typeof createPaymentSchema>;

export const PaymentValidation = {
  createPaymentSchema,
};
