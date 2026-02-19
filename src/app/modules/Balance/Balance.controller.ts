import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { banks } from "../../../generated/prisma/enums";
import { BalanceServices } from "./Balance.service";
import { BankEnumType } from "./Balance.validation";

const createAccountNumber = catchAsync(async (req: Request, res: Response) => {
  const result = await BalanceServices.createAccountNumber(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Account number created successfully",
    data: result,
  });
});

const deleteAccountNumber = catchAsync(async (req: Request, res: Response) => {
  const { accountId } = req.params;
  await BalanceServices.deleteAccountNumber(accountId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Account number deleted successfully",
  });
});
const getAccountNumber = catchAsync(async (req: Request, res: Response) => {
  const bank = req.params.bank as banks;
  const account_type = req.params.account_type as string;
  const result = await BalanceServices.getAccountNumber(bank, account_type);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: "Fetched successful",
  });
});
const getAllAccountNumbers = catchAsync(
  async (_req: Request, res: Response) => {
    const result = await BalanceServices.getAllAccountNumbers();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
      message: "Fetched successful",
    });
  },
);
const createOfflineCredit = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await BalanceServices.createOfflineCredit(req.body, userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Credit request submitted",
    data: result,
  });
});
const acceptCredit = catchAsync(async (req: Request, res: Response) => {
  const { creditId } = req.params;
  await BalanceServices.acceptCredit(creditId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Credit approved and balance updated",
  });
});
const rejectCredit = catchAsync(async (req: Request, res: Response) => {
  const { creditId } = req.params;
  await BalanceServices.rejectCredit(creditId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Credit rejected successfully",
  });
});
const getAllCreditList = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.role === "ADMIN" ? undefined : req.user.id;
  const result = await BalanceServices.getAllCreditList(req.query, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result.data,
    meta: result.meta,
    message: "Fetched successful",
  });
});
export const createPayment = async (req: Request, res: Response) => {
  const { amount } = req.body;

  const data = await BalanceServices.createPaymentWithBkash(
    req.user.id,
    amount,
  );

  res.status(200).json({
    paymentURL: data.bkashURL,
    paymentID: data.paymentID,
  });
};

export const bkashCallback = async (req: Request, res: Response) => {
  const { paymentID, status } = req.query;

  if (status !== "success") {
    return res.redirect(`https://api.jhotpotpay.com/api/v1/balance/failed`);
  }

  const result = await BalanceServices.executePaymentWithBkash(
    paymentID as string,
  );
  return res.redirect(
    `https://api.jhotpotpay.com/api/v1/balance/success?paymentId=${paymentID}`,
  );
};
const updateOnlinePaymentConfig = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BalanceServices.updateOnlinePaymentConfig(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
      message: "Fetched successful",
    });
  },
);
const getOnlinePaymentConfig = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BalanceServices.getOnlinePaymentConfig(
      req.params.type as BankEnumType,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
      message: "Fetched successful",
    });
  },
);
const paymentSuccessPage = catchAsync(async (req: Request, res: Response) => {
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
});

/**
 * GET /payment-failed
 */
const paymentFailedPage = catchAsync(async (req: Request, res: Response) => {
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
});
const createDebit = catchAsync(async (req: Request, res: Response) => {
  const result = await BalanceServices.createDebit(req.user.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: "Debit Created!",
  });
});
const acceptDebit = catchAsync(async (req: Request, res: Response) => {
  const result = await BalanceServices.acceptDebit(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: "Debit accepted!",
  });
});
const rejectDebit = catchAsync(async (req: Request, res: Response) => {
  const result = await BalanceServices.rejectDebit(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: "Debit rejected!",
  });
});
const getAllDebits = async (req: Request, res: Response) => {
  const userId = req.user.role === "ADMIN" ? undefined : req.user.id;
  const result = await BalanceServices.getDebitList(req.query, userId);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Debit list retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
};
export const BalanceController = {
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
