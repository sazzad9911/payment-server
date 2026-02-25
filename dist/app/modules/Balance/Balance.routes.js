"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceRoutes = void 0;
const express_1 = __importDefault(require("express"));
const Balance_controller_1 = require("./Balance.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const Balance_validation_1 = require("./Balance.validation");
const router = express_1.default.Router();
router.get("/success", Balance_controller_1.BalanceController.paymentSuccessPage);
router.get("/failed", Balance_controller_1.BalanceController.paymentFailedPage);
router.post("/account", (0, auth_1.default)("ADMIN"), (0, validateRequest_1.default)(Balance_validation_1.BalanceValidation.createAccountNumberSchema), Balance_controller_1.BalanceController.createAccountNumber);
router.delete("/account/:accountId", (0, auth_1.default)("ADMIN"), Balance_controller_1.BalanceController.deleteAccountNumber);
router.get("/account/:bank/:account_type", (0, auth_1.default)(), Balance_controller_1.BalanceController.getAccountNumber);
router.get("/accounts", (0, auth_1.default)(), Balance_controller_1.BalanceController.getAllAccountNumbers);
//credit
router.post("/credit", (0, auth_1.default)(), (0, validateRequest_1.default)(Balance_validation_1.BalanceValidation.createCreditSchema), Balance_controller_1.BalanceController.createOfflineCredit);
router.get("/credits", (0, auth_1.default)(), Balance_controller_1.BalanceController.getAllCreditList);
router.patch("/credit/:creditId/accept", (0, auth_1.default)("ADMIN"), Balance_controller_1.BalanceController.acceptCredit);
router.patch("/credit/:creditId/reject", (0, auth_1.default)("ADMIN"), Balance_controller_1.BalanceController.rejectCredit);
//debit
router.post("/debit", (0, auth_1.default)(), (0, validateRequest_1.default)(Balance_validation_1.BalanceValidation.CreateDebitSchema), Balance_controller_1.BalanceController.createDebit);
router.get("/debits", (0, auth_1.default)(), Balance_controller_1.BalanceController.getAllDebits);
router.patch("/debit/:id/accept", (0, auth_1.default)("ADMIN"), (0, validateRequest_1.default)(Balance_validation_1.BalanceValidation.UpdateDebitSchema), Balance_controller_1.BalanceController.acceptDebit);
router.patch("/debit/:id/reject", (0, auth_1.default)("ADMIN"), Balance_controller_1.BalanceController.rejectDebit);
//bkash
router.post("/bkash/create", (0, auth_1.default)(), Balance_controller_1.createPayment);
router.get("/bkash/callback", Balance_controller_1.bkashCallback);
router.patch("/payment/config", (0, auth_1.default)("ADMIN"), (0, validateRequest_1.default)(Balance_validation_1.BalanceValidation.onlinePayConfigSchema), Balance_controller_1.BalanceController.updateOnlinePaymentConfig);
router.get("/payment/config/:type", (0, auth_1.default)("ADMIN"), Balance_controller_1.BalanceController.getOnlinePaymentConfig);
exports.BalanceRoutes = router;
