import z from "zod";
/**
 * Product Zod Schema
 */
import { units } from "../../data/unit";
// extract codes
const unitCodes = units.map((u) => u.code) as [string, ...string[]];
const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  unit: z.enum(unitCodes),
  stock: z.coerce.number().int().min(0).default(1),
  isStock: z.coerce.boolean().default(true),
  price: z.coerce.number().positive("Price must be greater than 0"),
  images: z.array(z.string()).default([]),
  note: z.string().optional(),
  tax: z.coerce.number().min(0).default(0),
  userId: z.string().uuid(),
});
const CustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")), // allow empty string from form-data
  phone: z
    .string()
    .min(6, "Phone number is too short")
    .max(20, "Phone number is too long"),
  address: z.string().min(1, "Address is required"),
});
const SaleItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});
const SalesSchema = z.object({
  customerId: z.string().uuid({
    message: "Invalid customer ID",
  }),
  //subtotal: z.coerce.number().min(0, "Subtotal must be >= 0"),
  discount: z.number().min(0).default(0),
  //tax: z.coerce.number().min(0).default(0),
  //total: z.coerce.number().min(0, "Total must be >= 0"),
  paid: z.coerce.number(),
  due: z.coerce.number(),
  subtotal: z.coerce
    .number()
    .min(0, "Subtotal amount must be >= 0")
    .optional()
    .default(0),
  tax: z.coerce
    .number()
    .min(0, "Tax amount must be >= 0")
    .optional()
    .default(0),
  products: z.array(SaleItemSchema),
});
const SaleUpdateSchema = z.object({
  paid: z.coerce.number().min(0, "Paid amount must be >= 0"),
  due: z.coerce.number().min(0, "Due amount must be >= 0"),
});
export const ProductValidation = {
  ProductSchema,
  CustomerSchema,
  SalesSchema,
  SaleItemSchema,
  SaleUpdateSchema,
};
export type SaleUpdateType = z.infer<typeof SaleUpdateSchema>;
export type SaleType = z.infer<typeof SalesSchema>;
export type ProductType = z.infer<typeof ProductSchema>;
export type CustomerType = z.infer<typeof CustomerSchema>;
