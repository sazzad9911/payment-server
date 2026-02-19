import { Request } from "express";
import ApiError from "../../../errors/ApiErrors";
import { generateFileUrl } from "../../../helpars/generateFileUrl";
import prisma from "../../../shared/prisma";
import { ContactType } from "./System.validation";
import { network_type } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";

const network_list: network_type[] = [
  "GRAMEENPHONE",
  "ROBI",
  "AIRTEL",
  "BANGLALINK",
  "TELETALK",
  "SKITTO",
];

const getSimInfos = async () => {
  const result = await prisma.sim_client.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });
  return result;
};
const updateUssdCode = async (code: string, id: string) => {
  const sim = await prisma.sim_client.findUnique({ where: { id } });
  if (!sim) throw new ApiError(404, "Sim not found!");
  const isPhone = code.includes("phone");
  const isAmount = code.includes("amount");
  const isType = code.includes("type");
  if (!isPhone) throw new ApiError(404, "Invalid USSD phone!");
  if (!isAmount) throw new ApiError(404, "Invalid USSD amount!");
  if (sim.type === "GRAMEENPHONE" && !isType)
    throw new ApiError(404, "Invalid USSD type!");
  const result = await prisma.sim_client.update({
    where: { id: id },
    data: {
      recharge_ussd: code,
    },
  });
  return result;
};
const toggleActiveOTPSim = async (id: string) => {
  const sim = await prisma.sim_client.findUnique({ where: { id: id } });
  if (!sim) throw new ApiError(404, "Invalid sim ID!");
  const result = await prisma.sim_client.update({
    where: {
      id,
    },
    data: {
      sms: sim.sms ? false : true,
    },
  });
  return result;
};
const createBanner = async (req: Request, file: Express.Multer.File) => {
  if (!file) throw new ApiError(404, "Image file required!");
  const fileUrl = generateFileUrl(req, file.path);
  const result = await prisma.banner.create({
    data: {
      imageUrl: fileUrl,
    },
  });
  return result;
};
const getBanner = async () => {
  const result = await prisma.banner.findMany();
  return result;
};
const makeContact = async (payload: ContactType) => {
  const result = await prisma.contacts.create({
    data: {
      ...payload,
    },
  });
  return result;
};
const deleteBanner = async (id: string) => {
  const result = await prisma.banner.delete({
    where: { id },
  });
  return result;
};
interface GetContactsOptions {
  page?: number;
  limit?: number;
}

const getContacts = async (options: GetContactsOptions = {}) => {
  const page = Number(options.page) > 0 ? Number(options.page) : 1;
  const limit = Number(options.limit) > 0 ? Number(options.limit) : 10;
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.contacts.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.contacts.count(),
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
const BD_TZ = "Asia/Dhaka";

const getBDDateStr = (d = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: BD_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d); // "YYYY-MM-DD"

const addDays = (isoWithOffset: string, days: number) => {
  const dt = new Date(isoWithOffset);
  return new Date(dt.getTime() + days * 24 * 60 * 60 * 1000);
};
type SortType = "day" | "month" | "year";
const bdRangeUTC = (period: SortType) => {
  const today = getBDDateStr(); // "YYYY-MM-DD"
  const [yStr, mStr, dStr] = today.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);

  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    throw new Error(`Invalid BD date string: ${today}`);
  }

  let start: Date;
  let end: Date;

  if (period === "day") {
    start = new Date(`${today}T00:00:00+06:00`);
    end = addDays(`${today}T00:00:00+06:00`, 1);
  } else if (period === "month") {
    const startStr = `${yStr}-${mStr}-01`;
    start = new Date(`${startStr}T00:00:00+06:00`);

    // next month
    const nextMonth = m === 12 ? 1 : m + 1;
    const nextYear = m === 12 ? y + 1 : y;
    const nextMonthStr = String(nextMonth).padStart(2, "0");
    const nextStartStr = `${nextYear}-${nextMonthStr}-01`;
    end = new Date(`${nextStartStr}T00:00:00+06:00`);
  } else {
    const startStr = `${yStr}-01-01`;
    const nextStartStr = `${y + 1}-01-01`;
    start = new Date(`${startStr}T00:00:00+06:00`);
    end = new Date(`${nextStartStr}T00:00:00+06:00`);
  }

  return { start: start.toISOString(), end: end.toISOString() };
};
const adminOverview = async (period: SortType) => {
  // 🔹 Determine date filter

  const { start, end } = bdRangeUTC(period);

  const dateFilter: Prisma.DateTimeFilter = {
    gte: start,
    lt: end,
  };

  // 💰 Credit (Add money)
  const approvedCredit = await prisma.credit_list.findMany({
    where: { status: "APPROVED", createdAt: dateFilter },
    select: { amount: true },
  });

  const totalAddMoney =
    approvedCredit.reduce((acc, val) => acc + parseFloat(val.amount), 0) ?? 0;

  // 💸 Debit (Cashout)
  const approvedDebit = await prisma.debit_list.findMany({
    where: { status: "APPROVED", createdAt: dateFilter },
    select: { amount: true },
  });

  const totalCashout =
    approvedDebit.reduce((acc, val) => acc + parseFloat(val.amount), 0) ?? 0;

  // ⏳ Pending amounts
  const [pendingCredit, pendingDebit, pendingBill] = await Promise.all([
    prisma.credit_list.findMany({
      where: { status: "PENDING", createdAt: dateFilter },
      select: { amount: true },
    }),
    prisma.debit_list.findMany({
      where: { status: "PENDING", createdAt: dateFilter },
      select: { amount: true },
    }),
    prisma.bill_history.findMany({
      where: { status: "PENDING", createdAt: dateFilter },
      select: { amount: true },
    }),
  ]);

  const pendingAmount =
    (pendingCredit.reduce((acc, val) => acc + parseFloat(val.amount), 0) ?? 0) +
    (pendingDebit.reduce((acc, val) => acc + parseFloat(val.amount), 0) ?? 0) +
    (pendingBill.reduce((acc, d) => acc + d.amount, 0) ?? 0);

  // 🔁 Recharge
  const recharge = await prisma.rechargeRequest.aggregate({
    where: { status: "SUCCESS", createdAt: dateFilter },
    _sum: { amount: true },
  });

  const totalRecharge = recharge._sum.amount ?? 0;

  // 👤 Users (all-time, usually no need to filter by period)
  const [totalUser, activeUser, currentBalance] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { balance: true },
    }),
  ]);

  const blockUser = totalUser - activeUser;

  // 📦 Active packages
  const totalPackageActive = await prisma.package_buyers.count();

  // 📊 Recharge summary by network
  const recharge_summery = await Promise.all(
    network_list.map(async (type) => {
      const sum = await prisma.rechargeRequest.aggregate({
        where: { status: "SUCCESS", network_type: type, createdAt: dateFilter },
        _sum: { amount: true },
      });
      return { network: type, amount: sum._sum.amount ?? 0 };
    }),
  );

  // 🎁 Offer summary by network
  const offer_summery = await Promise.all(
    network_list.map(async (type) => {
      const count = await prisma.rechargeOffers.count({
        where: { network_type: type },
      });
      return { network: type, totalOffer: count };
    }),
  );

  return {
    period,
    totalAddMoney,
    totalCashout,
    pendingAmount,
    currentBalance: currentBalance.reduce((acc, i) => acc + i.balance, 0),
    totalRecharge,
    totalUser,
    activeUser,
    blockUser,
    totalPackageActive,
    recharge_summery,
    offer_summery,
  };
};
export const userOverview = async (userId: string, sort: SortType = "day") => {
  // 📅 Date range
  const { start: from, end: to } = bdRangeUTC(sort);

  // 💳 Recharge overview
  const recharge = await prisma.rechargeRequest.aggregate({
    where: {
      status: "SUCCESS",
      userId,
      createdAt: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      amount: true,
      bonus: true,
    },
  });

  const totalRecharge = recharge._sum.amount ?? 0;
  const totalCommission = recharge._sum.bonus ?? 0;

  // 🛒 Sales overview
  const sales = await prisma.sales.aggregate({
    where: {
      userId,
      createdAt: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      total: true,
      paid: true,
      due: true,
    },
  });

  const sells = sales._sum.total ?? 0;
  const earning = sales._sum.paid ?? 0;
  const due = sales._sum.due ?? 0;

  // 📦 Product count
  const totalProduct = await prisma.products.count();

  return {
    totalProduct,
    totalRecharge,
    totalCommission,
    [sort]: {
      earning,
      sells,
      due,
    },
  };
};
export const SystemService = {
  toggleActiveOTPSim,
  updateUssdCode,
  getSimInfos,
  getContacts,
  makeContact,
  getBanner,
  createBanner,
  deleteBanner,
  adminOverview,
  userOverview,
};
