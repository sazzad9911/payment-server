import { z } from "zod";

const BillCategorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  icon: z.string().min(1, "Icon is required"),
});

const BillerSchema = z.object({
  name: z.string().min(1, "Biller name is required"),
  categoryId: z.string().uuid(),
  icon: z.string().min(1, "Icon is required"),
});
const BillHistorySchema = z.object({
  billerId: z.string().uuid(),
  meter_no: z.string().optional().nullable(),
  contact_no: z.string().optional().nullable(),
  sms_account_no: z.string().optional().nullable(),
  subscription_id: z.string().optional().nullable(),
  amount: z.number().positive("Amount must be greater than 0"),
});
export type BillCategoryType = z.infer<typeof BillCategorySchema>;
export type BillerType = z.infer<typeof BillerSchema>;
export type BillHistoryType = z.infer<typeof BillHistorySchema>;
export const BillValidation = {
  BillCategorySchema,
  BillerSchema,
  BillHistorySchema,
};
