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
exports.UserService = void 0;
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const toggleBlockUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new ApiErrors_1.default(404, "User not found!");
    if (user.role === "ADMIN") {
        throw new ApiErrors_1.default(404, "Admin account can't block!");
    }
    const result = yield prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            status: user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE",
        },
    });
    return result;
});
const updateUser = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.update({
        where: { id: userId },
        data: Object.assign({}, payload),
    });
    return result;
});
const getUserList = (params) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (_a = params.search) === null || _a === void 0 ? void 0 : _a.trim();
    const where = {};
    // where.role = {
    //   not: {
    //     equals: "ADMIN",
    //   },
    // };
    // 🔍 Search by name or phone
    if (search) {
        where.OR = [
            {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                phone: {
                    contains: search,
                },
            },
        ];
    }
    const [data, total] = yield prisma_1.default.$transaction([
        prisma_1.default.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                status: true,
                balance: true,
                createdAt: true,
                address: true,
                _count: {
                    select: {
                        products: true,
                    },
                },
                packageBuyers: {
                    take: 1,
                    orderBy: {
                        createdAt: "desc",
                    },
                    select: {
                        package: true,
                    },
                },
            },
        }),
        prisma_1.default.user.count({ where }),
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
const addBalance = (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (amount <= 0) {
        throw new ApiErrors_1.default(400, "Amount must be greater than 0");
    }
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield tx.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (!user)
            throw new ApiErrors_1.default(404, "User not found!");
        yield tx.credit_list.create({
            data: {
                userId,
                amount: amount.toString(), // should be Decimal/number in schema
                account_number: "N/A",
                bank_name: "NA",
                online_pay: false,
                status: "APPROVED",
            },
        });
        const updatedUser = yield tx.user.update({
            where: { id: userId },
            data: {
                balance: {
                    increment: amount, // 🔥 atomic update
                },
            },
        });
        return updatedUser;
    }));
});
const cutBalance = (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (amount <= 0) {
        throw new ApiErrors_1.default(400, "Amount must be greater than 0");
    }
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield tx.user.findUnique({
            where: { id: userId },
            select: { id: true, balance: true },
        });
        if (!user)
            throw new ApiErrors_1.default(404, "User not found!");
        if (user.balance < amount)
            throw new ApiErrors_1.default(400, "Insufficient balance");
        yield tx.debit_list.create({
            data: {
                userId,
                amount: amount.toString(), // should be Decimal/number in schema
                account_number: "N/A",
                bank_name: "NA",
                status: "APPROVED",
            },
        });
        const updatedUser = yield tx.user.update({
            where: { id: userId },
            data: {
                balance: {
                    decrement: amount, // 🔥 atomic update
                },
            },
        });
        return updatedUser;
    }));
});
exports.UserService = {
    getUserList,
    updateUser,
    toggleBlockUser,
    addBalance,
    cutBalance,
};
