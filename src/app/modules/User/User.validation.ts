import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nid: z.string().min(5, "NID is required"),
  email: z.string().email("Invalid email").optional().nullable(),
  occupation: z.string().min(1, "Occupation is required"),
  income: z.number().min(0, "Income must be >= 0").default(0),
  division: z.string().min(1, "Division is required"),
  address: z.string().min(1, "Address is required"),
  referralCode: z.string().optional().nullable(),
});
const BalanceShema = z.object({
  amount: z.number().min(0),
});
const UpdateUserSchema = UserSchema.partial();
export const UserValidation = {
  UserSchema,
  UpdateUserSchema,
  BalanceShema,
};
export type UpdateUserType = z.infer<typeof UpdateUserSchema>;
