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
exports.BalanceController = exports.bkashCallback = exports.createPayment = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const Balance_service_1 = require("./Balance.service");
const createAccountNumber = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Balance_service_1.BalanceServices.createAccountNumber(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Account number created successfully",
        data: result,
    });
}));
const deleteAccountNumber = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountId } = req.params;
    yield Balance_service_1.BalanceServices.deleteAccountNumber(accountId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Account number deleted successfully",
    });
}));
const getAccountNumber = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bank = req.params.bank;
    const account_type = req.params.account_type;
    const result = yield Balance_service_1.BalanceServices.getAccountNumber(bank, account_type);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        data: result,
        message: "Fetched successful",
    });
}));
const getAllAccountNumbers = (0, catchAsync_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Balance_service_1.BalanceServices.getAllAccountNumbers();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        data: result,
        message: "Fetched successful",
    });
}));
const createOfflineCredit = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const result = yield Balance_service_1.BalanceServices.createOfflineCredit(req.body, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Credit request submitted",
        data: result,
    });
}));
const acceptCredit = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { creditId } = req.params;
    yield Balance_service_1.BalanceServices.acceptCredit(creditId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Credit approved and balance updated",
    });
}));
const rejectCredit = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { creditId } = req.params;
    yield Balance_service_1.BalanceServices.rejectCredit(creditId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Credit rejected successfully",
    });
}));
const getAllCreditList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.role === "ADMIN" ? undefined : req.user.id;
    const result = yield Balance_service_1.BalanceServices.getAllCreditList(req.query, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        data: result.data,
        meta: result.meta,
        message: "Fetched successful",
    });
}));
const createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = req.body;
    const data = yield Balance_service_1.BalanceServices.createPaymentWithBkash(req.user.id, amount);
    res.status(200).json({
        paymentURL: data.bkashURL,
        paymentID: data.paymentID,
    });
});
exports.createPayment = createPayment;
const bkashCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { paymentID, status } = req.query;
    if (status !== "success") {
        return res.redirect(`https://api.jhotpotpay.com/api/v1/balance/failed`);
    }
    const result = yield Balance_service_1.BalanceServices.executePaymentWithBkash(paymentID);
    return res.redirect(`https://api.jhotpotpay.com/api/v1/balance/success?paymentId=${paymentID}`);
});
exports.bkashCallback = bkashCallback;
const updateOnlinePaymentConfig = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Balance_service_1.BalanceServices.updateOnlinePaymentConfig(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        data: result,
        message: "Fetched successful",
    });
}));
const getOnlinePaymentConfig = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Balance_service_1.BalanceServices.getOnlinePaymentConfig(req.params.type);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        data: result,
        message: "Fetched successful",
    });
}));
const paymentSuccessPage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Direct HTML response
    const { paymentId } = req.query;
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payment Success</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0fff0; }
        h1 { color: green; }
        p { font-size: 18px; }
        .details { margin-top: 20px; padding: 20px; border: 1px solid #ccc; display: inline-block; }
      </style>
    </head>
    <body>
      <h1>Payment Successful ✅</h1>
      <p>Thank you for your payment!</p>
    </body>
    </html>
  `;
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
}));
/**
 * GET /payment-failed
 */
const paymentFailedPage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payment Failed</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #fff0f0; }
        h1 { color: red; }
        p { font-size: 18px; }
        .details { margin-top: 20px; padding: 20px; border: 1px solid #ccc; display: inline-block; }
      </style>
    </head>
    <body>
      <h1>Payment Failed ❌</h1>
      
    </body>
    </html>
  `;
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
}));
const createDebit = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Balance_service_1.BalanceServices.createDebit(req.user.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        data: result,
        message: "Debit Created!",
    });
}));
const acceptDebit = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Balance_service_1.BalanceServices.acceptDebit(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        data: result,
        message: "Debit accepted!",
    });
}));
const rejectDebit = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Balance_service_1.BalanceServices.rejectDebit(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        data: result,
        message: "Debit rejected!",
    });
}));
const getAllDebits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.role === "ADMIN" ? undefined : req.user.id;
    const result = yield Balance_service_1.BalanceServices.getDebitList(req.query, userId);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Debit list retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
exports.BalanceController = {
    getAccountNumber,
    deleteAccountNumber,
    createAccountNumber,
    getAllAccountNumbers,
    createOfflineCredit,
    acceptCredit,
    rejectCredit,
    getAllCreditList,
    updateOnlinePaymentConfig,
    getOnlinePaymentConfig,
    paymentFailedPage,
    paymentSuccessPage,
    createDebit,
    rejectDebit,
    acceptDebit,
    getAllDebits,
};
