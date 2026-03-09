import { Request } from "express";
import { generateFileUrl } from "../../../helpars/generateFileUrl";
import { SiteValidation } from "./Site.validation";
import prisma from "../../../shared/prisma";
import { SitesWhereInput } from "../../../generated/prisma/models";
import { UserStatus } from "../../../generated/prisma/enums";

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

const createSite = async (req: Request) => {
  const body = req.body;
  const file = req.file;
  if (!file) {
    throw new Error("Logo file is required");
  }
  const logoUrl = generateFileUrl(req, file.path);
  const payload = {
    ...body,
    logo_url: logoUrl,
  };
  const data = await SiteValidation.createSiteZodSchema.parseAsync(payload);
  const result = await prisma.sites.create({
    data,
  });
  return result;
};
const updateSite = async (req: Request) => {
  const { id } = req.params;
  const body = req.body;
  const file = req.file;

  // If a new logo is uploaded, use it; otherwise keep current logo_url if provided/unchanged
  const payload = {
    ...body,
    ...(file ? { logo_url: generateFileUrl(req, file.path) } : {}),
  };

  const data = await SiteValidation.createSiteZodSchema
    .partial()
    .parseAsync(payload);

  // Optional: ensure site exists first (nice error message)
  const existing = await prisma.sites.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Site not found");
  }

  const result = await prisma.sites.update({
    where: { id },
    data,
  });

  return result;
};
const deleteSite = async (req: Request) => {
  const { id } = req.params;

  const existing = await prisma.sites.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Site not found");
  }

  const result = await prisma.sites.delete({
    where: { id },
  });

  return result;
};
const getAllSites = async (req: Request) => {
  // query params: ?searchTerm=abc&page=1&limit=10&status=ACTIVE
  const searchTerm = (req.query.searchTerm as string) || "";
  const status = (req.query.status as UserStatus) || undefined;

  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const skip = (page - 1) * limit;

  const andConditions: SitesWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [{ name: { contains: searchTerm } }],
    });
  }

  if (status) {
    andConditions.push({ status });
  }

  const where = andConditions.length ? { AND: andConditions } : {};

  const [data, total] = await Promise.all([
    prisma.sites.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.sites.count({ where }),
  ]);

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPage: Math.ceil(total / limit),
  };

  return { meta, data };
};
const toggleSiteStatus = async (req: Request) => {
  const { id } = req.params;

  const site = await prisma.sites.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!site) {
    throw new Error("Site not found");
  }

  // Toggle only ACTIVE <-> BLOCKED
  const nextStatus = site.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";

  const result = await prisma.sites.update({
    where: { id },
    data: { status: nextStatus },
  });

  return result;
};
const getDashboardInfo = async () => {
  const payments = await prisma.payment_list.findMany({
    select: {
      amount: true,
      status: true,
    },
  });
  const totalRequestedBalance = payments.reduce((s, d) => s + d.amount, 0);
  const totalSuccessBalance = payments
    .filter((d) => d.status === "SUCCESS")
    .reduce((s, d) => s + d.amount, 0);
  const totalFailedBalance = payments
    .filter((d) => d.status === "FAILED")
    .reduce((s, d) => s + d.amount, 0);
  const sites = await prisma.sites.findMany({
    select: { status: true, name: true },
  });
  const activeSite = sites.filter((d) => d.status === "ACTIVE").length;
  const deactiveSite = sites.filter((d) => d.status === "BLOCKED").length;
  const totalSite = sites.length;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const paymentsToday = await prisma.payment_list.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });
  const todayPendingAmount = paymentsToday
    .filter((d) => d.status === "PENDING")
    .reduce((s, d) => s + d.amount, 0);
  const todayTransaction = paymentsToday.length;
  const todayFailedTransaction = paymentsToday.filter(
    (d) => d.status === "FAILED",
  ).length;
  return {
    totalRequestedBalance,
    totalSuccessBalance,
    totalFailedBalance,
    totalSite,
    activeSite,
    deactiveSite,
    todayPendingAmount,
    todayTransaction,
    todayFailedTransaction,
    paymentsToday,
  };
};
export const SiteService = {
  createSite,
  getAllSites,
  updateSite,
  deleteSite,
  toggleSiteStatus,
  getDashboardInfo,
};
