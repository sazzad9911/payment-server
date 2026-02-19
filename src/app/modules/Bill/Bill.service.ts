import { Request } from "express";
import { generateFileUrl } from "../../../helpars/generateFileUrl";
import { BillHistoryType, BillValidation } from "./Bill.validation";
import prisma from "../../../shared/prisma";
import {
  bill_historyWhereInput,
  billerWhereInput,
} from "../../../generated/prisma/models";
import ApiError from "../../../errors/ApiErrors";
import { sendPushMultiple } from "../../../helpars/sendPush";

const createBillCategory = async (title: string, req: Request) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(404, "File is required");
  }
  const icon = generateFileUrl(req, file.path);
  const data = await BillValidation.BillCategorySchema.parseAsync({
    title,
    icon,
  });
  const result = await prisma.bill_category.create({
    data: data,
  });
  return result;
};
const getBillCategory = async () => {
  const result = await prisma.bill_category.findMany();
  return result;
};

const deleteBillCategory = async (id: string) => {
  // optional: check existence first (better ApiError message)
  const exists = await prisma.bill_category.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!exists) {
    throw new ApiError(404, "Bill category not found");
  }

  const result = await prisma.bill_category.delete({
    where: { id },
  });

  return result;
};
const createBiller = async (name: string, categoryId: string, req: Request) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(404, "File is required");
  }
  const icon = generateFileUrl(req, file.path);
  const data = await BillValidation.BillerSchema.parseAsync({
    name,
    categoryId,
    icon,
  });
  const result = await prisma.biller.create({
    data: data,
  });
  return result;
};
const getBiller = async (query: any) => {
  const { categoryId } = query;
  const where: billerWhereInput = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }
  const result = await prisma.biller.findMany({
    where: where,
  });
  return result;
};
const deleteBiller = async (id: string) => {
  // optional: check existence first (better ApiError message)
  const exists = await prisma.biller.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exists) {
    throw new ApiError(404, "Biller not found");
  }
  const result = await prisma.biller.delete({
    where: { id },
  });
  return result;
};
const createBillHistory = async (payload: BillHistoryType, userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const totalAmount = payload.amount + 5;
  if (user.balance < totalAmount) {
    throw new ApiError(404, "Insufficient balance");
  }
  const result = await prisma.$transaction(async (tx) => {
    const billHistory = await tx.bill_history.create({
      data: { ...payload, charge: 5, userId },
      include: {
        biller: true,
      },
    });
    await tx.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: totalAmount,
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
        "New Bill Payment",
        `Bill created for ${billHistory.biller.name} — ৳${billHistory.amount}`,
      );
    }
    return billHistory;
  });
  return result;
};
const acceptBillPayment = async (billHistoryId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const billHistory = await tx.bill_history.findUnique({
      where: { id: billHistoryId },
    });

    if (!billHistory) {
      throw new ApiError(404, "Bill history not found");
    }

    if (billHistory.status !== "PENDING") {
      throw new ApiError(404, "Only pending bills can be accepted");
    }

    return tx.bill_history.update({
      where: { id: billHistoryId },
      data: {
        status: "PAID",
        // paidAt: new Date(), // optional but recommended
      },
    });
  });

  return result;
};
const rejectBillPayment = async (billHistoryId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const billHistory = await tx.bill_history.findUnique({
      where: { id: billHistoryId },
    });

    if (!billHistory) {
      throw new ApiError(404, "Bill history not found");
    }

    if (billHistory.status !== "PENDING") {
      throw new ApiError(404, "Only pending bills can be rejected");
    }

    const refundAmount = billHistory.amount + billHistory.charge; // ⚠️ match DB field name

    // 1️⃣ Update bill status
    const updatedBill = await tx.bill_history.update({
      where: { id: billHistoryId },
      data: {
        status: "REJECTED",
      },
    });

    // 2️⃣ Refund user
    await tx.user.update({
      where: { id: billHistory.userId },
      data: {
        balance: {
          increment: refundAmount,
        },
      },
    });

    return updatedBill;
  });

  return result;
};

interface GetBillHistoryOptions {
  userId?: string;
  page?: number;
  limit?: number;
}

const getBillHistory = async ({
  userId,
  page = 1,
  limit = 10,
}: GetBillHistoryOptions) => {
  const skip = (page - 1) * limit;

  const where: bill_historyWhereInput = {};

  // 🔍 filter by user
  if (userId) {
    where.userId = userId;
  }

  const [data, total] = await prisma.$transaction([
    prisma.bill_history.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        biller: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    }),
    prisma.bill_history.count({ where }),
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
export const BillService = {
  createBillCategory,
  deleteBillCategory,
  createBiller,
  deleteBiller,
  createBillHistory,
  getBillHistory,
  getBillCategory,
  getBiller,
  acceptBillPayment,
  rejectBillPayment,
};
