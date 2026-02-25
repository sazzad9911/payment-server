"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteValidation = void 0;
const zod_1 = require("zod");
const createSiteZodSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Site name must be at least 2 characters")
        .max(100, "Site name too long"),
    call_back_url: zod_1.z.string().url("Invalid callback URL"),
    logo_url: zod_1.z.string().url("Invalid logo URL"),
    password: zod_1.z.string().min(8),
});
exports.SiteValidation = {
    createSiteZodSchema,
};
