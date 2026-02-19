import { bkashConfig } from "../../../config/bkash.config";
import { httpClient } from "../../../config/httpClient";
import ApiError from "../../../errors/ApiErrors";
import { banks } from "../../../generated/prisma/enums";
import {
  credit_listWhereInput,
  debit_listWhereInput,
} from "../../../generated/prisma/models";
import { bkashAuth } from "../../../helpars/bkashAuth";
import { sendPushMultiple } from "../../../helpars/sendPush";
import prisma from "../../../shared/prisma";
import {
  BankEnumType,
  CreateAccountNumberType,
  CreateCreditType,
  CreateDebitType,
  CreditListQuery,
  OnlinePayConfigTypes,
  UpdateDebitType,
} from "./Balance.validation";
import * as bcrypt from "bcrypt";

const createAccountNumber = async (payload: CreateAccountNumberType) => {
  const result = await prisma.account_number.create({
    data: { ...payload },
  });
  return result;
};
const deleteAccountNumber = async (accountId: string) => {
  const result = await prisma.account_number.delete({
    where: { id: accountId },
  });
  return result;
};
const getAccountNumber = async (bank: banks, account_type: string) => {
  const result = await prisma.account_number.findFirst({
    where: { bank_name: bank, account_type: account_type },
  });
  return result;
};
const getAllAccountNumbers = async () => {
  const result = await prisma.account_number.findMany({
    orderBy: { bank_name: "desc" },
  });
  return result;
};
const createOfflineCredit = async (
  payload: CreateCreditType,
  userId: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true, name: true },
  });

  if (!user) {
    throw new ApiError(404, "Invalid user");
  }

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isCorrectPassword) {
    throw new ApiError(401, "Incorrect password");
  }

  // Offline credit must have valid sender account
  if (!payload.online_pay) {
    const hasAccount = await prisma.account_number.findFirst({
      where: { account_number: payload.account_number },
    });

    if (!hasAccount) {
      throw new ApiError(400, "Invalid sender account");
    }
  }

  const result = await prisma.credit_list.create({
    data: {
      bank_name: payload.bank_name,
      account_number: payload.account_number,
      amount: payload.amount,
      transaction_id: payload.transaction_id ?? null,
      online_pay: payload.online_pay ?? false,
      status: "PENDING",
      userId: user.id,
    },
  });
  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      fcmToken: {
        not: null,
      },
    },
    select: { fcmToken: true },
  });
  const tokens = admins
    .map((d) => d.fcmToken)
    .filter((t): t is string => Boolean(t));

  if (tokens.length > 0) {
    await sendPushMultiple(
      tokens,
      "CashIn",
      `Cashin request created for ${user.name} — ৳${payload.amount}`,
    );
  }
  return result;
};
const acceptCredit = async (creditId: string) => {
  return await prisma.$transaction(async (tx) => {
    const credit = await tx.credit_list.findUnique({
      where: { id: creditId },
    });

    if (!credit) {
      throw new ApiError(404, "Credit not found");
    }

    if (credit.status !== "PENDING") {
      throw new ApiError(400, "Credit already processed");
    }

    const amount = Number(credit.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new ApiError(400, "Invalid credit amount");
    }

    // ✅ Update credit status
    await tx.credit_list.update({
      where: { id: credit.id },
      data: { status: "APPROVED" },
    });

    // ✅ Add balance to user
    await tx.user.update({
      where: { id: credit.userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    return { success: true };
  });
};
const rejectCredit = async (creditId: string) => {
  const credit = await prisma.credit_list.findUnique({
    where: { id: creditId },
  });

  if (!credit) {
    throw new ApiError(404, "Credit not found");
  }

  if (credit.status !== "PENDING") {
    throw new ApiError(400, "Credit already processed");
  }

  await prisma.credit_list.update({
    where: { id: creditId },
    data: { status: "REJECTED" },
  });

  return { success: true };
};
const getAllCreditList = async (
  query: CreditListQuery,
  userId: string | undefined,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: credit_listWhereInput = {};
  if (userId) {
    where.userId = userId;
  }

  if (query.transactionId) {
    where.transaction_id = {
      contains: query.transactionId,
      mode: "insensitive",
    };
  }

  if (query.status) {
    where.status = query.status;
  }
  if (query.userId) {
    where.userId = query.userId;
  }
  const [data, total] = await prisma.$transaction([
    prisma.credit_list.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.credit_list.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
let bkashToken: string | undefined;
const createPaymentWithBkash = async (userId: string, amount: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "Invalid user!");
  const config = await bkashConfig();
  if (!config) throw new ApiError(404, "Baksh not found!");
  const token = bkashToken ? bkashToken : await bkashAuth(config);
  bkashToken = token;

  if (!token) throw new ApiError(404, "Bkash token not found!");

  const credit = await prisma.credit_list.create({
    data: {
      account_number: user.phone,
      amount: amount.toString(),
      bank_name: "BKASH",
      online_pay: true,
      userId: user.id,
    },
  });
  const payload = {
    mode: "0011",
    payerReference: user.phone, // must be string
    callbackURL: config.callbackURL, // must be string
    //merchantAssociationInfo: user.name.replace(/\s/g, "_"), // letters/numbers/underscore
    amount: amount.toString(), // string, not number
    currency: "BDT",
    intent: "sale",
    merchantInvoiceNumber: credit.id, // unique per transaction
  };
  const res = await httpClient.post(
    `${config.baseUrl}/tokenized/checkout/create`,
    payload,
    {
      headers: {
        Authorization: token,
        "X-APP-Key": config.appKey,
      },
    },
  );
  //console.log(res.data);
  if (!res.data?.paymentID) {
    throw new ApiError(404, "Payment failed!");
  }
  return res.data;
};
const executePaymentWithBkash = async (paymentId: string) => {
  const config = await bkashConfig();
  if (!config) throw new ApiError(404, "Bkash config not found");

  const token = bkashToken || (await bkashAuth(config));
  if (!token) throw new ApiError(401, "Bkash token not found");

  const res = await httpClient.post(
    `${config.baseUrl}/tokenized/checkout/execute`,
    { paymentID: paymentId },
    {
      headers: {
        Authorization: token,
        "X-APP-Key": config.appKey,
      },
    },
  );

  // ❗ Verify bKash success
  if (res.data?.statusCode !== "0000") {
    throw new ApiError(400, res.data?.statusMessage || "Payment failed");
  }

  const inv = res.data.merchantInvoiceNumber;
  const trxId = res.data.trxID;

  // 🔐 Atomic transaction
  await prisma.$transaction(async (tx) => {
    const credit = await tx.credit_list.findUnique({
      where: { id: inv },
    });

    if (!credit) {
      throw new ApiError(404, "Credit record not found");
    }

    // 🔒 Prevent double credit
    if (credit.status === "APPROVED") {
      return;
    }

    // ✅ Update credit
    await tx.credit_list.update({
      where: { id: credit.id },
      data: {
        status: "APPROVED",
        transaction_id: trxId,
      },
    });

    // ✅ Add balance
    await tx.user.update({
      where: { id: credit.userId },
      data: {
        balance: {
          increment: Number(credit.amount),
        },
      },
    });
  });

  return res.data;
};

const updateOnlinePaymentConfig = async (payload: OnlinePayConfigTypes) => {
  const result = await prisma.online_pay_configs.upsert({
    where: { bank_name: payload.bank_name },
    create: {
      ...payload,
    },
    update: {
      ...payload,
    },
  });
  return result;
};
const getOnlinePaymentConfig = async (type: BankEnumType) => {
  const result = await prisma.online_pay_configs.findUnique({
    where: { bank_name: type },
  });
  return result;
};
const createDebit = async (userId: string, payload: CreateDebitType) => {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true, name: true },
    });

    if (!user) throw new ApiError(404, "Invalid user!");

    let charge: number = 0;

    // 2️⃣ Latest package
    const currentPackage = await tx.package_buyers.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        package: true,
      },
    });

    // 3️⃣ Limit check
    if (!currentPackage) {
      const settings = await tx.settings.findFirst();
      if (!settings) throw new ApiError(404, "Default settings not found");
      charge = (settings.cashout_charge * parseFloat(payload.amount)) / 100;
    } else {
      //check package limit
      if (currentPackage.package.isYearly) {
        const createdAt = new Date(currentPackage.createdAt);
        const expiryDate = new Date(createdAt);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        if (new Date() > expiryDate) {
          throw new ApiError(400, "Your Package has expired!");
        }
      }
      charge =
        (currentPackage.package.cashout_charge * parseFloat(payload.amount)) /
        100;
    }

    const amount = Number(payload.amount) + charge;

    if (amount <= 0) {
      throw new ApiError(400, "Invalid amount!");
    }
    if (amount < 100) {
      throw new ApiError(400, "Min cashout amount 100 BDT!");
    }

    if (amount > user.balance) {
      throw new ApiError(400, "Low balance!");
    }

    // 1️⃣ Create debit request (PENDING)
    const debit = await tx.debit_list.create({
      data: {
        ...payload,
        userId: user.id,
        charge: charge,
      },
    });

    // 2️⃣ Deduct balance (hold)
    await tx.user.update({
      where: { id: user.id },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });
    const admins = await tx.user.findMany({
      where: {
        role: "ADMIN",
        fcmToken: {
          not: null,
        },
      },
      select: { fcmToken: true },
    });
    const tokens = admins
      .map((d) => d.fcmToken)
      .filter((t): t is string => Boolean(t));

    if (tokens.length > 0) {
      await sendPushMultiple(
        tokens,
        "Cashout",
        `Cashout request created for ${user.name} — ৳${payload.amount}`,
      );
    }
    return debit;
  });
};

const acceptDebit = async (id: string, payload: UpdateDebitType) => {
  return await prisma.$transaction(async (tx) => {
    const debit = await tx.debit_list.findUnique({
      where: { id },
    });

    if (!debit) {
      throw new ApiError(404, "Debit not found");
    }

    if (debit.status !== "PENDING") {
      throw new ApiError(400, "Debit already processed");
    }

    const amount = Number(debit.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ApiError(400, "Invalid debit amount");
    }

    // 🔐 Require transaction ID on approval
    if (!payload.transaction_id) {
      throw new ApiError(400, "Transaction ID is required");
    }

    // ✅ Approve debit
    await tx.debit_list.update({
      where: { id: debit.id },
      data: {
        status: "APPROVED",
        transaction_id: payload.transaction_id,
      },
    });

    return {
      success: true,
      message: "Debit approved successfully",
    };
  });
};

const rejectDebit = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const debit = await tx.debit_list.findUnique({
      where: { id },
    });

    if (!debit) {
      throw new ApiError(404, "Debit not found");
    }

    if (debit.status !== "PENDING") {
      throw new ApiError(400, "Debit already processed");
    }

    const amount = Number(debit.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ApiError(400, "Invalid debit amount");
    }

    // ✅ Refund balance to user
    await tx.user.update({
      where: { id: debit.userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    // ✅ Update debit status
    await tx.debit_list.update({
      where: { id: debit.id },
      data: { status: "REJECTED" },
    });

    return {
      success: true,
      message: "Debit rejected and balance refunded",
    };
  });
};
interface IDebitListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
const getDebitList = async (
  params: IDebitListParams,
  userId: string | undefined,
) => {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = (page - 1) * limit;
  const search = params.search?.trim();
  const status = params.status;

  const where: debit_listWhereInput = {};

  if (userId) {
    where.userId = userId;
  }

  // 🔍 Search by account number OR transaction id
  if (search) {
    where.OR = [
      {
        account_number: {
          contains: search,
        },
      },
      {
        transaction_id: {
          contains: search,
        },
      },
    ];
  }

  // 🔎 Filter by status (optional)
  if (status) {
    where.status = status;
  }

  const [data, total] = await prisma.$transaction([
    prisma.debit_list.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        bank_name: true,
        account_number: true,
        amount: true,
        transaction_id: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    }),
    prisma.debit_list.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};
export const BalanceServices = {
  createAccountNumber,
  deleteAccountNumber,
  getAccountNumber,
  getAllAccountNumbers,
  getAllCreditList,
  rejectCredit,
  acceptCredit,
  createOfflineCredit,
  createPaymentWithBkash,
  executePaymentWithBkash,
  updateOnlinePaymentConfig,
  getOnlinePaymentConfig,
  createDebit,
  acceptDebit,
  rejectDebit,
  getDebitList,
};
