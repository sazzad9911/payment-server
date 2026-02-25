import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./Payment.validation";
import {
  createPaymentUrl,
  paymentStatus,
  renderPaymentPage,
  submitPayment,
} from "./Payment.controller";

const route = express.Router();

route.post(
  "/get-payment-url",
  validateRequest(PaymentValidation.createPaymentSchema),
  createPaymentUrl,
);
route.get("/callback", renderPaymentPage);
route.post("/submit", submitPayment);
route.get("/status/:id", paymentStatus);
export const PaymentRoute = route;
