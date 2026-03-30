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
exports.SiteService = exports.generateTranxId = void 0;
const generateFileUrl_1 = require("../../../helpars/generateFileUrl");
const Site_validation_1 = require("./Site.validation");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const generateTranxId = () => {
    return ("TRX-" +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 5)).toUpperCase();
};
exports.generateTranxId = generateTranxId;
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
const getDashboardInfo = () => __awaiter(void 0, void 0, void 0, function* () {
    const payments = yield prisma_1.default.payment_list.findMany({
        select: {
            amount: true,
            status: true,
        },
    });
    const totalRequestedBalance = payments.reduce((s, d) => s + d.amount, 0);
    const totalSuccessBalance = payments
        .filter((d) => d.status === "SUCCESS")
        .reduce((s, d) => s + d.amount, 0);
    const totalFailedBalance = payments
        .filter((d) => d.status === "FAILED")
        .reduce((s, d) => s + d.amount, 0);
    const sites = yield prisma_1.default.sites.findMany({
        select: { status: true, name: true, balance: true },
    });
    const activeSite = sites.filter((d) => d.status === "ACTIVE").length;
    const deactiveSite = sites.filter((d) => d.status === "BLOCKED").length;
    const totalSite = sites.length;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const paymentsToday = yield prisma_1.default.payment_list.findMany({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });
    const todayPendingAmount = paymentsToday
        .filter((d) => d.status === "PENDING")
        .reduce((s, d) => s + d.amount, 0);
    const todayTransaction = paymentsToday.length;
    const todayFailedTransaction = paymentsToday.filter((d) => d.status === "FAILED").length;
    const totalSiteBalance = sites.reduce((s, d) => s + d.balance, 0);
    return {
        totalRequestedBalance,
        totalSuccessBalance,
        totalFailedBalance,
        totalSite,
        activeSite,
        deactiveSite,
        todayPendingAmount,
        todayTransaction,
        todayFailedTransaction,
        paymentsToday,
        totalSiteBalance,
    };
});
const createWithdraw = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const site = yield tx.sites.findFirst({
            where: {
                call_back_url: payload.call_back_url,
                name: payload.name,
                password: payload.password,
            },
        });
        if (!site)
            throw new ApiErrors_1.default(404, "Site not found!");
        if (site.balance < payload.amount)
            throw new ApiErrors_1.default(400, "Low balance!");
        // decrement balance first
        yield tx.sites.update({
            where: { id: site.id },
            data: {
                balance: {
                    decrement: payload.amount,
                },
            },
        });
        // create withdraw
        const result = yield tx.withdraw.create({
            data: {
                accNo: payload.accNo,
                amount: payload.amount,
                bank: payload.bank,
                tranxId: (0, exports.generateTranxId)(),
                type: payload.type,
                siteId: site.id,
            },
        });
        return result;
    }));
});
const getAllWithdraws = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const where = {};
    if (query.search) {
        where.tranxId = {
            contains: query.search,
        };
    }
    if (query.status) {
        where.status = query.status;
    }
    const [data, total] = yield Promise.all([
        prisma_1.default.withdraw.findMany({
            where,
            include: {
                site: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        }),
        prisma_1.default.withdraw.count({ where }),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
        data,
    };
});
const acceptWithdraw = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const withdraw = yield tx.withdraw.findUnique({
            where: { id },
        });
        if (!withdraw)
            throw new ApiErrors_1.default(404, "Withdraw not found");
        if (withdraw.status !== "PENDING")
            throw new ApiErrors_1.default(400, "Already processed");
        const site = yield tx.sites.findUnique({
            where: { id: withdraw.siteId },
        });
        if (!site)
            throw new ApiErrors_1.default(404, "Site not found");
        if (site.balance < withdraw.amount)
            throw new ApiErrors_1.default(400, "Insufficient balance");
        // update withdraw status
        const result = yield tx.withdraw.update({
            where: { id },
            data: {
                status: "ACCEPTED",
            },
        });
        return result;
    }));
});
const cancelWithdraw = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const withdraw = yield tx.withdraw.findUnique({
            where: { id },
        });
        if (!withdraw)
            throw new ApiErrors_1.default(404, "Withdraw not found");
        if (withdraw.status !== "PENDING")
            throw new ApiErrors_1.default(400, "Already processed");
        const site = yield tx.sites.findUnique({
            where: { id: withdraw.siteId },
        });
        if (!site)
            throw new ApiErrors_1.default(404, "Site not found");
        // increment balance back
        yield tx.sites.update({
            where: { id: site.id },
            data: {
                balance: {
                    increment: withdraw.amount,
                },
            },
        });
        const result = yield tx.withdraw.update({
            where: { id },
            data: {
                status: "CANCELLED",
            },
        });
        return result;
    }));
});
exports.SiteService = {
    createSite,
    getAllSites,
    updateSite,
    deleteSite,
    toggleSiteStatus,
    getDashboardInfo,
    createWithdraw,
    getAllWithdraws,
    acceptWithdraw,
    cancelWithdraw,
};
