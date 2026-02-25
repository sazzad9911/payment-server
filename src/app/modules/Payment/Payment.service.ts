import { Secret } from "jsonwebtoken";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import { CreatePaymentType } from "./Payment.validation";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { Request } from "express";
import { io } from "../../../socket";

const JWT_SECRET = "PAY_SCIENTISTX_X3";
const JWT_EXPIRES_IN = "1h";
const PAYMENT_URL_BASE = "/api/v1/payment/callback";

const getPaymentUrl = async (payload: CreatePaymentType, req: Request) => {
  const site = await prisma.sites.findUnique({
    where: {
      name: payload.name,
      password: payload.password,
      call_back_url: payload.call_back_url,
      status: "ACTIVE",
    },
  });
  const bank = await prisma.mobile_banks.findMany({
    where: {
      bank: payload.bank,
      type: payload.type,
      isActive: true,
      status: "ACTIVE",
    },
  });

  if (!site) {
    throw new ApiError(404, "Site not found with the provided credentials");
  }

  if (bank.length === 0) {
    throw new ApiError(
      404,
      "No active bank found for the specified type and bank",
    );
  }
  const randomBank = bank[Math.floor(Math.random() * bank.length)];
  const accessToken = jwtHelpers.generateToken(
    {
      id: site.id,
      amount: payload.amount,
      bankId: randomBank.id,
    },
    JWT_SECRET as Secret,
    JWT_EXPIRES_IN as string,
  );
  const protocol = req.protocol;
  const host = req.get("host");

  return {
    paymentUrl: `${protocol}://${host}${PAYMENT_URL_BASE}?token=${accessToken}`,
  };
};

const loadPaymentUi = async (token: string) => {
  const verifiedUser = jwtHelpers.verifyToken(token, JWT_SECRET as Secret);
  const { id, amount, bankId } = verifiedUser;
  const site = await prisma.sites.findUnique({
    where: { id },
  });
  const bank = await prisma.mobile_banks.findUnique({
    where: { id: bankId, isActive: true, status: "ACTIVE" },
  });
  if (!site) {
    throw new ApiError(404, "Site not found");
  }
  if (!bank) {
    throw new ApiError(404, "Bank not found");
  }
  return { site, amount, bank, token };
};
const submitTrnxId = async (token: string, trxId: string) => {
  const result = await loadPaymentUi(token);
  const payment = await prisma.payment_list.create({
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
  if (!payment) throw new ApiError(500, "Failed to create payment record");
  io.emit("payment", payment);
  return {
    site: result.site,
    bank: result.bank,
    amount: result.amount,
    token,
    payment,
  };
};
const paymentStatus = async (id: string) => {
  const payment = await prisma.payment_list.findUnique({ where: { id } });
  if (!payment) throw new ApiError(404, " Payment not found");
  console.log(payment.status);
  return { status: payment.status };
};
export const PaymentService = {
  loadPaymentUi,
  getPaymentUrl,
  submitTrnxId,
  paymentStatus,
};
