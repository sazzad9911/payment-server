import { z } from "zod";
const packageSchema = z.object({
  name: z
    .string()
    .min(2, "Package name must be at least 2 characters")
    .max(100, "Package name is too long"),
  details: z
    .string()
    .min(5, "Details must be at least 5 characters")
    .max(1000, "Details is too long"),
  product_limit: z
    .number()
    .int("Product limit must be an integer")
    .positive("Product limit must be greater than 0"),
  recharge_commission: z
    .number()
    .positive("recharge_commission must be greater than 0"),
  price: z.number().positive("Price must be greater than 0"),
  cashout_charge: z.number().positive("cashout_charge must be greater than 0"),
  isYearly: z.boolean().default(false),
});
const settingsSchema = z.object({
  free_product_limit: z.number().min(0),
  recharge_commission: z.number().min(0).default(0),
  cashout_charge: z.number().min(0).default(14),
});
const updatePackageSchema = packageSchema.partial();
export const PackageValidation = {
  packageSchema,
  updatePackageSchema,
  settingsSchema,
};
export type PackageType = z.infer<typeof packageSchema>;
export type UpdatePackageType = z.infer<typeof updatePackageSchema>;
export type SettingType = z.infer<typeof settingsSchema>;
