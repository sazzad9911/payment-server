import { z } from "zod";

const createContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address").optional(),
  phone: z
    .string()
    .min(10, "Phone number is too short")
    .max(15, "Phone number is too long"),
  message: z
    .string()
    .min(5, "Message is too short")
    .max(1000, "Message is too long"),
});
export const SystemValidation = {
  createContactSchema,
};
export type ContactType = z.infer<typeof createContactSchema>;
