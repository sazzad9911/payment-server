import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long"),
  message: z
    .string()
    .min(5, "Message must be at least 5 characters")
    .max(2000, "Message is too long"),
});
export type ContactInput = z.infer<typeof contactSchema>;
const merchantSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name is too long"),
  phone: z
    .string()
    .regex(/^(?:\+8801|01)[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),
  email: z.string().email("Invalid email address"),
  web_link: z.string().url("Invalid website link"),
  trade_url: z.string().url("Invalid trade license URL").optional().nullable(),
  tin_url: z.string().url("Invalid TIN URL").optional().nullable(),
  nid_url: z.string().url("Invalid NID URL").optional().nullable(),
  image_url: z.string().url("Invalid image URL").optional().nullable(),
  note: z.string().max(1000, "Note is too long").optional().nullable(),
});
export const ContactValidation = {
  contactSchema,
  merchantSchema,
};
