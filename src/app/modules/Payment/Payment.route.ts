import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./Payment.validation";
import {
  createPaymentUrl,
  getPaymentList,
  paymentStatus,
  renderPaymentPage,
  submitPayment,
} from "./Payment.controller";
import auth from "../../middlewares/auth";

const route = express.Router();
route.get("/list", auth("ADMIN"), getPaymentList);
route.post(
  "/get-payment-url",
  validateRequest(PaymentValidation.createPaymentSchema),
  createPaymentUrl,
);
route.get("/callback", renderPaymentPage);
route.post("/submit", submitPayment);
route.get("/status/:id", paymentStatus);

export const PaymentRoute = route;
