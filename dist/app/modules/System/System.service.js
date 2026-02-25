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
exports.SystemService = exports.userOverview = void 0;
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const generateFileUrl_1 = require("../../../helpars/generateFileUrl");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const network_list = [
    "GRAMEENPHONE",
    "ROBI",
    "AIRTEL",
    "BANGLALINK",
    "TELETALK",
    "SKITTO",
];
const getSimInfos = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.sim_client.findMany({
        orderBy: {
            updatedAt: "desc",
        },
    });
    return result;
});
const updateUssdCode = (code, id) => __awaiter(void 0, void 0, void 0, function* () {
    const sim = yield prisma_1.default.sim_client.findUnique({ where: { id } });
    if (!sim)
        throw new ApiErrors_1.default(404, "Sim not found!");
    const isPhone = code.includes("phone");
    const isAmount = code.includes("amount");
    const isType = code.includes("type");
    if (!isPhone)
        throw new ApiErrors_1.default(404, "Invalid USSD phone!");
    if (!isAmount)
        throw new ApiErrors_1.default(404, "Invalid USSD amount!");
    if (sim.type === "GRAMEENPHONE" && !isType)
        throw new ApiErrors_1.default(404, "Invalid USSD type!");
    const result = yield prisma_1.default.sim_client.update({
        where: { id: id },
        data: {
            recharge_ussd: code,
        },
    });
    return result;
});
const toggleActiveOTPSim = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const sim = yield prisma_1.default.sim_client.findUnique({ where: { id: id } });
    if (!sim)
        throw new ApiErrors_1.default(404, "Invalid sim ID!");
    const result = yield prisma_1.default.sim_client.update({
        where: {
            id,
        },
        data: {
            sms: sim.sms ? false : true,
        },
    });
    return result;
});
const createBanner = (req, file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file)
        throw new ApiErrors_1.default(404, "Image file required!");
    const fileUrl = (0, generateFileUrl_1.generateFileUrl)(req, file.path);
    const result = yield prisma_1.default.banner.create({
        data: {
            imageUrl: fileUrl,
        },
    });
    return result;
});
const getBanner = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.banner.findMany();
    return result;
});
const makeContact = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.contacts.create({
        data: Object.assign({}, payload),
    });
    return result;
});
const deleteBanner = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.banner.delete({
        where: { id },
    });
    return result;
});
const getContacts = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (options = {}) {
    const page = Number(options.page) > 0 ? Number(options.page) : 1;
    const limit = Number(options.limit) > 0 ? Number(options.limit) : 10;
    const skip = (page - 1) * limit;
    const [data, total] = yield prisma_1.default.$transaction([
        prisma_1.default.contacts.findMany({
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma_1.default.contacts.count(),
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
const BD_TZ = "Asia/Dhaka";
const getBDDateStr = (d = new Date()) => new Intl.DateTimeFormat("en-CA", {
    timeZone: BD_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
}).format(d); // "YYYY-MM-DD"
const addDays = (isoWithOffset, days) => {
    const dt = new Date(isoWithOffset);
    return new Date(dt.getTime() + days * 24 * 60 * 60 * 1000);
};
const bdRangeUTC = (period) => {
    const today = getBDDateStr(); // "YYYY-MM-DD"
    const [yStr, mStr, dStr] = today.split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    const d = Number(dStr);
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
        throw new Error(`Invalid BD date string: ${today}`);
    }
    let start;
    let end;
    if (period === "day") {
        start = new Date(`${today}T00:00:00+06:00`);
        end = addDays(`${today}T00:00:00+06:00`, 1);
    }
    else if (period === "month") {
        const startStr = `${yStr}-${mStr}-01`;
        start = new Date(`${startStr}T00:00:00+06:00`);
        // next month
        const nextMonth = m === 12 ? 1 : m + 1;
        const nextYear = m === 12 ? y + 1 : y;
        const nextMonthStr = String(nextMonth).padStart(2, "0");
        const nextStartStr = `${nextYear}-${nextMonthStr}-01`;
        end = new Date(`${nextStartStr}T00:00:00+06:00`);
    }
    else {
        const startStr = `${yStr}-01-01`;
        const nextStartStr = `${y + 1}-01-01`;
        start = new Date(`${startStr}T00:00:00+06:00`);
        end = new Date(`${nextStartStr}T00:00:00+06:00`);
    }
    return { start: start.toISOString(), end: end.toISOString() };
};
const adminOverview = (period) => __awaiter(void 0, void 0, void 0, function* () {
    // 🔹 Determine date filter
    var _a, _b, _c, _d, _e, _f;
    const { start, end } = bdRangeUTC(period);
    const dateFilter = {
        gte: start,
        lt: end,
    };
    // 💰 Credit (Add money)
    const approvedCredit = yield prisma_1.default.credit_list.findMany({
        where: { status: "APPROVED", createdAt: dateFilter },
        select: { amount: true },
    });
    const totalAddMoney = (_a = approvedCredit.reduce((acc, val) => acc + parseFloat(val.amount), 0)) !== null && _a !== void 0 ? _a : 0;
    // 💸 Debit (Cashout)
    const approvedDebit = yield prisma_1.default.debit_list.findMany({
        where: { status: "APPROVED", createdAt: dateFilter },
        select: { amount: true },
    });
    const totalCashout = (_b = approvedDebit.reduce((acc, val) => acc + parseFloat(val.amount), 0)) !== null && _b !== void 0 ? _b : 0;
    // ⏳ Pending amounts
    const [pendingCredit, pendingDebit, pendingBill] = yield Promise.all([
        prisma_1.default.credit_list.findMany({
            where: { status: "PENDING", createdAt: dateFilter },
            select: { amount: true },
        }),
        prisma_1.default.debit_list.findMany({
            where: { status: "PENDING", createdAt: dateFilter },
            select: { amount: true },
        }),
        prisma_1.default.bill_history.findMany({
            where: { status: "PENDING", createdAt: dateFilter },
            select: { amount: true },
        }),
    ]);
    const pendingAmount = ((_c = pendingCredit.reduce((acc, val) => acc + parseFloat(val.amount), 0)) !== null && _c !== void 0 ? _c : 0) +
        ((_d = pendingDebit.reduce((acc, val) => acc + parseFloat(val.amount), 0)) !== null && _d !== void 0 ? _d : 0) +
        ((_e = pendingBill.reduce((acc, d) => acc + d.amount, 0)) !== null && _e !== void 0 ? _e : 0);
    // 🔁 Recharge
    const recharge = yield prisma_1.default.rechargeRequest.aggregate({
        where: { status: "SUCCESS", createdAt: dateFilter },
        _sum: { amount: true },
    });
    const totalRecharge = (_f = recharge._sum.amount) !== null && _f !== void 0 ? _f : 0;
    // 👤 Users (all-time, usually no need to filter by period)
    const [totalUser, activeUser, currentBalance] = yield Promise.all([
        prisma_1.default.user.count(),
        prisma_1.default.user.count({ where: { status: "ACTIVE" } }),
        prisma_1.default.user.findMany({
            where: { status: "ACTIVE" },
            select: { balance: true },
        }),
    ]);
    const blockUser = totalUser - activeUser;
    // 📦 Active packages
    const totalPackageActive = yield prisma_1.default.package_buyers.count();
    // 📊 Recharge summary by network
    const recharge_summery = yield Promise.all(network_list.map((type) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const sum = yield prisma_1.default.rechargeRequest.aggregate({
            where: { status: "SUCCESS", network_type: type, createdAt: dateFilter },
            _sum: { amount: true },
        });
        return { network: type, amount: (_a = sum._sum.amount) !== null && _a !== void 0 ? _a : 0 };
    })));
    // 🎁 Offer summary by network
    const offer_summery = yield Promise.all(network_list.map((type) => __awaiter(void 0, void 0, void 0, function* () {
        const count = yield prisma_1.default.rechargeOffers.count({
            where: { network_type: type },
        });
        return { network: type, totalOffer: count };
    })));
    return {
        period,
        totalAddMoney,
        totalCashout,
        pendingAmount,
        currentBalance: currentBalance.reduce((acc, i) => acc + i.balance, 0),
        totalRecharge,
        totalUser,
        activeUser,
        blockUser,
        totalPackageActive,
        recharge_summery,
        offer_summery,
    };
});
const userOverview = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, sort = "day") {
    var _a, _b, _c, _d, _e;
    // 📅 Date range
    const { start: from, end: to } = bdRangeUTC(sort);
    // 💳 Recharge overview
    const recharge = yield prisma_1.default.rechargeRequest.aggregate({
        where: {
            status: "SUCCESS",
            userId,
            createdAt: {
                gte: from,
                lte: to,
            },
        },
        _sum: {
            amount: true,
            bonus: true,
        },
    });
    const totalRecharge = (_a = recharge._sum.amount) !== null && _a !== void 0 ? _a : 0;
    const totalCommission = (_b = recharge._sum.bonus) !== null && _b !== void 0 ? _b : 0;
    // 🛒 Sales overview
    const sales = yield prisma_1.default.sales.aggregate({
        where: {
            userId,
            createdAt: {
                gte: from,
                lte: to,
            },
        },
        _sum: {
            total: true,
            paid: true,
            due: true,
        },
    });
    const sells = (_c = sales._sum.total) !== null && _c !== void 0 ? _c : 0;
    const earning = (_d = sales._sum.paid) !== null && _d !== void 0 ? _d : 0;
    const due = (_e = sales._sum.due) !== null && _e !== void 0 ? _e : 0;
    // 📦 Product count
    const totalProduct = yield prisma_1.default.products.count();
    return {
        totalProduct,
        totalRecharge,
        totalCommission,
        [sort]: {
            earning,
            sells,
            due,
        },
    };
});
exports.userOverview = userOverview;
exports.SystemService = {
    toggleActiveOTPSim,
    updateUssdCode,
    getSimInfos,
    getContacts,
    makeContact,
    getBanner,
    createBanner,
    deleteBanner,
    adminOverview,
    userOverview: exports.userOverview,
};
