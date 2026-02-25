"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteService = void 0;
const generateFileUrl_1 = require("../../../helpars/generateFileUrl");
const Site_validation_1 = require("./Site.validation");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createSite = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const file = req.file;
    if (!file) {
        throw new Error("Logo file is required");
    }
    const logoUrl = (0, generateFileUrl_1.generateFileUrl)(req, file.path);
    const payload = Object.assign(Object.assign({}, body), { logo_url: logoUrl });
    const data = yield Site_validation_1.SiteValidation.createSiteZodSchema.parseAsync(payload);
    const result = yield prisma_1.default.sites.create({
        data,
    });
    return result;
});
const updateSite = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const body = req.body;
    const file = req.file;
    // If a new logo is uploaded, use it; otherwise keep current logo_url if provided/unchanged
    const payload = Object.assign(Object.assign({}, body), (file ? { logo_url: (0, generateFileUrl_1.generateFileUrl)(req, file.path) } : {}));
    const data = yield Site_validation_1.SiteValidation.createSiteZodSchema
        .partial()
        .parseAsync(payload);
    // Optional: ensure site exists first (nice error message)
    const existing = yield prisma_1.default.sites.findUnique({ where: { id } });
    if (!existing) {
        throw new Error("Site not found");
    }
    const result = yield prisma_1.default.sites.update({
        where: { id },
        data,
    });
    return result;
});
const deleteSite = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const existing = yield prisma_1.default.sites.findUnique({ where: { id } });
    if (!existing) {
        throw new Error("Site not found");
    }
    const result = yield prisma_1.default.sites.delete({
        where: { id },
    });
    return result;
});
const getAllSites = (req) => __awaiter(void 0, void 0, void 0, function* () {
    // query params: ?searchTerm=abc&page=1&limit=10&status=ACTIVE
    const searchTerm = req.query.searchTerm || "";
    const status = req.query.status || undefined;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: [{ name: { contains: searchTerm } }],
        });
    }
    if (status) {
        andConditions.push({ status });
    }
    const where = andConditions.length ? { AND: andConditions } : {};
    const [data, total] = yield Promise.all([
        prisma_1.default.sites.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.sites.count({ where }),
    ]);
    const meta = {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
    };
    return { meta, data };
});
const toggleSiteStatus = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const site = yield prisma_1.default.sites.findUnique({
        where: { id },
        select: { id: true, status: true },
    });
    if (!site) {
        throw new Error("Site not found");
    }
    // Toggle only ACTIVE <-> BLOCKED
    const nextStatus = site.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const result = yield prisma_1.default.sites.update({
        where: { id },
        data: { status: nextStatus },
    });
    return result;
});
exports.SiteService = {
    createSite,
    getAllSites,
    updateSite,
    deleteSite,
    toggleSiteStatus,
};
