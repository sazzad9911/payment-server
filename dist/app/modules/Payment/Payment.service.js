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
exports.PaymentService = void 0;
const jwtHelpers_1 = require("../../../helpars/jwtHelpers");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const socket_1 = require("../../../socket");
const JWT_SECRET = "PAY_SCIENTISTX_X3";
const JWT_EXPIRES_IN = "1h";
const PAYMENT_URL_BASE = "/api/v1/payment/callback";
const getPaymentUrl = (payload, req) => __awaiter(void 0, void 0, void 0, function* () {
    const site = yield prisma_1.default.sites.findUnique({
        where: {
            name: payload.name,
            password: payload.password,
            call_back_url: payload.call_back_url,
            status: "ACTIVE",
        },
    });
    const bank = yield prisma_1.default.mobile_banks.findMany({
        where: {
            bank: payload.bank,
            type: payload.type,
            isActive: true,
            status: "ACTIVE",
        },
    });
    if (!site) {
        throw new ApiErrors_1.default(404, "Site not found with the provided credentials");
    }
    if (bank.length === 0) {
        throw new ApiErrors_1.default(404, "No active bank found for the specified type and bank");
    }
    const randomBank = bank[Math.floor(Math.random() * bank.length)];
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        id: site.id,
        amount: payload.amount,
        bankId: randomBank.id,
    }, JWT_SECRET, JWT_EXPIRES_IN);
    const protocol = req.protocol;
    const host = req.get("host");
    return {
        paymentUrl: `${protocol}://${host}${PAYMENT_URL_BASE}?token=${accessToken}`,
    };
});
const loadPaymentUi = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token, JWT_SECRET);
    const { id, amount, bankId } = verifiedUser;
    const site = yield prisma_1.default.sites.findUnique({
        where: { id },
    });
    const bank = yield prisma_1.default.mobile_banks.findUnique({
        where: { id: bankId, isActive: true, status: "ACTIVE" },
    });
    if (!site) {
        throw new ApiErrors_1.default(404, "Site not found");
    }
    if (!bank) {
        throw new ApiErrors_1.default(404, "Bank not found");
    }
    return { site, amount, bank, token };
});
const submitTrnxId = (token, trxId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield loadPaymentUi(token);
    const payment = yield prisma_1.default.payment_list.create({
        data: {
            amount: Number(result.amount),
            tnx_id: trxId,
            bank_id: result.bank.id,
            site_id: result.site.id,
            status: "PENDING",
        },
        include: {
            bank: true,
        },
    });
    if (!payment)
        throw new ApiErrors_1.default(500, "Failed to create payment record");
    socket_1.io.emit("payment", payment);
    return {
        site: result.site,
        bank: result.bank,
        amount: result.amount,
        token,
        payment,
    };
});
const paymentStatus = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield prisma_1.default.payment_list.findUnique({ where: { id } });
    if (!payment)
        throw new ApiErrors_1.default(404, " Payment not found");
    console.log(payment.status);
    return { status: payment.status };
});
exports.PaymentService = {
    loadPaymentUi,
    getPaymentUrl,
    submitTrnxId,
    paymentStatus,
};
