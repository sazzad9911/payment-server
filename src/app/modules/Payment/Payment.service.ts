import { Secret } from "jsonwebtoken";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import { CreatePaymentType } from "./Payment.validation";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { Request } from "express";
import { io } from "../../../socket";
import { payment_listWhereInput } from "../../../generated/prisma/models";

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
  const isPresent = await prisma.payment_list.count({
    where: {
      tnx_id: trxId,
      bank_id: result.bank.id,
      status: "SUCCESS",
    },
  });

  if (isPresent > 0) {
    throw new ApiError(400, "Transaction ID already submitted");
  }
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
  io.to(payment.bank.socketId).emit("payment", payment);
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

const getPaymentList = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = query.search || "";
  const status = query.status || undefined;
  const sortOrder = query.sort || "desc"; // asc | desc

  const whereCondition: payment_listWhereInput = {
    ...(search && {
      tnx_id: {
        contains: search,
        mode: "insensitive",
      },
    }),
    ...(status && { status }),
  };

  const [payments, total] = await Promise.all([
    prisma.payment_list.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: {
        status: sortOrder,
      },
      include: {
        bank: true,
        site: true,
      },
    }),

    prisma.payment_list.count({
      where: whereCondition,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: payments,
  };
};
export const PaymentService = {
  loadPaymentUi,
  getPaymentUrl,
  submitTrnxId,
  paymentStatus,
  getPaymentList,
};
