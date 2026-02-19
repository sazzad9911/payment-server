import z from "zod";

const rechargeSchema = z.object({
  amount: z.number().optional(),
  network_type: z.enum([
    "GRAMEENPHONE",
    "ROBI",
    "AIRTEL",
    "BANGLALINK",
    "TELETALK",
    "SKITTO",
  ]),
  sim_type: z.enum(["PRE_PAID", "POST_PAID"]),
  offerId: z.string().uuid().optional(),
  phone: z.string().length(11, "Invalid phone number"),
});
const rechargeOfferSchema = z.object({
  network_type: z.enum([
    "GRAMEENPHONE",
    "ROBI",
    "AIRTEL",
    "BANGLALINK",
    "TELETALK",
    "SKITTO",
  ]),
  sim_type: z.enum(["PRE_PAID", "POST_PAID"]),
  type: z.enum(["INTERNET", "MINUTE", "BUNDLE", "CALL_RATE"]),
  cash_back: z.number().optional().default(0),
  offerId: z.string().uuid().optional(),
  name: z.string().max(100),
  validity: z.string().max(50),
  price: z.number(),
  auto: z.boolean().optional().default(true),
  ussd: z.string().optional(),
});
export type rechargeType = z.infer<typeof rechargeSchema>;
export type rechargeOfferType = z.infer<typeof rechargeOfferSchema>;
export const RechargeSchema = {
  rechargeSchema,
  rechargeOfferSchema,
};
