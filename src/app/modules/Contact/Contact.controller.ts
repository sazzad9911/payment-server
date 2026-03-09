import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ContactService } from "./Contact.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const createContact = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.createContact(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Contact submitted successfully",
    data: result,
  });
});
const getAllContacts = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.getAllContacts(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Contacts fetched successfully",
    data: result,
  });
});
const createMerchant = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.createMerchant(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Merchant submitted successfully",
    data: result,
  });
});
const getAllMerchant = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.getAllMerchant(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Merchants fetched successfully",
    data: result,
  });
});
export const ContactController = {
  createContact,
  getAllContacts,
  createMerchant,
  getAllMerchant,
};
