import { Request } from "express";
import ApiError from "../../../errors/ApiErrors";
import { contactWhereInput } from "../../../generated/prisma/models";
import { generateFileUrl } from "../../../helpars/generateFileUrl";
import prisma from "../../../shared/prisma";
import { ContactInput, ContactValidation } from "./Contact.validation";

const createContact = async (payload: ContactInput) => {
  const result = await prisma.contact.create({
    data: payload,
  });

  return result;
};

const getAllContacts = async (query: any) => {
  const { searchTerm, page = 1, limit = 10 } = query;

  const skip = (page - 1) * limit;

  const whereCondition: contactWhereInput = {};

  if (searchTerm) {
    whereCondition.name = {
      contains: searchTerm,
    };
  }

  const contacts = await prisma.contact.findMany({
    where: whereCondition,
    skip: Number(skip),
    take: Number(limit),
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.contact.count({
    where: whereCondition,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: contacts,
  };
};
const createMerchant = async (req: Request) => {
  const body = req.body;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  // optional files
  const tradeUrl = files?.trade?.[0]
    ? generateFileUrl(req, files.trade[0].path)
    : null;

  const tinUrl = files?.tin?.[0]
    ? generateFileUrl(req, files.tin[0].path)
    : null;

  const nidUrl = files?.nid?.[0]
    ? generateFileUrl(req, files.nid[0].path)
    : null;

  const imageUrl = files?.image?.[0]
    ? generateFileUrl(req, files.image[0].path)
    : null;

  const payload = {
    ...body,
    trade_url: tradeUrl,
    tin_url: tinUrl,
    nid_url: nidUrl,
    image_url: imageUrl,
  };

  const data = await ContactValidation.merchantSchema.parseAsync(payload);

  const result = await prisma.merchant.create({
    data,
  });

  return result;
};
const getAllMerchant = async (query: any) => {
  const { searchTerm, page = 1, limit = 10 } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const whereCondition: any = {};

  if (searchTerm) {
    whereCondition.name = {
      contains: searchTerm,
    };
  }

  const merchants = await prisma.merchant.findMany({
    where: whereCondition,
    skip,
    take: Number(limit),
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.merchant.count({
    where: whereCondition,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: merchants,
  };
};
export const ContactService = {
  getAllContacts,
  createContact,
  createMerchant,
  getAllMerchant,
};
