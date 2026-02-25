import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PaymentService } from "./Payment.service";
import sendResponse from "../../../shared/sendResponse";

const PAYMENT_TTL_MS = 30 * 60 * 1000; // 30 minutes
const SUBMIT_TTL_MS = 2 * 60 * 1000; //  2 minutes

export const createPaymentUrl = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentService.getPaymentUrl(req.body, req);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Payment URL generated successfully",
      data: result,
    });
  },
);

export const renderPaymentPage = catchAsync(
  async (req: Request, res: Response) => {
    const token = String(req.query.token || "");

    const result = await PaymentService.loadPaymentUi(token);

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
  },
);
export const submitPayment = catchAsync(async (req: Request, res: Response) => {
  const { token, trxId } = req.body;
  const result = await PaymentService.submitTrnxId(token, trxId);

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
});
export const paymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  //const token = String(req.query.token || "");
  const result = await PaymentService.paymentStatus(id);

  return res.json({ status: result.status });
});
