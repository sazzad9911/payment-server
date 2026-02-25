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
exports.BillService = void 0;
const generateFileUrl_1 = require("../../../helpars/generateFileUrl");
const Bill_validation_1 = require("./Bill.validation");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const sendPush_1 = require("../../../helpars/sendPush");
const createBillCategory = (title, req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file) {
        throw new ApiErrors_1.default(404, "File is required");
    }
    const icon = (0, generateFileUrl_1.generateFileUrl)(req, file.path);
    const data = yield Bill_validation_1.BillValidation.BillCategorySchema.parseAsync({
        title,
        icon,
    });
    const result = yield prisma_1.default.bill_category.create({
        data: data,
    });
    return result;
});
const getBillCategory = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.bill_category.findMany();
    return result;
});
const deleteBillCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // optional: check existence first (better ApiError message)
    const exists = yield prisma_1.default.bill_category.findUnique({
        where: { id },
        select: { id: true },
    });
    if (!exists) {
        throw new ApiErrors_1.default(404, "Bill category not found");
    }
    const result = yield prisma_1.default.bill_category.delete({
        where: { id },
    });
    return result;
});
const createBiller = (name, categoryId, req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file) {
        throw new ApiErrors_1.default(404, "File is required");
    }
    const icon = (0, generateFileUrl_1.generateFileUrl)(req, file.path);
    const data = yield Bill_validation_1.BillValidation.BillerSchema.parseAsync({
        name,
        categoryId,
        icon,
    });
    const result = yield prisma_1.default.biller.create({
        data: data,
    });
    return result;
});
const getBiller = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = query;
    const where = {};
    if (categoryId) {
        where.categoryId = categoryId;
    }
    const result = yield prisma_1.default.biller.findMany({
        where: where,
    });
    return result;
});
const deleteBiller = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // optional: check existence first (better ApiError message)
    const exists = yield prisma_1.default.biller.findUnique({
        where: { id },
        select: { id: true },
    });
    if (!exists) {
        throw new ApiErrors_1.default(404, "Biller not found");
    }
    const result = yield prisma_1.default.biller.delete({
        where: { id },
    });
    return result;
});
const createBillHistory = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiErrors_1.default(404, "User not found");
    }
    const totalAmount = payload.amount + 5;
    if (user.balance < totalAmount) {
        throw new ApiErrors_1.default(404, "Insufficient balance");
    }
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const billHistory = yield tx.bill_history.create({
            data: Object.assign(Object.assign({}, payload), { charge: 5, userId }),
            include: {
                biller: true,
            },
        });
        yield tx.user.update({
            where: { id: userId },
            data: {
                balance: {
                    decrement: totalAmount,
                },
            },
        });
        const admins = yield tx.user.findMany({
            where: {
                role: "ADMIN",
                fcmToken: {
                    not: null,
                },
            },
            select: { fcmToken: true },
        });
        const tokens = admins
            .map((d) => d.fcmToken)
            .filter((t) => Boolean(t));
        if (tokens.length > 0) {
            yield (0, sendPush_1.sendPushMultiple)(tokens, "New Bill Payment", `Bill created for ${billHistory.biller.name} — ৳${billHistory.amount}`);
        }
        return billHistory;
    }));
    return result;
});
const acceptBillPayment = (billHistoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const billHistory = yield tx.bill_history.findUnique({
            where: { id: billHistoryId },
        });
        if (!billHistory) {
            throw new ApiErrors_1.default(404, "Bill history not found");
        }
        if (billHistory.status !== "PENDING") {
            throw new ApiErrors_1.default(404, "Only pending bills can be accepted");
        }
        return tx.bill_history.update({
            where: { id: billHistoryId },
            data: {
                status: "PAID",
                // paidAt: new Date(), // optional but recommended
            },
        });
    }));
    return result;
});
const rejectBillPayment = (billHistoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const billHistory = yield tx.bill_history.findUnique({
            where: { id: billHistoryId },
        });
        if (!billHistory) {
            throw new ApiErrors_1.default(404, "Bill history not found");
        }
        if (billHistory.status !== "PENDING") {
            throw new ApiErrors_1.default(404, "Only pending bills can be rejected");
        }
        const refundAmount = billHistory.amount + billHistory.charge; // ⚠️ match DB field name
        // 1️⃣ Update bill status
        const updatedBill = yield tx.bill_history.update({
            where: { id: billHistoryId },
            data: {
                status: "REJECTED",
            },
        });
        // 2️⃣ Refund user
        yield tx.user.update({
            where: { id: billHistory.userId },
            data: {
                balance: {
                    increment: refundAmount,
                },
            },
        });
        return updatedBill;
    }));
    return result;
});
const getBillHistory = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, page = 1, limit = 10, }) {
    const skip = (page - 1) * limit;
    const where = {};
    // 🔍 filter by user
    if (userId) {
        where.userId = userId;
    }
    const [data, total] = yield prisma_1.default.$transaction([
        prisma_1.default.bill_history.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                biller: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    },
                },
            },
        }),
        prisma_1.default.bill_history.count({ where }),
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
exports.BillService = {
    createBillCategory,
    deleteBillCategory,
    createBiller,
    deleteBiller,
    createBillHistory,
    getBillHistory,
    getBillCategory,
    getBiller,
    acceptBillPayment,
    rejectBillPayment,
};
