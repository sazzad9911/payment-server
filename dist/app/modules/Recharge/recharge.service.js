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
exports.RechargeServices = void 0;
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const sendPush_1 = require("../../../helpars/sendPush");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const socket_1 = require("../../../socket");
const createRecharge = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const user = yield tx.user.findUnique({
            where: { id: userId },
            select: { id: true, balance: true },
        });
        if (!user) {
            throw new ApiErrors_1.default(404, "Invalid user");
        }
        let baseAmount;
        let cashBack = 0;
        let auto = true;
        let offerData = null;
        // 🔹 Direct amount recharge
        if (payload.amount && !payload.offerId) {
            if (payload.amount <= 0) {
                throw new ApiErrors_1.default(400, "Invalid recharge amount");
            }
            baseAmount = payload.amount;
        }
        // 🔹 Offer-based recharge
        else if (payload.offerId) {
            const offer = yield tx.rechargeOffers.findUnique({
                where: { id: payload.offerId },
                include: { offer: true },
            });
            if (!offer) {
                throw new ApiErrors_1.default(404, "Invalid offer");
            }
            auto = offer.auto;
            offerData = offer;
            cashBack = offer.cash_back;
            baseAmount = offer.price; // ✔ amount to deduct
        }
        else {
            throw new ApiErrors_1.default(400, "Amount or offerId required");
        }
        // 🔐 Balance check
        if (user.balance < baseAmount) {
            throw new ApiErrors_1.default(402, "Insufficient Balance");
        }
        //check last recahrge
        const lastRecharge = yield tx.rechargeRequest.findFirst({
            where: {
                phone: payload.phone,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                createdAt: true,
            },
        });
        if (lastRecharge) {
            const now = new Date();
            const diffMs = now.getTime() - lastRecharge.createdAt.getTime();
            const diffMinutes = diffMs / (1000 * 60);
            if (diffMinutes < 2) {
                throw new ApiErrors_1.default(429, "Please try again after 2 minutes");
            }
        }
        // 🔹 Get current package
        const currentPackage = yield tx.package_buyers.findFirst({
            where: { userId },
            include: { package: true },
            orderBy: { createdAt: "desc" },
        });
        // 🔹 Commission %
        let commissionPercent = 0;
        if (!currentPackage) {
            const settings = yield tx.settings.findFirst();
            if (!settings) {
                throw new ApiErrors_1.default(404, "Default settings not found");
            }
            commissionPercent = (offerData === null || offerData === void 0 ? void 0 : offerData.offer) ? 0 : settings.recharge_commission;
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
            commissionPercent = (offerData === null || offerData === void 0 ? void 0 : offerData.offer)
                ? 0
                : currentPackage.package.recharge_commission;
        }
        const bonus = (baseAmount * commissionPercent) / 100;
        // 🔹 Create recharge record
        const recharge = yield tx.rechargeRequest.create({
            data: {
                network_type: payload.network_type,
                phone: payload.phone,
                sim_type: payload.sim_type,
                userId,
                amount: baseAmount,
                offerId: (_a = payload.offerId) !== null && _a !== void 0 ? _a : null,
                bonus: bonus,
            },
        });
        // 🔹 Single atomic balance update
        const newBalance = user.balance - baseAmount + bonus + cashBack;
        yield tx.user.update({
            where: { id: userId },
            data: {
                balance: newBalance,
            },
        });
        const sim = yield tx.sim_client.findUnique({
            where: {
                type: payload.network_type === "SKITTO"
                    ? "GRAMEENPHONE"
                    : payload.network_type,
                isActive: true,
            },
        });
        if (!sim)
            throw new ApiErrors_1.default(404, "Server sim not found!");
        const admins = yield tx.user.findMany({
            where: {
                role: "ADMIN",
                fcmToken: {
                    not: null,
                },
            },
            select: { fcmToken: true },
        });
        const code = offerData
            ? (_b = offerData.ussd) === null || _b === void 0 ? void 0 : _b.split("phone").join(payload.phone)
            : sim.recharge_ussd
                .split("phone")
                .join(payload.phone)
                .split("type")
                .join(payload.network_type === "SKITTO" ? "2" : "0")
                .split("amount")
                .join(baseAmount.toString());
        if (auto && code) {
            socket_1.io.to(sim.socketId).emit("ussd", {
                code: code,
                sim: sim.slot,
                id: recharge.id,
            });
        }
        const tokens = admins
            .map((d) => d.fcmToken)
            .filter((t) => Boolean(t));
        if (tokens.length > 0) {
            yield (0, sendPush_1.sendPushMultiple)(tokens, "New Recharge", `Recharge request created for ${payload.phone} — ৳${baseAmount}`);
        }
        return {
            rechargeId: recharge.id,
            deducted: baseAmount,
            bonus,
            netChange: bonus - baseAmount,
        };
    }));
});
const retryRecharge = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const request = yield prisma_1.default.rechargeRequest.findUnique({
        where: { id: id, status: "FAILED" },
        include: { offer: true },
    });
    if (!request)
        throw new ApiErrors_1.default(404, "Invalid request!");
    const sim = yield prisma_1.default.sim_client.findUnique({
        where: { type: request.network_type, isActive: true },
    });
    if (!sim)
        throw new ApiErrors_1.default(404, "Server sim not found!");
    const code = request.offer
        ? (_a = request.offer.ussd) === null || _a === void 0 ? void 0 : _a.split("phone").join(request.phone)
        : sim.recharge_ussd
            .split("phone")
            .join(request.phone)
            .split("type")
            .join(request.network_type === "SKITTO" ? "2" : "0")
            .split("amount")
            .join(request.toString());
    if (request.offer) {
        if (!request.offer.auto) {
            return request;
        }
        if (!code) {
            return request;
        }
    }
    socket_1.io.to(sim.socketId).emit("ussd", {
        code: code,
        sim: sim.slot,
        id: request.id,
    });
    return request;
});
const cancelRecharge = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const request = yield tx.rechargeRequest.findFirst({
            where: {
                id,
                status: {
                    in: ["FAILED", "PENDING"],
                }, // only FAILED PENDING can be cancelled
            },
            include: { offer: true },
        });
        if (!request) {
            throw new ApiErrors_1.default(404, "Invalid or already processed request!");
        }
        // Determine refund amount (bonus already given earlier)
        const refundAmount = request.offer
            ? request.offer.price
            : ((_a = request.amount) !== null && _a !== void 0 ? _a : 0);
        if (refundAmount <= 0) {
            throw new ApiErrors_1.default(400, "Invalid refund amount");
        }
        // Update status first to prevent double refund
        const updated = yield tx.rechargeRequest.update({
            where: { id },
            data: { status: "CANCELLED", bonus: 0 },
        });
        // Refund ONLY deducted balance
        yield tx.user.update({
            where: { id: request.userId },
            data: {
                balance: {
                    increment: refundAmount - request.bonus,
                },
            },
        });
        return Object.assign(Object.assign({}, updated), { refundedAmount: refundAmount - request.bonus });
    }));
});
const manualRechargeSuccess = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const request = yield prisma_1.default.rechargeRequest.findUnique({
        where: {
            id: id,
            status: {
                in: ["FAILED", "PENDING"],
            },
        },
    });
    if (!request)
        throw new ApiErrors_1.default(404, "Invalid request!");
    const updated = yield prisma_1.default.rechargeRequest.update({
        where: { id: id },
        data: { status: "SUCCESS" },
    });
    return updated;
});
const getRecharge = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (_a = query.search) === null || _a === void 0 ? void 0 : _a.trim();
    const where = Object.assign(Object.assign({}, (query.userId && {
        userId: query.userId,
    })), (search && {
        OR: [
            {
                phone: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                offerId: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ],
    }));
    const [data, total] = yield Promise.all([
        prisma_1.default.rechargeRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                offer: true,
                user: {
                    select: {
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
            },
        }),
        prisma_1.default.rechargeRequest.count({ where }),
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
const createOffer = (name) => __awaiter(void 0, void 0, void 0, function* () {
    if ((name === null || name === void 0 ? void 0 : name.length) > 60)
        throw new ApiErrors_1.default(400, "Offer name too long");
    const result = yield prisma_1.default.offers.create({
        data: {
            title: name,
        },
    });
    return result;
});
const deleteOffer = (offerId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.offers.delete({
        where: {
            id: offerId,
        },
    });
    return result;
});
const updateOffer = (offerId, name) => __awaiter(void 0, void 0, void 0, function* () {
    if ((name === null || name === void 0 ? void 0 : name.length) > 60)
        throw new ApiErrors_1.default(400, "Offer name too long");
    const result = yield prisma_1.default.offers.update({
        where: { id: offerId },
        data: {
            title: name,
        },
    });
    return result;
});
const getAllOffers = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.offers.findMany();
    return result;
});
const createRechargeOffer = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.rechargeOffers.create({
        data: Object.assign({}, payload),
    });
    return result;
});
const updateRechargeOffer = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.rechargeOffers.update({
        where: { id: id },
        data: Object.assign({}, payload),
    });
    return result;
});
const deleteRechargeOffer = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.rechargeOffers.delete({
        where: { id: id },
    });
    return result;
});
const getRechargeOffers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.rechargeOffers.findMany({
        where: {
            sim_type: query.sim_type,
            network_type: query.network_type,
            price: query.amount ? parseFloat(query.amount) : undefined,
        },
        include: {
            offer: true,
        },
    });
    return result;
});
const getRechargeOfferByAmount = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.rechargeOffers.findFirst({
        where: {
            sim_type: query.sim_type,
            network_type: query.network_type,
            price: parseFloat(query.amount),
        },
        include: {
            offer: true,
        },
    });
    return result;
});
exports.RechargeServices = {
    getAllOffers,
    createOffer,
    deleteOffer,
    updateOffer,
    createRecharge,
    createRechargeOffer,
    updateRechargeOffer,
    deleteRechargeOffer,
    getRechargeOffers,
    getRecharge,
    retryRecharge,
    cancelRecharge,
    manualRechargeSuccess,
    getRechargeOfferByAmount,
};
