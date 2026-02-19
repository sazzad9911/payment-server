import express from "express";
import {
  BalanceController,
  bkashCallback,
  createPayment,
} from "./Balance.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { BalanceValidation } from "./Balance.validation";

const router = express.Router();
router.get("/success", BalanceController.paymentSuccessPage);
router.get("/failed", BalanceController.paymentFailedPage);
router.post(
  "/account",
  auth("ADMIN"),
  validateRequest(BalanceValidation.createAccountNumberSchema),
  BalanceController.createAccountNumber,
);
router.delete(
  "/account/:accountId",
  auth("ADMIN"),
  BalanceController.deleteAccountNumber,
);
router.get(
  "/account/:bank/:account_type",
  auth(),
  BalanceController.getAccountNumber,
);
router.get("/accounts", auth(), BalanceController.getAllAccountNumbers);

//credit
router.post(
  "/credit",
  auth(),
  validateRequest(BalanceValidation.createCreditSchema),
  BalanceController.createOfflineCredit,
);
router.get("/credits", auth(), BalanceController.getAllCreditList);
router.patch(
  "/credit/:creditId/accept",
  auth("ADMIN"),
  BalanceController.acceptCredit,
);
router.patch(
  "/credit/:creditId/reject",
  auth("ADMIN"),
  BalanceController.rejectCredit,
);
//debit
router.post(
  "/debit",
  auth(),
  validateRequest(BalanceValidation.CreateDebitSchema),
  BalanceController.createDebit,
);
router.get("/debits", auth(), BalanceController.getAllDebits);
router.patch(
  "/debit/:id/accept",
  auth("ADMIN"),
  validateRequest(BalanceValidation.UpdateDebitSchema),
  BalanceController.acceptDebit,
);
router.patch("/debit/:id/reject", auth("ADMIN"), BalanceController.rejectDebit);
//bkash
router.post("/bkash/create", auth(), createPayment);
router.get("/bkash/callback", bkashCallback);
router.patch(
  "/payment/config",
  auth("ADMIN"),
  validateRequest(BalanceValidation.onlinePayConfigSchema),
  BalanceController.updateOnlinePaymentConfig,
);
router.get(
  "/payment/config/:type",
  auth("ADMIN"),
  BalanceController.getOnlinePaymentConfig,
);
export const BalanceRoutes = router;
