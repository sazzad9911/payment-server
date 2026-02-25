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

export const SiteValidation = {
  createSiteZodSchema,
};
