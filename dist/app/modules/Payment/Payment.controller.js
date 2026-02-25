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
exports.paymentStatus = exports.submitPayment = exports.renderPaymentPage = exports.createPaymentUrl = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const Payment_service_1 = require("./Payment.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const PAYMENT_TTL_MS = 30 * 60 * 1000; // 30 minutes
const SUBMIT_TTL_MS = 2 * 60 * 1000; //  2 minutes
exports.createPaymentUrl = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Payment_service_1.PaymentService.getPaymentUrl(req.body, req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Payment URL generated successfully",
        data: result,
    });
}));
exports.renderPaymentPage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = String(req.query.token || "");
    const result = yield Payment_service_1.PaymentService.loadPaymentUi(token);
    // expiresAt for timer (use payment.createdAt if exists, otherwise now+30min)
    const baseTime = Date.now();
    const expiresAt = new Date(baseTime + PAYMENT_TTL_MS).toISOString();
    return res.render("payment", {
        site: result.site,
        bank: result.bank,
        amount: result.amount,
        token: result.token,
        payment: null,
        expiresAt,
    });
}));
exports.submitPayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, trxId } = req.body;
    const result = yield Payment_service_1.PaymentService.submitTrnxId(token, trxId);
    const baseTime = Date.now();
    const expiresAt = new Date(baseTime + SUBMIT_TTL_MS).toISOString();
    return res.render("payment", {
        site: result.site,
        bank: result.bank,
        amount: result.amount,
        token: result.token,
        payment: result.payment,
        expiresAt: expiresAt,
    });
}));
exports.paymentStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    //const token = String(req.query.token || "");
    const result = yield Payment_service_1.PaymentService.paymentStatus(id);
    return res.json({ status: result.status });
}));
