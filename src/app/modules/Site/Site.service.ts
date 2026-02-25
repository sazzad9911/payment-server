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

export const SiteService = {
  createSite,
  getAllSites,
  updateSite,
  deleteSite,
  toggleSiteStatus,
};
