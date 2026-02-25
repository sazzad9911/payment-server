"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.BalanceServices = void 0;
const bkash_config_1 = require("../../../config/bkash.config");
const httpClient_1 = require("../../../config/httpClient");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const bkashAuth_1 = require("../../../helpars/bkashAuth");
const sendPush_1 = require("../../../helpars/sendPush");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const bcrypt = __importStar(require("bcrypt"));
const createAccountNumber = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.account_number.create({
        data: Object.assign({}, payload),
    });
    return result;
});
const deleteAccountNumber = (accountId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.account_number.delete({
        where: { id: accountId },
    });
    return result;
});
const getAccountNumber = (bank, account_type) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.account_number.findFirst({
        where: { bank_name: bank, account_type: account_type },
    });
    return result;
});
const getAllAccountNumbers = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.account_number.findMany({
        orderBy: { bank_name: "desc" },
    });
    return result;
});
const createOfflineCredit = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true, name: true },
    });
    if (!user) {
        throw new ApiErrors_1.default(404, "Invalid user");
    }
    const isCorrectPassword = yield bcrypt.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new ApiErrors_1.default(401, "Incorrect password");
    }
    // Offline credit must have valid sender account
    if (!payload.online_pay) {
        const hasAccount = yield prisma_1.default.account_number.findFirst({
            where: { account_number: payload.account_number },
        });
        if (!hasAccount) {
            throw new ApiErrors_1.default(400, "Invalid sender account");
        }
    }
    const result = yield prisma_1.default.credit_list.create({
        data: {
            bank_name: payload.bank_name,
            account_number: payload.account_number,
            amount: payload.amount,
            transaction_id: (_a = payload.transaction_id) !== null && _a !== void 0 ? _a : null,
            online_pay: (_b = payload.online_pay) !== null && _b !== void 0 ? _b : false,
            status: "PENDING",
            userId: user.id,
        },
    });
    const admins = yield prisma_1.default.user.findMany({
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
        yield (0, sendPush_1.sendPushMultiple)(tokens, "CashIn", `Cashin request created for ${user.name} — ৳${payload.amount}`);
    }
    return result;
});
const acceptCredit = (creditId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const credit = yield tx.credit_list.findUnique({
            where: { id: creditId },
        });
        if (!credit) {
            throw new ApiErrors_1.default(404, "Credit not found");
        }
        if (credit.status !== "PENDING") {
            throw new ApiErrors_1.default(400, "Credit already processed");
        }
        const amount = Number(credit.amount);
        if (isNaN(amount) || amount <= 0) {
            throw new ApiErrors_1.default(400, "Invalid credit amount");
        }
        // ✅ Update credit status
        yield tx.credit_list.update({
            where: { id: credit.id },
            data: { status: "APPROVED" },
        });
        // ✅ Add balance to user
        yield tx.user.update({
            where: { id: credit.userId },
            data: {
                balance: {
                    increment: amount,
                },
            },
        });
        return { success: true };
    }));
});
const rejectCredit = (creditId) => __awaiter(void 0, void 0, void 0, function* () {
    const credit = yield prisma_1.default.credit_list.findUnique({
        where: { id: creditId },
    });
    if (!credit) {
        throw new ApiErrors_1.default(404, "Credit not found");
    }
    if (credit.status !== "PENDING") {
        throw new ApiErrors_1.default(400, "Credit already processed");
    }
    yield prisma_1.default.credit_list.update({
        where: { id: creditId },
        data: { status: "REJECTED" },
    });
    return { success: true };
});
const getAllCreditList = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const where = {};
    if (userId) {
        where.userId = userId;
    }
    if (query.transactionId) {
        where.transaction_id = {
            contains: query.transactionId,
            mode: "insensitive",
        };
    }
    if (query.status) {
        where.status = query.status;
    }
    if (query.userId) {
        where.userId = query.userId;
    }
    const [data, total] = yield prisma_1.default.$transaction([
        prisma_1.default.credit_list.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        }),
        prisma_1.default.credit_list.count({ where }),
    ]);
    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
});
let bkashToken;
const createPaymentWithBkash = (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new ApiErrors_1.default(404, "Invalid user!");
    const config = yield (0, bkash_config_1.bkashConfig)();
    if (!config)
        throw new ApiErrors_1.default(404, "Baksh not found!");
    const token = bkashToken ? bkashToken : yield (0, bkashAuth_1.bkashAuth)(config);
    bkashToken = token;
    if (!token)
        throw new ApiErrors_1.default(404, "Bkash token not found!");
    const credit = yield prisma_1.default.credit_list.create({
        data: {
            account_number: user.phone,
            amount: amount.toString(),
            bank_name: "BKASH",
            online_pay: true,
            userId: user.id,
        },
    });
    const payload = {
        mode: "0011",
        payerReference: user.phone, // must be string
        callbackURL: config.callbackURL, // must be string
        //merchantAssociationInfo: user.name.replace(/\s/g, "_"), // letters/numbers/underscore
        amount: amount.toString(), // string, not number
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: credit.id, // unique per transaction
    };
    const res = yield httpClient_1.httpClient.post(`${config.baseUrl}/tokenized/checkout/create`, payload, {
        headers: {
            Authorization: token,
            "X-APP-Key": config.appKey,
        },
    });
    //console.log(res.data);
    if (!((_a = res.data) === null || _a === void 0 ? void 0 : _a.paymentID)) {
        throw new ApiErrors_1.default(404, "Payment failed!");
    }
    return res.data;
});
const executePaymentWithBkash = (paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const config = yield (0, bkash_config_1.bkashConfig)();
    if (!config)
        throw new ApiErrors_1.default(404, "Bkash config not found");
    const token = bkashToken || (yield (0, bkashAuth_1.bkashAuth)(config));
    if (!token)
        throw new ApiErrors_1.default(401, "Bkash token not found");
    const res = yield httpClient_1.httpClient.post(`${config.baseUrl}/tokenized/checkout/execute`, { paymentID: paymentId }, {
        headers: {
            Authorization: token,
            "X-APP-Key": config.appKey,
        },
    });
    // ❗ Verify bKash success
    if (((_a = res.data) === null || _a === void 0 ? void 0 : _a.statusCode) !== "0000") {
        throw new ApiErrors_1.default(400, ((_b = res.data) === null || _b === void 0 ? void 0 : _b.statusMessage) || "Payment failed");
    }
    const inv = res.data.merchantInvoiceNumber;
    const trxId = res.data.trxID;
    // 🔐 Atomic transaction
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const credit = yield tx.credit_list.findUnique({
            where: { id: inv },
        });
        if (!credit) {
            throw new ApiErrors_1.default(404, "Credit record not found");
        }
        // 🔒 Prevent double credit
        if (credit.status === "APPROVED") {
            return;
        }
        // ✅ Update credit
        yield tx.credit_list.update({
            where: { id: credit.id },
            data: {
                status: "APPROVED",
                transaction_id: trxId,
            },
        });
        // ✅ Add balance
        yield tx.user.update({
            where: { id: credit.userId },
            data: {
                balance: {
                    increment: Number(credit.amount),
                },
            },
        });
    }));
    return res.data;
});
const updateOnlinePaymentConfig = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.online_pay_configs.upsert({
        where: { bank_name: payload.bank_name },
        create: Object.assign({}, payload),
        update: Object.assign({}, payload),
    });
    return result;
});
const getOnlinePaymentConfig = (type) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.online_pay_configs.findUnique({
        where: { bank_name: type },
    });
    return result;
});
const createDebit = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield tx.user.findUnique({
            where: { id: userId },
            select: { id: true, balance: true, name: true },
        });
        if (!user)
            throw new ApiErrors_1.default(404, "Invalid user!");
        let charge = 0;
        // 2️⃣ Latest package
        const currentPackage = yield tx.package_buyers.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                package: true,
            },
        });
        // 3️⃣ Limit check
        if (!currentPackage) {
            const settings = yield tx.settings.findFirst();
            if (!settings)
                throw new ApiErrors_1.default(404, "Default settings not found");
            charge = (settings.cashout_charge * parseFloat(payload.amount)) / 100;
        }
        else {
            //check package limit
            if (currentPackage.package.isYearly) {
                const createdAt = new Date(currentPackage.createdAt);
                const expiryDate = new Date(createdAt);
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                if (new Date() > expiryDate) {
                    throw new ApiErrors_1.default(400, "Your Package has expired!");
                }
            }
            charge =
                (currentPackage.package.cashout_charge * parseFloat(payload.amount)) /
                    100;
        }
        const amount = Number(payload.amount) + charge;
        if (amount <= 0) {
            throw new ApiErrors_1.default(400, "Invalid amount!");
        }
        if (amount < 100) {
            throw new ApiErrors_1.default(400, "Min cashout amount 100 BDT!");
        }
        if (amount > user.balance) {
            throw new ApiErrors_1.default(400, "Low balance!");
        }
        // 1️⃣ Create debit request (PENDING)
        const debit = yield tx.debit_list.create({
            data: Object.assign(Object.assign({}, payload), { userId: user.id, charge: charge }),
        });
        // 2️⃣ Deduct balance (hold)
        yield tx.user.update({
            where: { id: user.id },
            data: {
                balance: {
                    decrement: amount,
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
            yield (0, sendPush_1.sendPushMultiple)(tokens, "Cashout", `Cashout request created for ${user.name} — ৳${payload.amount}`);
        }
        return debit;
    }));
});
const acceptDebit = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const debit = yield tx.debit_list.findUnique({
            where: { id },
        });
        if (!debit) {
            throw new ApiErrors_1.default(404, "Debit not found");
        }
        if (debit.status !== "PENDING") {
            throw new ApiErrors_1.default(400, "Debit already processed");
        }
        const amount = Number(debit.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new ApiErrors_1.default(400, "Invalid debit amount");
        }
        // 🔐 Require transaction ID on approval
        if (!payload.transaction_id) {
            throw new ApiErrors_1.default(400, "Transaction ID is required");
        }
        // ✅ Approve debit
        yield tx.debit_list.update({
            where: { id: debit.id },
            data: {
                status: "APPROVED",
                transaction_id: payload.transaction_id,
            },
        });
        return {
            success: true,
            message: "Debit approved successfully",
        };
    }));
});
const rejectDebit = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const debit = yield tx.debit_list.findUnique({
            where: { id },
        });
        if (!debit) {
            throw new ApiErrors_1.default(404, "Debit not found");
        }
        if (debit.status !== "PENDING") {
            throw new ApiErrors_1.default(400, "Debit already processed");
        }
        const amount = Number(debit.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new ApiErrors_1.default(400, "Invalid debit amount");
        }
        // ✅ Refund balance to user
        yield tx.user.update({
            where: { id: debit.userId },
            data: {
                balance: {
                    increment: amount,
                },
            },
        });
        // ✅ Update debit status
        yield tx.debit_list.update({
            where: { id: debit.id },
            data: { status: "REJECTED" },
        });
        return {
            success: true,
            message: "Debit rejected and balance refunded",
        };
    }));
});
const getDebitList = (params, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (_a = params.search) === null || _a === void 0 ? void 0 : _a.trim();
    const status = params.status;
    const where = {};
    if (userId) {
        where.userId = userId;
    }
    // 🔍 Search by account number OR transaction id
    if (search) {
        where.OR = [
            {
                account_number: {
                    contains: search,
                },
            },
            {
                transaction_id: {
                    contains: search,
                },
            },
        ];
    }
    // 🔎 Filter by status (optional)
    if (status) {
        where.status = status;
    }
    const [data, total] = yield prisma_1.default.$transaction([
        prisma_1.default.debit_list.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                bank_name: true,
                account_number: true,
                amount: true,
                transaction_id: true,
                status: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
            },
        }),
        prisma_1.default.debit_list.count({ where }),
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
exports.BalanceServices = {
    createAccountNumber,
    deleteAccountNumber,
    getAccountNumber,
    getAllAccountNumbers,
    getAllCreditList,
    rejectCredit,
    acceptCredit,
    createOfflineCredit,
    createPaymentWithBkash,
    executePaymentWithBkash,
    updateOnlinePaymentConfig,
    getOnlinePaymentConfig,
    createDebit,
    acceptDebit,
    rejectDebit,
    getDebitList,
};
